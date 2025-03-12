
import { useState, useEffect, useRef } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertService } from "@/services/AlertService";
import { useLogger } from "@/hooks/useLogger";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { AuthService } from "@/services/AuthService";

export default function Admin() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'not_authenticated' | 'not_admin' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionExists, setSessionExists] = useState(false);
  const authCheckCompleted = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const logger = useLogger('AdminPage');
  
  // Admin auth store
  const { 
    isAdminAuthenticated, 
    setAdminAuthenticated, 
    checkSessionValidity 
  } = useAdminAuthStore();
  
  // Check session existence separately to avoid async issues
  useEffect(() => {
    let isMounted = true;
    
    // Skip if we've already completed an auth check
    if (authCheckCompleted.current) return;
    
    const checkSession = async () => {
      try {
        logger.info("Checking Supabase session");
        const { data } = await supabase.auth.getSession();
        
        // Also check admin token
        const adminTokenValid = AuthService.isAuthenticated();
        
        logger.info("Session check results", {
          hasSupabaseSession: !!data.session,
          adminTokenValid
        });
        
        if (isMounted) {
          setSessionExists(!!data.session);
          setSessionChecked(true);
          
          // If admin token is valid, we can skip the authentication check
          if (adminTokenValid && checkSessionValidity()) {
            logger.info("Admin already authenticated via token");
            authCheckCompleted.current = true;
            setAuthState('authenticated');
          }
        }
      } catch (err) {
        logger.error("Error checking session:", err);
        if (isMounted) {
          setSessionChecked(true);
          setSessionExists(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [logger, checkSessionValidity]);
  
  // Check if the user is authenticated and is an admin
  useEffect(() => {
    let isMounted = true;
    
    // Skip auth check if we're already authenticated or if it's already completed
    if (authState === 'authenticated' || authCheckCompleted.current) {
      logger.info("Skipping auth check as already authenticated");
      return;
    }
    
    // Skip if session check isn't complete yet
    if (!sessionChecked) {
      return;
    }
    
    const checkAuth = async () => {
      try {
        logger.info("Admin page: Checking authentication");
        
        // First check if we have a valid admin session
        if (checkSessionValidity()) {
          logger.info("Admin page: Valid admin session found");
          if (isMounted) {
            authCheckCompleted.current = true;
            setAuthState('authenticated');
          }
          return;
        }
        
        // No valid admin session, proceed with auth check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error("Session error:", { error: sessionError });
          if (isMounted) {
            setError("Erreur de session: " + sessionError.message);
            setAuthState('error');
          }
          throw sessionError;
        }
        
        if (!session) {
          // Not authenticated at all
          logger.info("Admin page: User not authenticated");
          if (isMounted) setAuthState('not_authenticated');
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
          if (isMounted) {
            setError("Impossible de vérifier votre rôle d'administrateur");
            setAuthState('error');
          }
          AlertService.captureException(new Error("Admin role check failed"), {
            context: "Admin.checkAuth",
            error: profileError
          });
          return;
        }
        
        const isUserAdmin = profile?.role === 'admin';
        logger.info("Admin page: User is admin:", { isAdmin: isUserAdmin });
        
        if (!isUserAdmin) {
          if (isMounted) setAuthState('not_admin');
          return;
        }
        
        // User is authenticated and is an admin, now show password input
        if (isMounted) setAuthState('not_authenticated'); // This will show password input
      } catch (error: any) {
        logger.error("Auth error:", { error });
        if (isMounted) {
          setError(error.message || "Une erreur est survenue lors de la vérification de votre session");
          setAuthState('error');
        }
        AlertService.captureException(error as Error, {
          context: "Admin.checkAuth"
        });
      }
    };
    
    // Only run auth check if not already authenticated and session check is complete
    if (authState === 'loading' && sessionChecked) {
      checkAuth();
    }
    
    return () => {
      isMounted = false;
    };
  }, [toast, navigate, logger, checkSessionValidity, isAdminAuthenticated, authState, sessionChecked]);
  
  // Handle password check success
  const handlePasswordSuccess = () => {
    authCheckCompleted.current = true;
    setAdminAuthenticated(true);
    setAuthState('authenticated');
    
    // Also trigger the AuthService login to get the API token
    AuthService.login().then(token => {
      if (token) {
        logger.info("Admin API token obtained successfully");
      } else {
        logger.warn("Failed to obtain admin API token");
      }
    });
  };
  
  // Loading state - show a more substantial loading component to reduce perception of flicker
  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 transition-opacity duration-300">
        <div className="p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 text-[#f3ebad] shadow-lg">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-[#f3ebad]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Chargement du panneau d'administration...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 transition-opacity duration-300">
        <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md shadow-lg">
          <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Erreur</h2>
          <p className="text-[#f3ebad]/80 mb-4">
            {error || "Une erreur est survenue lors du chargement de la page d'administration."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#f3ebad] text-[#40192C] rounded hover:bg-[#f3ebad]/90 transition-colors"
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 transition-opacity duration-300">
        <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md shadow-lg">
          <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Accès Restreint</h2>
          <p className="text-[#f3ebad]/80 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder au panneau d'administration.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-[#f3ebad] text-[#40192C] rounded hover:bg-[#f3ebad]/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  // Not authenticated state - This is where we either show the admin password input or login prompt
  if (authState === 'not_authenticated') {
    logger.info("Admin page: User authentication state", { isAdminAuthenticated, sessionChecked, sessionExists });
    
    // Using our separate sessionExists state instead of trying to directly access the session
    if (sessionExists) {
      logger.info("Admin page: User is logged in, showing password input");
      return <AdminPasswordCheck onPasswordValid={handlePasswordSuccess} />;
    } else {
      logger.info("Admin page: User is not logged in, showing login prompt");
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50 transition-opacity duration-300">
          <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Connexion Requise</h2>
            <p className="text-[#f3ebad]/80 mb-4">
              Vous devez être connecté pour accéder au panneau d'administration.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-[#f3ebad] text-[#40192C] rounded hover:bg-[#f3ebad]/90 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      );
    }
  }
  
  // Authenticated, show dashboard with a gentle fade-in effect
  return (
    <div className="animate-fade-in">
      <AdminDashboard />
    </div>
  );
}
