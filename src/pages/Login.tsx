import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { error } = useAuth();
  const { toast } = useToast();

  // Show error toast if authentication fails
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: error,
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-champagne via-rose-50 to-cream p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-burgundy/10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-burgundy mb-2">
              Bienvenue
            </h1>
            <p className="text-burgundy/80 mb-4">
              Connectez-vous ou créez un compte pour accéder à votre espace
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#800020',
                    brandAccent: '#4E0014',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Créer un compte",
                  loading_button_label: "Création en cours...",
                  social_provider_text: "S'inscrire avec {{provider}}",
                  link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                  confirmation_text: "Vérifiez vos emails pour confirmer votre inscription",
                  email_input_placeholder: "Votre adresse email",
                  password_input_placeholder: "Choisissez un mot de passe"
                },
                sign_in: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours...",
                  social_provider_text: "Se connecter avec {{provider}}",
                  link_text: "Déjà inscrit ? Connectez-vous",
                  email_input_placeholder: "Votre adresse email",
                  password_input_placeholder: "Votre mot de passe"
                },
                forgotten_password: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Réinitialiser le mot de passe",
                  loading_button_label: "Envoi en cours...",
                  link_text: "Mot de passe oublié ?",
                  confirmation_text: "Vérifiez vos emails pour réinitialiser votre mot de passe",
                  email_input_placeholder: "Votre adresse email"
                }
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;