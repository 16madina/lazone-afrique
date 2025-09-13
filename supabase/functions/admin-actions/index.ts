import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action: 'ban_user' | 'unban_user' | 'delete_listing' | 'send_email' | 'send_sms';
  targetUserId?: string;
  targetListingId?: string;
  reason?: string;
  message?: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminCheck) {
      throw new Error('Access denied - Admin privileges required');
    }

    const { action, targetUserId, targetListingId, reason, message, subject }: AdminActionRequest = await req.json();

    let result;

    switch (action) {
      case 'ban_user':
        if (!targetUserId) throw new Error('Target user ID required');
        
        // Update user profile to banned
        result = await supabase
          .from('profiles')
          .update({ banned: true })
          .eq('user_id', targetUserId);
        
        break;

      case 'unban_user':
        if (!targetUserId) throw new Error('Target user ID required');
        
        // Update user profile to unbanned
        result = await supabase
          .from('profiles')
          .update({ banned: false })
          .eq('user_id', targetUserId);
        
        break;

      case 'delete_listing':
        if (!targetListingId) throw new Error('Target listing ID required');
        
        // Delete the listing
        result = await supabase
          .from('listings')
          .delete()
          .eq('id', targetListingId);
        
        break;

      case 'send_email':
        if (!targetUserId || !message || !subject) {
          throw new Error('Target user ID, message, and subject required');
        }
        
        // Get user email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', targetUserId)
          .single();

        if (!profile?.email) {
          throw new Error('User email not found');
        }

        // Send email using Resend
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        
        const emailResult = await resend.emails.send({
          from: 'LaZone <lazoneapp@gmail.com>',
          to: [profile.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Message de l'équipe LaZone</h2>
              <p>Bonjour ${profile.full_name || 'Utilisateur'},</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p>Cordialement,<br>L'équipe LaZone</p>
            </div>
          `,
        });

        if (emailResult.error) {
          throw new Error(`Failed to send email: ${emailResult.error.message}`);
        }

        result = { success: true, emailId: emailResult.data?.id };
        break;

      case 'send_sms':
        // SMS functionality would require additional service integration
        // For now, we'll log it as an action but not actually send SMS
        result = { success: true, note: 'SMS functionality not implemented yet' };
        break;

      default:
        throw new Error('Invalid action');
    }

    // Log the admin action
    const { error: logError } = await supabase
      .from('user_actions')
      .insert({
        admin_id: user.id,
        action_type: action,
        target_user_id: targetUserId,
        target_listing_id: targetListingId,
        reason: reason || null,
        message: message || null
      });

    if (logError) {
      console.error('Error logging action:', logError);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Admin action error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);