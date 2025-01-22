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

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const emailHtml = `
      <h2>Nouvelle demande de conciergerie</h2>
      <p><strong>Type d'expérience:</strong> ${formData.experienceType}</p>
      ${formData.customExperience ? `<p><strong>Expérience personnalisée:</strong> ${formData.customExperience}</p>` : ''}
      <p><strong>Services demandés:</strong></p>
      <ul>
        ${formData.decoration ? '<li>Décoration personnalisée</li>' : ''}
        ${formData.transport ? '<li>Transport</li>' : ''}
        ${formData.playlist ? '<li>Playlist musicale</li>' : ''}
        ${formData.romanticTable ? '<li>Table dîner romantique isolé</li>' : ''}
        ${formData.customMenu ? '<li>Menu sur mesure</li>' : ''}
        ${formData.customScenario ? '<li>Scénario sur mesure</li>' : ''}
      </ul>
      ${formData.accessories ? `<p><strong>Accessoires:</strong> ${formData.accessories}</p>` : ''}
      <p><strong>Date souhaitée:</strong> ${formatDate(formData.date)}</p>
      <p><strong>Description:</strong> ${formData.description}</p>
      <h3>Coordonnées:</h3>
      <p><strong>Nom:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      ${formData.phone ? `<p><strong>Téléphone:</strong> ${formData.phone}</p>` : ''}
      <p><strong>ID Utilisateur:</strong> ${userId || 'Non connecté'}</p>
    `;

    console.log("Sending email with data:", { formData, userId });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Love Hotel <onboarding@resend.dev>",
        to: ["lovehotelaparis@gmail.com"],
        subject: `Nouvelle demande de conciergerie - ${formData.experienceType}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

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