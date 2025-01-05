import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center bg-gradient-to-r from-pink-50 to-rose-100 pt-12">
      <div className="w-full max-w-md px-4">
        <Card className="p-8 space-y-4">
          <h1 className="text-3xl font-playfair text-center mb-6">Se Connecter</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7C3A47',
                    brandAccent: '#96495B',
                  }
                }
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Adresse e-mail",
                  password_label: "Mot de passe",
                  email_input_placeholder: "Votre adresse e-mail",
                  password_input_placeholder: "Votre mot de passe",
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours ...",
                  social_provider_text: "Se connecter avec {{provider}}",
                  link_text: "Vous avez déjà un compte ? Connectez-vous",
                },
                sign_up: {
                  email_label: "Adresse e-mail",
                  password_label: "Mot de passe",
                  email_input_placeholder: "Votre adresse e-mail",
                  password_input_placeholder: "Votre mot de passe",
                  button_label: "S'inscrire",
                  loading_button_label: "Inscription en cours ...",
                  social_provider_text: "S'inscrire avec {{provider}}",
                  link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                },
                forgotten_password: {
                  email_label: "Adresse e-mail",
                  password_label: "Mot de passe",
                  email_input_placeholder: "Votre adresse e-mail",
                  button_label: "Envoyer les instructions",
                  loading_button_label: "Envoi des instructions ...",
                  link_text: "Mot de passe oublié ?",
                },
                update_password: {
                  password_label: "Nouveau mot de passe",
                  password_input_placeholder: "Votre nouveau mot de passe",
                  button_label: "Mettre à jour le mot de passe",
                  loading_button_label: "Mise à jour du mot de passe ...",
                },
                verify_otp: {
                  email_input_label: "Adresse e-mail",
                  email_input_placeholder: "Votre adresse e-mail",
                  phone_input_label: "Numéro de téléphone",
                  phone_input_placeholder: "Votre numéro de téléphone",
                  token_input_label: "Code",
                  token_input_placeholder: "Votre code de vérification",
                  button_label: "Vérifier",
                  loading_button_label: "Vérification en cours ...",
                }
              }
            }}
            providers={[]}
            theme="light"
          />
        </Card>
      </div>
    </div>
  );
}