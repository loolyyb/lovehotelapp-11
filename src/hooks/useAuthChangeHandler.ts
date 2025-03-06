
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { useLogger } from "./useLogger";
import { useToast } from "./use-toast";
import { useProfileCreation } from "./useProfileCreation";
import { supabase } from "@/integrations/supabase/client";

export const useAuthChangeHandler = () => {
  const navigate = useNavigate();
  const logger = useLogger('AuthChangeHandler');
  const { toast } = useToast();
  const { createProfileIfNeeded } = useProfileCreation();

  const handleAuthChange = async (event: string, session: Session | null) => {
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
      
      // Verify or fix RLS profile access by checking and creating a profile if needed
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error || !profile) {
          logger.warn('Profile not found for user, creating one', { userId: session.user.id });
          
          const newProfileId = crypto.randomUUID();
          await supabase.from('profiles').insert({
            id: newProfileId,
            user_id: session.user.id,
            full_name: session.user.email?.split('@')[0] || 'Nouvel utilisateur',
            role: 'user'
          });
          
          logger.info('Created new profile for user', { userId: session.user.id, profileId: newProfileId });
        }
      } catch (error) {
        logger.error('Error verifying user profile', { error });
      }
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      navigate("/");
    } else if (event === 'PASSWORD_RECOVERY') {
      navigate("/password-reset");
    }
    // Removed the SIGNED_OUT redirection
  };

  return { handleAuthChange };
};
