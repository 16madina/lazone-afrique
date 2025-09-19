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

    // Chercher l'utilisateur par numéro de téléphone
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, user_id')
      .eq('phone', phone)
      .single()

    if (profileError || !profile) {
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
      email: profile.email,
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