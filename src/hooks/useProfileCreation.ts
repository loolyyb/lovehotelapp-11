
import { supabase } from "@/integrations/supabase/client";
import { useLogger } from "./useLogger";
import { useToast } from "./use-toast";

export const useProfileCreation = () => {
  const logger = useLogger('ProfileCreation');
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

  return { createProfileIfNeeded };
};
