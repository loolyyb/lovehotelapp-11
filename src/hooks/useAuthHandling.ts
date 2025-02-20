
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "@/hooks/useLogger";
import { useToast } from "@/hooks/use-toast";

export const useAuthHandling = () => {
  const navigate = useNavigate();
  const logger = useLogger('Auth');
  const { toast } = useToast();
  const processingAuthChange = useRef(false);

  const createProfileIfNeeded = async (userId: string) => {
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!existingProfile) {
        logger.info('Creating missing profile for user', { userId });
        
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

  const handleAuthChange = async (event: string, session: any) => {
    if (processingAuthChange.current) return false;
    
    processingAuthChange.current = true;
    logger.info('Changement d\'état d\'authentification', { event, hasSession: !!session });
    
    try {
      if (event === 'SIGNED_UP' && session) {
        await createProfileIfNeeded(session.user.id);
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        });
        navigate("/");
        return true;
      } else if (event === 'SIGNED_IN' && session) {
        await createProfileIfNeeded(session.user.id);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/");
        return true;
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
        return true;
      }
    } catch (error) {
      logger.error('Error handling auth change:', { error });
    } finally {
      processingAuthChange.current = false;
    }
    return false;
  };

  const checkInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Error checking initial session:', { error });
        return false;
      }
      if (session) {
        navigate("/");
        return true;
      }
    } catch (error) {
      logger.error('Error in checkInitialSession:', { error });
    }
    return false;
  };

  return {
    handleAuthChange,
    checkInitialSession,
  };
};
