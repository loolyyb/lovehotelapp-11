import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, userId } = await req.json();

    const emailHtml = `
      <h2>Nouvelle demande de conciergerie</h2>
      <p><strong>Type d'expérience:</strong> ${formData.experienceType}</p>
      <p><strong>Services demandés:</strong></p>
      <ul>
        ${formData.decoration ? '<li>Décoration personnalisée</li>' : ''}
        ${formData.transport ? '<li>Transport</li>' : ''}
        ${formData.playlist ? '<li>Playlist musicale</li>' : ''}
      </ul>
      ${formData.accessories ? `<p><strong>Accessoires:</strong> ${formData.accessories}</p>` : ''}
      <p><strong>Date souhaitée:</strong> ${new Date(formData.date).toLocaleDateString()}</p>
      <p><strong>Budget:</strong> ${formData.budget}€</p>
      <p><strong>Description:</strong> ${formData.description}</p>
      <h3>Coordonnées:</h3>
      <p><strong>Nom:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      ${formData.phone ? `<p><strong>Téléphone:</strong> ${formData.phone}</p>` : ''}
      <p><strong>ID Utilisateur:</strong> ${userId}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Love Hotel <concierge@lovehotel.com>",
        to: ["concierge@lovehotel.com"],
        subject: `Nouvelle demande de conciergerie - ${formData.experienceType}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
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