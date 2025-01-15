import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";
import type { AuthError } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');
  const { toast } = useToast();

  const createProfileIfNeeded = async (userId: string) => {
    try {
      logger.info('Checking if profile exists for user:', { userId });
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        logger.info('Creating new profile for user:', { userId });
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            full_name: 'Nouveau membre',
            is_love_hotel_member: false,
            is_loolyb_holder: false,
            relationship_type: [],
            seeking: [],
            photo_urls: [],
            visibility: 'public',
            allowed_viewers: [],
            role: 'user'
          }])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        logger.info('Profile created successfully:', { newProfile });
        return newProfile;
      }

      return existingProfile;
    } catch (error: any) {
      logger.error('Error in profile creation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil. Veuillez réessayer.",
      });
      throw error;
    }
  };

  useEffect(() => {
    logger.info('Login component mounted');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed:', { event, userId: session?.user?.id });

      if (event === 'SIGNED_IN' && session) {
        try {
          await createProfileIfNeeded(session.user.id);
          toast({
            title: "Connexion réussie",
            description: "Bienvenue !",
          });
          navigate("/");
        } catch (error) {
          logger.error('Error during sign in:', error);
        }
      } else if (event === 'SIGNED_UP' && session) {
        try {
          await createProfileIfNeeded(session.user.id);
          toast({
            title: "Inscription réussie",
            description: "Bienvenue !",
          });
          navigate("/");
        } catch (error) {
          logger.error('Error during sign up:', error);
        }
      }
    });

    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Error checking session:', error);
        return;
      }
      if (session) {
        logger.info('User already logged in, redirecting');
        navigate("/");
      }
    };

    checkSession();

    return () => {
      logger.info('Login component unmounted');
      subscription.unsubscribe();
    };
  }, [navigate, toast, logger]);

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