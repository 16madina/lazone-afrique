import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { trigger_type, user_id, listing_id } = await req.json();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', user_id)
      .single();

    if (!profile?.email) {
      throw new Error('User email not found');
    }

    let emailContent = {
      subject: '',
      body: ''
    };

    switch (trigger_type) {
      case 'new_listing':
        emailContent.subject = 'Nouvelle annonce publiée avec succès';
        emailContent.body = `Bonjour ${profile.full_name}, votre annonce a été publiée avec succès sur LaZone.`;
        break;
      case 'listing_viewed':
        emailContent.subject = 'Votre annonce a été consultée';
        emailContent.body = `Bonjour ${profile.full_name}, votre annonce a reçu une nouvelle visite.`;
        break;
      case 'appointment_booked':
        emailContent.subject = 'Nouveau rendez-vous programmé';
        emailContent.body = `Bonjour ${profile.full_name}, un nouveau rendez-vous a été programmé pour votre annonce.`;
        break;
    }

    // Here you would integrate with an email service like Resend
    console.log('Email to send:', {
      to: profile.email,
      subject: emailContent.subject,
      body: emailContent.body
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});