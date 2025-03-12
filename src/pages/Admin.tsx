
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertService } from "@/services/AlertService";
import { useLogger } from "@/hooks/useLogger";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function Admin() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'not_authenticated' | 'not_admin' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const logger = useLogger('AdminPage');
  
  // Admin auth store
  const { 
    isAdminAuthenticated, 
    setAdminAuthenticated, 
    checkSessionValidity 
  } = useAdminAuthStore();
  
  // Check if the user is authenticated and is an admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info("Admin page: Checking authentication");
        
        // First check if we have a valid admin session
        if (checkSessionValidity()) {
          logger.info("Admin page: Valid admin session found");
          setAuthState('authenticated');
          return;
        }
        
        // No valid admin session, proceed with auth check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error("Session error:", { error: sessionError });
          setError("Erreur de session: " + sessionError.message);
          setAuthState('error');
          throw sessionError;
        }
        
        if (!session) {
          // Not authenticated
          logger.info("Admin page: User not authenticated");
          setAuthState('not_authenticated');
          toast({
            variant: "destructive",
            title: "Non autorisé",
            description: "Vous devez être connecté pour accéder à cette page"
          });
          navigate("/login");
          return;
        }
        
        logger.info("Admin page: User authenticated, checking if admin");
        
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileError) {
          logger.error("Error fetching profile:", { error: profileError });
          setError("Impossible de vérifier votre rôle d'administrateur");
          setAuthState('error');
          AlertService.captureException(new Error("Admin role check failed"), {
            context: "Admin.checkAuth",
            error: profileError
          });
          return;
        }
        
        const isUserAdmin = profile?.role === 'admin';
        logger.info("Admin page: User is admin:", { isAdmin: isUserAdmin });
        
        if (!isUserAdmin) {
          setAuthState('not_admin');
          return;
        }
        
        // User is authenticated and is an admin, but still needs password check
        setAuthState('not_authenticated'); // Need admin password
      } catch (error: any) {
        logger.error("Auth error:", { error });
        setError(error.message || "Une erreur est survenue lors de la vérification de votre session");
        setAuthState('error');
        AlertService.captureException(error as Error, {
          context: "Admin.checkAuth"
        });
      }
    };
    
    checkAuth();
  }, [toast, navigate, logger, checkSessionValidity]);
  
  // Handle password check success
  const handlePasswordSuccess = () => {
    setAdminAuthenticated(true);
    setAuthState('authenticated');
  };
  
  // Loading state
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <div className="text-[#f3ebad]">Chargement en cours...</div>
      </div>
    );
  }
  
  // Error state
  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md">
          <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Erreur</h2>
          <p className="text-[#f3ebad]/80 mb-4">
            {error || "Une erreur est survenue lors du chargement de la page d'administration."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#f3ebad] text-[#40192C] rounded hover:bg-[#f3ebad]/90"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  // Not admin state
  if (authState === 'not_admin') {
    logger.info("Admin page: User is not admin, showing access restricted");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md">
          <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Accès Restreint</h2>
          <p className="text-[#f3ebad]/80">
            Vous n'avez pas les permissions nécessaires pour accéder au panneau d'administration.
          </p>
        </div>
      </div>
    );
  }
  
  // Need admin password
  if (authState === 'not_authenticated') {
    return <AdminPasswordCheck onPasswordValid={handlePasswordSuccess} />;
  }
  
  // Authenticated, show dashboard
  return <AdminDashboard />;
}
