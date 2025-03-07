
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginCard } from "@/components/auth/LoginCard";
import { useLogger } from "@/hooks/useLogger";
import { useAuthChangeHandler } from "@/hooks/useAuthChangeHandler";

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');
  const { handleAuthChange } = useAuthChangeHandler();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    logger.debug('Composant Login monté');
    
    // Check for session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error checking session:', error);
        } else {
          setSession(data.session);
          // If already authenticated, redirect to home
          if (data.session) {
            navigate("/");
          }
        }
        setIsLoading(false);
      } catch (err) {
        logger.error('Exception checking session:', err);
        setIsLoading(false);
      }
    };
    
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      handleAuthChange(event, newSession);
      
      if (newSession) {
        navigate("/");
      }
    });

    return () => {
      logger.debug('Composant Login démonté');
      subscription.unsubscribe();
    };
  }, [navigate, logger, handleAuthChange]);

  // If loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
        <div className="text-[#f3ebad]">Chargement...</div>
      </div>
    );
  }

  // If already logged in, don't show login card
  if (session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <LoginCard title="Se Connecter" />
      </div>
    </div>
  );
}
