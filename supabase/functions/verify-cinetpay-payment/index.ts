import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CINETPAY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Verification function started");

    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');

    if (!cinetpayApiKey || !cinetpaySiteId) {
      throw new Error('CINETPAY_API_KEY and CINETPAY_SITE_ID must be configured');
    }

    const { transaction_id } = await req.json();
    if (!transaction_id) {
      throw new Error('Transaction ID is required');
    }

    logStep("Verifying transaction", { transactionId: transaction_id });

    // Vérifier le statut auprès de CinePay
    const verificationData = {
      apikey: cinetpayApiKey,
      site_id: cinetpaySiteId,
      transaction_id: transaction_id
    };

    const verificationResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationData)
    });

    const verificationResult = await verificationResponse.json();
    logStep("CinePay verification response", verificationResult);

    if (!verificationResponse.ok) {
      throw new Error(`CinePay verification error: ${verificationResult.message || 'Unknown error'}`);
    }

    // Récupérer la transaction en base
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (fetchError) {
      throw new Error(`Transaction not found: ${fetchError.message}`);
    }

    logStep("Transaction found", { id: transaction.id, status: transaction.status });

    // Traitement selon le statut CinePay
    const cinetpayStatus = verificationResult.data?.status;
    let newStatus = 'pending';
    
    if (cinetpayStatus === 'ACCEPTED' && verificationResult.code === '00') {
      newStatus = 'completed';
    } else if (cinetpayStatus === 'REFUSED' || verificationResult.code === '625') {
      newStatus = 'failed';
    }

    // Mettre à jour le statut de la transaction
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        provider_response: verificationResult
      })
      .eq('id', transaction_id);

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    // Si le paiement est confirmé, effectuer les actions spécifiques
    if (newStatus === 'completed' && transaction.status !== 'completed') {
      logStep("Payment confirmed, processing actions", { 
        paymentType: transaction.payment_type,
        relatedId: transaction.related_id 
      });

      switch (transaction.payment_type) {
        case 'sponsorship':
          await processSponsorshipPayment(supabaseClient, transaction);
          break;
        case 'subscription':
          await processSubscriptionPayment(supabaseClient, transaction);
          break;
        case 'paid_listing':
          await processPaidListingPayment(supabaseClient, transaction);
          break;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      status: newStatus,
      transaction_id: transaction_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processSponsorshipPayment(supabaseClient: any, transaction: any) {
  logStep("Processing sponsorship payment", { 
    listingId: transaction.related_id,
    packageId: transaction.package_id 
  });

  // Récupérer les détails du package
  const { data: package_info, error: packageError } = await supabaseClient
    .from('sponsorship_packages')
    .select('duration_days')
    .eq('id', transaction.package_id)
    .single();

  if (packageError) {
    throw new Error(`Package not found: ${packageError.message}`);
  }

  // Calculer la date d'expiration
  const sponsoredUntil = new Date();
  sponsoredUntil.setDate(sponsoredUntil.getDate() + package_info.duration_days);

  // Mettre à jour l'annonce
  const { error: listingError } = await supabaseClient
    .from('listings')
    .update({
      is_sponsored: true,
      sponsored_until: sponsoredUntil.toISOString()
    })
    .eq('id', transaction.related_id);

  if (listingError) {
    throw new Error(`Failed to update listing: ${listingError.message}`);
  }

  // Créer l'enregistrement de transaction de sponsoring
  const { error: sponsorshipError } = await supabaseClient
    .from('sponsorship_transactions')
    .insert({
      user_id: transaction.user_id,
      listing_id: transaction.related_id,
      package_id: transaction.package_id,
      amount_paid: transaction.amount,
      payment_method: transaction.payment_method,
      status: 'approved',
      payment_transaction_id: transaction.id
    });

  if (sponsorshipError) {
    logStep("Sponsorship transaction error", sponsorshipError);
  }

  logStep("Sponsorship processed successfully");
}

async function processSubscriptionPayment(supabaseClient: any, transaction: any) {
  logStep("Processing subscription payment", { 
    userId: transaction.user_id,
    subscriptionType: transaction.subscription_type 
  });

  // Calculer la date d'expiration (30 jours pour mensuel)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Désactiver les abonnements existants
  await supabaseClient
    .from('user_subscriptions')
    .update({ is_active: false })
    .eq('user_id', transaction.user_id);

  // Créer le nouvel abonnement
  const { error: subscriptionError } = await supabaseClient
    .from('user_subscriptions')
    .insert({
      user_id: transaction.user_id,
      subscription_type: transaction.subscription_type,
      is_active: true,
      expires_at: expiresAt.toISOString(),
      payment_method: transaction.payment_method,
      amount_paid: transaction.amount,
      payment_transaction_id: transaction.id
    });

  if (subscriptionError) {
    throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
  }

  logStep("Subscription processed successfully");
}

async function processPaidListingPayment(supabaseClient: any, transaction: any) {
  logStep("Processing paid listing payment", { 
    userId: transaction.user_id,
    listingId: transaction.related_id 
  });

  // Créer l'enregistrement de paiement d'annonce
  const { error: listingPaymentError } = await supabaseClient
    .from('listing_payments')
    .insert({
      user_id: transaction.user_id,
      listing_id: transaction.related_id,
      amount: transaction.amount,
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      status: 'paid',
      payment_transaction_id: transaction.id
    });

  if (listingPaymentError) {
    throw new Error(`Failed to record listing payment: ${listingPaymentError.message}`);
  }

  // Mettre à jour l'usage mensuel
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { error: usageError } = await supabaseClient
    .from('monthly_listing_usage')
    .upsert({
      user_id: transaction.user_id,
      month: currentMonth,
      year: currentYear,
      paid_listings_used: supabaseClient.raw('COALESCE(paid_listings_used, 0) + 1')
    }, {
      onConflict: 'user_id,month,year'
    });

  if (usageError) {
    logStep("Usage update error", usageError);
  }

  logStep("Paid listing processed successfully");
}