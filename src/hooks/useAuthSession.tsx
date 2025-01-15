import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from './use-toast';
import { logger } from '@/services/LogService';

interface AuthSessionReturn {
  session: Session | null;
  loading: boolean;
  userProfile: any | null;
}

export function useAuthSession(): AuthSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const createProfile = async (userId: string) => {
    try {
      logger.info('Creating new profile for user:', { userId });
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert([{
            user_id: userId,
            full_name: 'New User',
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

        logger.info('New profile created successfully:', { newProfile });
        setUserProfile(newProfile);
      }
    } catch (error: any) {
      logger.error('Error creating profile:', {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer votre profil. Veuillez réessayer.",
      });
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      logger.info('Fetching profile for user:', { userId });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        await createProfile(userId);
      } else {
        setUserProfile(profile);
      }
    } catch (error: any) {
      logger.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      logger.info('Auth state change:', { event: _event, userId: session?.user?.id });
      setSession(session);
      setLoading(false);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, userProfile };
}