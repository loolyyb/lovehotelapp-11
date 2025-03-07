
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginCard } from "@/components/auth/LoginCard";
import { useLogger } from "@/hooks/useLogger";
import { useAuthChangeHandler } from "@/hooks/useAuthChangeHandler";
import { useSessionContext } from '@supabase/auth-helpers-react';

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');
  const { handleAuthChange } = useAuthChangeHandler();
  const { session, isLoading } = useSessionContext();

  useEffect(() => {
    logger.debug('Composant Login monté');
    
    // If already authenticated, redirect to home
    if (session) {
      navigate("/");
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Composant Login démonté');
      subscription.unsubscribe();
    };
  }, [navigate, logger, handleAuthChange, session]);

  // If loading, show nothing (LoginCard will handle its own loading state)
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <LoginCard title="Se Connecter" />
      </div>
    </div>
  );
}
