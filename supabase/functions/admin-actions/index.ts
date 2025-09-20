import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action: 'ban_user' | 'unban_user' | 'delete_listing' | 'send_email' | 'send_sms' | 'create_package' | 'update_package' | 'free_sponsor';
  targetUserId?: string;
  targetListingId?: string;
  reason?: string;
  message?: string;
  subject?: string;
  name?: string;
  description?: string;
  duration_days?: number;
  price_usd?: number;
  features?: string[];
  packageId?: string;
  is_active?: boolean;
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

    // Enhanced authentication and authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('Missing authorization header in admin action request');
      throw new Error('Authorization header is required');
    }

    // Get user from auth token with enhanced validation
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Authentication failed');
    }

    // Enhanced admin privilege validation with security checks
    const { data: adminData, error: adminError } = await supabase
      .from('admin_roles')
      .select('*, granted_by')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      console.error('Admin privilege check failed:', {
        user_id: user.id,
        error: adminError?.message,
        timestamp: new Date().toISOString()
      });
      
      // Log unauthorized access attempt
      await supabase
        .from('user_actions')
        .insert({
          admin_id: user.id,
          action_type: 'unauthorized_admin_access_attempt',
          reason: 'Failed admin privilege validation'
        })
        .then(({ error }) => {
          if (error) console.error('Failed to log unauthorized access:', error);
        });

      throw new Error('Access denied - Admin privileges required');
    }

    // Additional security: verify admin role legitimacy
    if (adminData.granted_by === user.id) {
      console.error('Security violation: Self-granted admin attempting access:', {
        user_id: user.id,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Access denied - Invalid admin credentials');
    }

    const { action, targetUserId, targetListingId, reason, message, subject, name, description, duration_days, price_usd, features, packageId, is_active }: AdminActionRequest = await req.json();

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

      case 'create_package':
        if (!name || !duration_days || !price_usd) {
          throw new Error('Name, duration_days, and price_usd required');
        }

        result = await supabase
          .from('sponsorship_packages')
          .insert({
            name,
            description: description || '',
            duration_days,
            price_usd,
            features: features || [],
            is_active: true
          });

        break;

      case 'update_package':
        if (!packageId) throw new Error('Package ID required');

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (duration_days !== undefined) updateData.duration_days = duration_days;
        if (price_usd !== undefined) updateData.price_usd = price_usd;
        if (features !== undefined) updateData.features = features;
        if (is_active !== undefined) updateData.is_active = is_active;

        result = await supabase
          .from('sponsorship_packages')
          .update(updateData)
          .eq('id', packageId);

        break;

      case 'free_sponsor':
        if (!targetListingId || !duration_days) {
          throw new Error('Target listing ID and duration required');
        }

        const sponsoredUntil = new Date();
        sponsoredUntil.setDate(sponsoredUntil.getDate() + duration_days);

        result = await supabase
          .from('listings')
          .update({
            is_sponsored: true,
            sponsored_until: sponsoredUntil.toISOString(),
            sponsored_at: new Date().toISOString(),
            sponsor_amount: 0 // Free sponsorship
          })
          .eq('id', targetListingId);

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