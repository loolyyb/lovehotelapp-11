import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const refreshSession = async () => {
    console.log("Refreshing session...");
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Current session:", currentSession);
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setUserProfile(null);
        } else {
          console.log("Profile loaded:", profile);
          setUserProfile(profile);
        }
      } else {
        console.log("No current session, clearing profile");
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
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