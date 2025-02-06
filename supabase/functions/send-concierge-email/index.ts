import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConciergeRequest {
  experienceType: string;
  customExperience: string;
  decoration: boolean;
  transport: boolean;
  playlist: boolean;
  romanticTable: boolean;
  customMenu: boolean;
  customScenario: boolean;
  accessories: string;
  event_date: string;
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ConciergeRequest = await req.json();
    console.log("Processing concierge request:", request);

    const services = [
      request.decoration && "Décoration",
      request.transport && "Transport",
      request.playlist && "Playlist personnalisée",
      request.romanticTable && "Table romantique",
      request.customMenu && "Menu personnalisé",
      request.customScenario && "Scénario personnalisé",
    ].filter(Boolean);

    const emailResponse = await resend.emails.send({
      from: "Love Hotel <concierge@gilleskorzec.com>",
      to: [request.email],
      subject: "Confirmation de votre demande de conciergerie",
      html: `
        <h1>Merci pour votre demande de conciergerie, ${request.firstName}!</h1>
        <p>Nous avons bien reçu votre demande et notre équipe va l'étudier dans les plus brefs délais.</p>
        
        <h2>Récapitulatif de votre demande :</h2>
        <ul>
          <li>Type d'expérience : ${request.experienceType}</li>
          ${request.customExperience ? `<li>Expérience personnalisée : ${request.customExperience}</li>` : ''}
          ${services.length > 0 ? `<li>Services demandés : ${services.join(', ')}</li>` : ''}
          ${request.accessories ? `<li>Accessoires : ${request.accessories}</li>` : ''}
          <li>Date souhaitée : ${new Date(request.event_date).toLocaleDateString('fr-FR')}</li>
          <li>Description : ${request.description}</li>
        </ul>

        <p>Nous vous contacterons prochainement pour finaliser les détails de votre expérience.</p>
        
        <p>Cordialement,<br>L'équipe de conciergerie du Love Hotel</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-concierge-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);