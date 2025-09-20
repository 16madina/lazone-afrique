import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CINETPAY-PAYMENT] ${step}${detailsStr}`);
};

interface PaymentRequest {
  amount: number;
  description: string;
  payment_type: 'sponsorship' | 'subscription' | 'paid_listing';
  related_id?: string; // listing_id pour sponsorship ou paid_listing
  package_id?: string; // pour les sponsorships
  subscription_type?: string; // pour les abonnements
  currency?: string;
  payment_method: 'ORANGE_MONEY_CI' | 'ORANGE_MONEY_SN' | 'WAVE_CI' | 'WAVE_SN' | 'MOOV_CI' | 'MTN_CI';
  phone_number: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID') || '5864334'; // Site ID par défaut pour les tests
    
    if (!cinetpayApiKey) {
      throw new Error('CINETPAY_API_KEY is not configured');
    }

    // Authentification utilisateur
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const paymentRequest: PaymentRequest = await req.json();
    logStep("Payment request received", paymentRequest);

    // Validation des données
    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!paymentRequest.phone_number || !paymentRequest.payment_method) {
      throw new Error('Phone number and payment method are required');
    }

    // Générer un transaction_id unique
    const transactionId = `${paymentRequest.payment_type}_${user.id}_${Date.now()}`;
    
    // URLs de retour
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/payment-success?transaction_id=${transactionId}`;
    const cancelUrl = `${baseUrl}/payment-cancel?transaction_id=${transactionId}`;
    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-cinetpay-payment`;

    // Préparer les données pour CinePay
    const cinetpayData = {
      apikey: cinetpayApiKey,
      site_id: cinetpaySiteId,
      transaction_id: transactionId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency || 'XOF',
      alternative_currency: 'XOF',
      description: paymentRequest.description,
      return_url: returnUrl,
      notify_url: notifyUrl,
      metadata: JSON.stringify({
        user_id: user.id,
        payment_type: paymentRequest.payment_type,
        related_id: paymentRequest.related_id,
        package_id: paymentRequest.package_id,
        subscription_type: paymentRequest.subscription_type
      }),
      customer_name: user.user_metadata?.full_name || user.email,
      customer_surname: user.user_metadata?.last_name || '',
      customer_email: user.email,
      customer_phone_number: paymentRequest.phone_number,
      customer_address: '',
      customer_city: '',
      customer_country: 'CI',
      customer_state: '',
      customer_zip_code: '',
      channels: paymentRequest.payment_method,
      lang: 'fr'
    };

    logStep("Calling CinePay API", { transactionId, amount: paymentRequest.amount });

    // Appel à l'API CinePay
    const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cinetpayData)
    });

    const cinetpayResult = await cinetpayResponse.json();
    logStep("CinePay response", cinetpayResult);

    if (!cinetpayResponse.ok || cinetpayResult.code !== '201') {
      throw new Error(`CinePay error: ${cinetpayResult.message || 'Unknown error'}`);
    }

    // Enregistrer la transaction en base
    const { error: insertError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        id: transactionId,
        user_id: user.id,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'XOF',
        payment_method: paymentRequest.payment_method,
        payment_type: paymentRequest.payment_type,
        related_id: paymentRequest.related_id,
        package_id: paymentRequest.package_id,
        subscription_type: paymentRequest.subscription_type,
        status: 'pending',
        provider: 'cinetpay',
        provider_transaction_id: cinetpayResult.data.transaction_id,
        payment_url: cinetpayResult.data.payment_url,
        description: paymentRequest.description,
        phone_number: paymentRequest.phone_number
      });

    if (insertError) {
      logStep("Database error", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    logStep("Transaction saved successfully", { transactionId });

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      payment_url: cinetpayResult.data.payment_url,
      payment_token: cinetpayResult.data.payment_token
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