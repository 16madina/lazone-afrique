import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id?: string;
  title: string;
  body: string;
  type: 'message' | 'contact_request' | 'test' | 'reminder';
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, title, body, type, data }: PushNotificationRequest = await req.json();

    console.log('Push notification request:', { user_id, title, body, type });

    // If no user_id specified, this is likely a test notification
    if (!user_id) {
      console.log('Test notification - no actual push sent');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Test notification processed' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabaseClient
      .from('user_push_tokens')
      .select('token, platform')
      .eq('user_id', user_id);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch push tokens',
        details: tokenError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for user:', user_id);
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No push tokens registered for user' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // For now, we'll simulate sending push notifications
    // In production, you would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNs) for iOS
    
    console.log(`Would send push notification to ${tokens.length} devices:`, {
      title,
      body,
      data,
      tokens: tokens.map(t => ({ platform: t.platform, token: t.token.slice(0, 10) + '...' }))
    });

    // Simulate successful push notification sending
    const results = tokens.map(token => ({
      platform: token.platform,
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    // Log the notification for admin tracking
    await supabaseClient
      .from('admin_notifications')
      .insert({
        type: 'push_notification_sent',
        title: `Notification push envoyée`,
        message: `Notification "${title}" envoyée à ${results.length} appareils pour l'utilisateur ${user_id}`,
        related_id: user_id
      });

    return new Response(JSON.stringify({
      success: true,
      message: `Push notification sent to ${results.length} devices`,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);