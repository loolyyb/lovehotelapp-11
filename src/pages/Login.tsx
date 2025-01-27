import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-champagne via-rose-50 to-cream p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-burgundy/10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-burgundy mb-2">
              Bienvenue
            </h1>
            <p className="text-burgundy/80">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

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
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: 'Se connecter',
                  loading_button_label: 'Connexion en cours...',
                  social_provider_text: 'Se connecter avec {{provider}}',
                  link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
                },
                sign_up: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: "S'inscrire",
                  loading_button_label: 'Inscription en cours...',
                  social_provider_text: "S'inscrire avec {{provider}}",
                  link_text: "Vous avez déjà un compte ? Connectez-vous",
                },
                forgotten_password: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: 'Réinitialiser le mot de passe',
                  loading_button_label: 'Envoi en cours...',
                  link_text: 'Mot de passe oublié ?',
                },
                update_password: {
                  password_label: 'Nouveau mot de passe',
                  button_label: 'Mettre à jour le mot de passe',
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