
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuthHandling } from "@/hooks/useAuthHandling";
import { useLogger } from "@/hooks/useLogger";

export default function Login() {
  const { handleAuthChange, checkInitialSession } = useAuthHandling();
  const logger = useLogger('Login');

  useEffect(() => {
    logger.debug('Composant Login monté');
    let mounted = true;

    const initAuth = async () => {
      if (mounted) {
        await checkInitialSession();
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        await handleAuthChange(event, session);
      }
    });

    return () => {
      logger.debug('Composant Login démonté');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#40192C]">
      <div className="w-full max-w-md px-4 py-8">
        <AuthCard />
      </div>
    </div>
  );
}
