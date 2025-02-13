
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string;
  message: string;
  icon_url?: string;
  target_url?: string;
  target_motivation?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configurer web-push avec les clés VAPID
    webpush.setVapidDetails(
      'mailto:' + (Deno.env.get('VAPID_CONTACT_EMAIL') ?? 'example@example.com'),
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    )

    // Récupérer les données de la notification depuis le corps de la requête
    const payload: NotificationPayload = await req.json()

    // Récupérer toutes les souscriptions
    const { data: subscriptions, error: subscriptionError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')

    if (subscriptionError) {
      throw subscriptionError
    }

    console.log(`Envoi de notifications à ${subscriptions.length} utilisateurs`)

    // Envoyer la notification à chaque souscription
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.message,
            icon: payload.icon_url,
            data: {
              url: payload.target_url,
              motivation: payload.target_motivation,
            },
          })
        )
        return { success: true, subscription }
      } catch (error) {
        console.error(`Erreur lors de l'envoi à ${subscription.endpoint}:`, error)
        
        // Si l'erreur indique que la souscription n'est plus valide, la supprimer
        if (error.statusCode === 410) {
          await supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id)
        }
        
        return { success: false, subscription, error }
      }
    })

    const results = await Promise.all(sendPromises)
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications envoyées avec succès à ${successCount} utilisateurs, ${failureCount} échecs`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
