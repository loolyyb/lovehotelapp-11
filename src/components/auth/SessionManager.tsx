import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SessionManagerProps {
  refreshSession: () => Promise<void>;
}

export function SessionManager({ refreshSession }: SessionManagerProps) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("SessionManager mounting, checking session...");
    const checkAndRefreshSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Session check result:", currentSession);
        
        const currentPath = window.location.pathname;
        console.log("Current path:", currentPath);

        if (!currentSession) {
          if (currentPath !== '/' && currentPath !== '/login') {
            console.log("No session, redirecting to home");
            navigate('/');
          }
        } else if (currentPath === '/') {
          console.log("Session exists, redirecting to profile");
          navigate('/profile');
        }
      } catch (error) {
        console.error("Session check error:", error);
        navigate('/');
      }
    };

    checkAndRefreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === 'SIGNED_IN') {
        navigate('/profile');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
      await refreshSession();
    });

    return () => subscription.unsubscribe();
  }, [navigate, refreshSession]);

  return null;
}