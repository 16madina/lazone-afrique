import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Non autorisé');
    }

    const { reason } = await req.json();

    console.log(`Démarrage de la suppression du compte pour l'utilisateur: ${user.id}`);

    // 1. Créer une demande de suppression
    const { error: requestError } = await supabaseClient
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        reason: reason || 'Aucune raison fournie',
        status: 'processing'
      });

    if (requestError && !requestError.message.includes('duplicate')) {
      console.error('Erreur création demande:', requestError);
    }

    // 2. Supprimer les données utilisateur dans l'ordre
    const tables = [
      'favorites',
      'user_push_tokens',
      'email_preferences',
      'profile_views',
      'user_ratings',
      'content_reports',
      'user_blocks',
      'crm_activities',
      'crm_leads',
      'appointments',
      'conversation_participants',
      'messages',
      'listing_payments',
      'monthly_listing_usage',
      'sponsorship_transactions',
      'virtual_tours',
      'listings',
      'user_subscriptions',
      'profiles'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabaseClient
          .from(table)
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error(`Erreur suppression ${table}:`, error);
        } else {
          console.log(`✓ ${table} supprimé`);
        }
      } catch (e) {
        console.error(`Erreur table ${table}:`, e);
      }
    }

    // 3. Supprimer les fichiers storage
    const buckets = ['avatars', 'property-photos', 'property-videos'];
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabaseClient
          .storage
          .from(bucket)
          .list(user.id);

        if (files && files.length > 0) {
          const filePaths = files.map(f => `${user.id}/${f.name}`);
          await supabaseClient.storage.from(bucket).remove(filePaths);
          console.log(`✓ Fichiers ${bucket} supprimés`);
        }
      } catch (e) {
        console.error(`Erreur storage ${bucket}:`, e);
      }
    }

    // 4. Marquer la demande comme complétée
    await supabaseClient
      .from('account_deletion_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // 5. Supprimer l'utilisateur auth
    const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      console.error('Erreur suppression auth:', deleteAuthError);
      throw deleteAuthError;
    }

    console.log(`✓ Compte utilisateur ${user.id} supprimé complètement`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Compte supprimé avec succès' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erreur suppression compte:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});