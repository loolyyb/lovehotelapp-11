import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { error } = useAuth();
  const { toast } = useToast();

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
            <img 
              src="https://dev.lovehotelaparis.com/wp-content/uploads/2020/04/logo-header-lovehotel.png" 
              alt="Love Hotel Logo" 
              className="h-12 w-auto mx-auto mb-4"
            />
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
                    inputBackground: 'white',
                    inputText: '#1a1a1a',
                    inputBorder: '#e5e7eb',
                    inputBorderHover: '#800020',
                    inputBorderFocus: '#800020',
                  },
                  space: {
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  radii: {
                    button: '0.375rem',
                    input: '0.375rem',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button hover:bg-burgundy/90 transition-colors',
                input: 'auth-input',
                label: 'text-burgundy',
                anchor: 'text-burgundy hover:text-burgundy/80',
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
                },
                sign_in: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours...",
                  social_provider_text: "Se connecter avec {{provider}}",
                  link_text: "Déjà inscrit ? Connectez-vous",
                },
                forgotten_password: {
                  email_label: "Adresse email",
                  button_label: "Réinitialiser le mot de passe",
                  loading_button_label: "Envoi en cours...",
                  link_text: "Mot de passe oublié ?",
                  confirmation_text: "Vérifiez vos emails pour réinitialiser votre mot de passe",
                },
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