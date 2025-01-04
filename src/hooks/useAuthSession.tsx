import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...");
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      console.log("Current session:", currentSession);
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code === 'PGRST116') {
            // No profile found, create one
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                { 
                  user_id: currentSession.user.id,
                  full_name: currentSession.user.email?.split('@')[0] || 'New User',
                  visibility: 'public'
                }
              ])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }
            console.log("New profile created:", newProfile);
            setUserProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          console.log("Profile loaded:", profile);
          setUserProfile(profile);
        }
      } else {
        console.log("No current session, clearing profile");
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      setSession(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial session check...");
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        await refreshSession();
      } else {
        setSession(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, userProfile, refreshSession };
};