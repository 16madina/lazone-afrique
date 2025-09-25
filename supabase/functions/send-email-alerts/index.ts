import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailAlertRequest {
  type: 'new_listing' | 'price_change' | 'new_message' | 'property_match';
  recipientEmail: string;
  recipientName: string;
  data: {
    listingTitle?: string;
    listingUrl?: string;
    oldPrice?: number;
    newPrice?: number;
    senderName?: string;
    messagePreview?: string;
    location?: string;
    propertyType?: string;
  };
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const serve = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { type, recipientEmail, recipientName, data }: EmailAlertRequest = await req.json();

    console.log('Sending email alert:', { type, recipientEmail, data });

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'new_listing':
        subject = `🏠 Nouvelle propriété disponible - ${data.listingTitle}`;
        htmlContent = generateNewListingEmail(recipientName, data);
        break;

      case 'price_change':
        subject = `💰 Changement de prix - ${data.listingTitle}`;
        htmlContent = generatePriceChangeEmail(recipientName, data);
        break;

      case 'new_message':
        subject = `💬 Nouveau message de ${data.senderName}`;
        htmlContent = generateNewMessageEmail(recipientName, data);
        break;

      case 'property_match':
        subject = `🎯 Propriété correspondant à vos critères`;
        htmlContent = generatePropertyMatchEmail(recipientName, data);
        break;

      default:
        throw new Error(`Type d'alerte non supporté: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "LaZone Afrique <notifications@lazone-afrique.com>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Enregistrer l'envoi d'email dans les logs
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        email_type: type,
        subject: subject,
        status: 'sent',
        provider_response: emailResponse
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Error in send-email-alerts function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur lors de l\'envoi de l\'email'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

function generateNewListingEmail(recipientName: string, data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle propriété disponible</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E4A853, #D4941A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #E4A853; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 Nouvelle Propriété Disponible</h1>
          <p>Une propriété qui pourrait vous intéresser vient d'être publiée</p>
        </div>
        <div class="content">
          <p>Bonjour ${recipientName},</p>
          
          <p>Nous avons le plaisir de vous informer qu'une nouvelle propriété correspondant à vos critères vient d'être mise en ligne :</p>
          
          <h2>${data.listingTitle}</h2>
          <p><strong>📍 Localisation :</strong> ${data.location || 'Non spécifiée'}</p>
          <p><strong>🏡 Type :</strong> ${data.propertyType || 'Non spécifié'}</p>
          
          <p>Ne laissez pas passer cette opportunité ! Les meilleures propriétés partent vite.</p>
          
          <a href="${data.listingUrl}" class="button">Voir la Propriété</a>
          
          <p>Si cette propriété ne vous intéresse pas, vous pouvez modifier vos préférences de notification à tout moment.</p>
        </div>
        <div class="footer">
          <p>© 2024 LaZone Afrique - Votre plateforme immobilière de confiance</p>
          <p><a href="#">Se désabonner</a> | <a href="#">Modifier les préférences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePriceChangeEmail(recipientName: string, data: any): string {
  const priceChange = data.newPrice - data.oldPrice;
  const isDecrease = priceChange < 0;
  const changeIcon = isDecrease ? '📉' : '📈';
  const changeText = isDecrease ? 'diminué' : 'augmenté';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Changement de prix</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E4A853, #D4941A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .price-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .old-price { text-decoration: line-through; color: #999; }
        .new-price { color: ${isDecrease ? '#22c55e' : '#ef4444'}; font-weight: bold; font-size: 1.2em; }
        .button { display: inline-block; background: #E4A853; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${changeIcon} Changement de Prix</h1>
          <p>Le prix d'une propriété dans vos favoris a ${changeText}</p>
        </div>
        <div class="content">
          <p>Bonjour ${recipientName},</p>
          
          <p>Le prix de la propriété suivante a ${changeText} :</p>
          
          <h2>${data.listingTitle}</h2>
          
          <div class="price-box">
            <p>Ancien prix : <span class="old-price">${data.oldPrice?.toLocaleString()} FCFA</span></p>
            <p>Nouveau prix : <span class="new-price">${data.newPrice?.toLocaleString()} FCFA</span></p>
            <p><strong>Différence : ${Math.abs(priceChange).toLocaleString()} FCFA</strong></p>
          </div>
          
          ${isDecrease ? 
            '<p>🎉 Excellente nouvelle ! Le prix a baissé. C\'est peut-être le moment idéal pour faire une offre.</p>' :
            '<p>ℹ️ Le prix a augmenté. Vous pouvez toujours consulter la propriété pour plus de détails.</p>'
          }
          
          <a href="${data.listingUrl}" class="button">Voir la Propriété</a>
        </div>
        <div class="footer">
          <p>© 2024 LaZone Afrique - Votre plateforme immobilière de confiance</p>
          <p><a href="#">Se désabonner</a> | <a href="#">Modifier les préférences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewMessageEmail(recipientName: string, data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouveau message</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E4A853, #D4941A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-preview { background: white; padding: 20px; border-left: 4px solid #E4A853; margin: 20px 0; font-style: italic; }
        .button { display: inline-block; background: #E4A853; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 Nouveau Message</h1>
          <p>Vous avez reçu un nouveau message</p>
        </div>
        <div class="content">
          <p>Bonjour ${recipientName},</p>
          
          <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> :</p>
          
          <div class="message-preview">
            "${data.messagePreview}"
          </div>
          
          <p>Répondez rapidement pour maintenir un bon taux de réponse et améliorer votre réputation sur la plateforme.</p>
          
          <a href="#" class="button">Répondre au Message</a>
          
          <p><small>💡 Conseil : Les agents qui répondent dans les 2 heures ont 3x plus de chances de conclure une vente.</small></p>
        </div>
        <div class="footer">
          <p>© 2024 LaZone Afrique - Votre plateforme immobilière de confiance</p>
          <p><a href="#">Se désabonner</a> | <a href="#">Modifier les préférences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePropertyMatchEmail(recipientName: string, data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Propriété correspondante</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E4A853, #D4941A); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .match-score { background: #22c55e; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 20px 0; }
        .button { display: inline-block; background: #E4A853; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Propriété Correspondante</h1>
          <p>Une propriété parfaite pour vous !</p>
        </div>
        <div class="content">
          <p>Bonjour ${recipientName},</p>
          
          <p>Notre algorithme a trouvé une propriété qui correspond parfaitement à vos critères de recherche :</p>
          
          <h2>${data.listingTitle}</h2>
          <div class="match-score">97% de correspondance</div>
          
          <p><strong>📍 Localisation :</strong> ${data.location || 'Non spécifiée'}</p>
          <p><strong>🏡 Type :</strong> ${data.propertyType || 'Non spécifié'}</p>
          
          <p>Cette propriété répond à tous vos critères principaux. Nous vous recommandons de la consulter rapidement car elle pourrait intéresser d'autres acheteurs.</p>
          
          <a href="${data.listingUrl}" class="button">Découvrir la Propriété</a>
          
          <p><small>🤖 Cette recommandation est basée sur vos recherches précédentes et vos préférences sauvegardées.</small></p>
        </div>
        <div class="footer">
          <p>© 2024 LaZone Afrique - Votre plateforme immobilière de confiance</p>
          <p><a href="#">Se désabonner</a> | <a href="#">Modifier les préférences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(serve);