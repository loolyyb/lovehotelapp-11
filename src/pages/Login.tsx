
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
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!existingProfile) {
        logger.info('Creating missing profile for user', { userId });
        
        // Create new profile
        const { error: createError } = await supabase
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

        if (createError) throw createError;

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
      logger.error('Error in createProfileIfNeeded:', { error });
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
        navigate("/");
      } else if (event === 'SIGNED_IN' && session) {
        await createProfileIfNeeded(session.user.id);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    };

    // Check and handle initial session
    const checkInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Error checking initial session:', { error });
        return;
      }
      if (session) {
        navigate("/");
      }
    };

    checkInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Composant Login démonté');
      subscription.unsubscribe();
    };
  }, [navigate, logger, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <Card className="p-8 space-y-4 backdrop-blur-sm bg-white/10 border-[0.5px] border-[#f3ebad]/30 hover:shadow-lg transition-all duration-300">
          <h1 className="text-3xl font-cormorant text-center mb-6 text-[#f3ebad]">
            Se Connecter
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f3ebad',
                    brandAccent: '#f3ebad',
                    brandButtonText: "#40192C",
                    defaultButtonBackground: "rgba(243, 235, 173, 0.1)",
                    defaultButtonBackgroundHover: "rgba(243, 235, 173, 0.2)",
                    inputBackground: "rgba(255, 255, 255, 0.05)",
                    inputBorder: "rgba(243, 235, 173, 0.3)",
                    inputBorderHover: "#f3ebad",
                    inputBorderFocus: "#f3ebad",
                  }
                }
              },
              className: {
                container: "space-y-4",
                button: "w-full px-4 py-2 rounded-md transition-colors duration-200",
                input: "w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f3ebad] bg-white/5 text-[#f3ebad]",
                label: "block text-sm font-medium text-[#f3ebad] mb-1"
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
          />
          <p className="text-sm text-[#f3ebad]/70 text-center mt-4 italic">
            Pour les profils déjà membre du Love Hôtel, il suffit de vous inscrire avec votre mail de compte pour récupérer vos points et avantages
          </p>
        </Card>
      </div>
    </div>
  );
}
