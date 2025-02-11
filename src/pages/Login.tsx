import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');
  const { toast } = useToast();

  const createProfileIfNeeded = async (userId: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        logger.info('Creating missing profile for user', { userId });
        
        // Create new profile
        const { error: profileError } = await supabase
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
          }]);

        if (profileError) throw profileError;

        // Create initial preferences
        const { error: prefError } = await supabase
          .from('preferences')
          .insert([{
            user_id: userId,
            qualification_completed: false,
            qualification_step: 0
          }]);

        if (prefError) throw prefError;

        logger.info('Successfully created missing profile and preferences', { userId });
      }
    } catch (error) {
      logger.error('Error creating profile:', { error, userId });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil. Veuillez réessayer.",
      });
    }
  };

  useEffect(() => {
    logger.debug('Composant Login monté');
    
    const handleAuthChange = async (event: string, session: any) => {
      logger.info('Changement d\'état d\'authentification', { event, hasSession: !!session });
      
      if (event === 'SIGNED_UP' && session) {
        await createProfileIfNeeded(session.user.id);
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        });
      } else if (event === 'SIGNED_IN' && session) {
        await createProfileIfNeeded(session.user.id);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/");
      } else if (event === 'USER_UPDATED' && !session) {
        const { error } = await supabase.auth.getSession();
        if (error?.message.includes('user_already_exists')) {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.",
          });
        }
      }
    };

    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Composant Login démonté');
      subscription.unsubscribe();
    };
  }, [navigate, logger, toast]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center bg-gradient-to-b from-champagne via-rose-50 to-cream pt-12">
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
            theme="dark"
          />
        </Card>
      </div>
    </div>
  );
}
