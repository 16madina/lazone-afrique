import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phone, password } = await req.json()

    if (!phone || !password) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone et mot de passe requis' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Normaliser le numéro de téléphone pour la recherche
    const normalizePhone = (phoneNumber: string) => {
      // Supprimer tous les espaces, tirets et caractères spéciaux
      let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Si le numéro commence par +225, enlever le préfixe
      if (cleaned.startsWith('+225')) {
        cleaned = cleaned.substring(4);
      }
      
      // Si le numéro commence par 225, enlever le préfixe
      if (cleaned.startsWith('225')) {
        cleaned = cleaned.substring(3);
      }
      
      return cleaned;
    };

    const normalizedPhone = normalizePhone(phone);
    console.log('Numéro original:', phone);
    console.log('Numéro normalisé:', normalizedPhone);

    // Chercher l'utilisateur par numéro de téléphone (recherche flexible)
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, user_id, phone')

    if (profileError) {
      console.error('Erreur lors de la recherche:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la recherche du profil' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Trouver le profil correspondant en normalisant tous les numéros
    const matchingProfile = profiles?.find(profile => {
      if (!profile.phone) return false;
      const normalizedDbPhone = normalizePhone(profile.phone);
      console.log('Comparaison:', normalizedDbPhone, 'vs', normalizedPhone);
      return normalizedDbPhone === normalizedPhone;
    });

    if (!matchingProfile) {
      console.log('Aucun profil trouvé pour le numéro:', normalizedPhone);
      console.log('Numéros disponibles:', profiles?.map(p => p.phone));
      return new Response(
        JSON.stringify({ error: 'Aucun compte trouvé avec ce numéro de téléphone' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Utiliser l'email trouvé pour l'authentification
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: matchingProfile.email,
      password: password,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: 'Mot de passe incorrect' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        session: authData.session 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})