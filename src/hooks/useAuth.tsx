import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useLogger } from "./useLogger";
import { AuthError } from "@supabase/supabase-js";

export function useAuth() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const logger = useLogger('AuthHook');

  const createProfileIfNeeded = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ user_id: userId }]);

        if (profileError) throw profileError;
      }
    } catch (error) {
      logger.error('Error creating profile:', { error });
      throw error;
    }
  };

  useEffect(() => {
    logger.debug('Auth hook initialized');
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Auth hook cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthChange = async (event: string, session: any) => {
    logger.debug('Auth state changed:', { event });

    try {
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
    } catch (error) {
      logger.error('Auth change error:', { error });
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('Session error:', { error: sessionError });
        if (sessionError.message.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          setError("Votre session a expiré. Veuillez vous reconnecter.");
          return;
        }
        setError("Une erreur est survenue lors de la vérification de votre session. Veuillez réessayer.");
        return;
      }

      if (session) {
        navigate("/");
      }
    } catch (error) {
      logger.error('Session check error:', { error });
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    }
  };

  return { error };
}