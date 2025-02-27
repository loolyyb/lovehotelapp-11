
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginCard } from "@/components/auth/LoginCard";
import { useLogger } from "@/hooks/useLogger";
import { useAuthChangeHandler } from "@/hooks/useAuthChangeHandler";

export default function Login() {
  const navigate = useNavigate();
  const logger = useLogger('Login');
  const { handleAuthChange } = useAuthChangeHandler();

  useEffect(() => {
    logger.debug('Composant Login monté');
    
    // Check and handle initial session
    const checkInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('Error checking initial session:', { error });
        return;
      }
      if (session) {
        navigate("/");
      }
    };

    checkInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      logger.debug('Composant Login démonté');
      subscription.unsubscribe();
    };
  }, [navigate, logger, handleAuthChange]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <LoginCard title="Se Connecter" />
      </div>
    </div>
  );
}
