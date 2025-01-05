import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useLogger } from "@/hooks/useLogger";

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');

  useEffect(() => {
    logger.debug('Composant Login monté');
    
    const handleAuthChange = (event: string, session: any) => {
      logger.info('Changement d\'état d\'authentification', { event, hasSession: !!session });
      
      if (session) {
        navigate("/");
      }
    };

    // Check if user is already logged in
    supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Composant Login démonté');
    };
  }, [navigate, logger]);

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
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours...",
                  social_provider_text: "Se connecter avec {{provider}}",
                  link_text: "Vous avez déjà un compte ? Connectez-vous",
                },
                sign_up: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "S'inscrire",
                  loading_button_label: "Inscription en cours...",
                  social_provider_text: "S'inscrire avec {{provider}}",
                  link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                },
                magic_link: {
                  email_input_label: "Adresse email",
                  button_label: "Envoyer le lien magique",
                  loading_button_label: "Envoi du lien magique...",
                  link_text: "Envoyer un lien magique",
                },
                forgotten_password: {
                  email_label: "Adresse email",
                  button_label: "Réinitialiser le mot de passe",
                  loading_button_label: "Envoi des instructions...",
                  link_text: "Mot de passe oublié ?",
                },
                update_password: {
                  password_label: "Nouveau mot de passe",
                  button_label: "Mettre à jour le mot de passe",
                  loading_button_label: "Mise à jour du mot de passe...",
                },
              },
            }}
            providers={[]}
            theme="light"
          />
        </Card>
      </div>
    </div>
  );
}