
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { useLogger } from "./useLogger";
import { useToast } from "./use-toast";
import { useProfileCreation } from "./useProfileCreation";

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
