
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AlertService } from "@/services/AlertService";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the user is authenticated and is an admin
  useEffect(() => {
    console.log("Admin page: Checking authentication");
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw error;
        }
        
        if (!session) {
          // Not authenticated
          console.log("Admin page: User not authenticated");
          setIsAuthenticated(false);
          setIsAdmin(false);
          toast({
            variant: "destructive",
            title: "Non autorisé",
            description: "Vous devez être connecté pour accéder à cette page"
          });
          navigate("/login");
          return;
        }
        
        console.log("Admin page: User authenticated, checking if admin");
        setIsAuthenticated(true);
        
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsAdmin(false);
          setIsError(true);
          setErrorMessage("Impossible de vérifier votre rôle d'administrateur");
          AlertService.captureException(new Error("Admin role check failed"), {
            context: "Admin.checkAuth",
            error: profileError
          });
          return;
        }
        
        const isUserAdmin = profile?.role === 'admin';
        console.log("Admin page: User is admin:", isUserAdmin);
        setIsAdmin(isUserAdmin);
      } catch (error: any) {
        console.error("Auth error:", error);
        setIsError(true);
        setErrorMessage(error.message || "Une erreur est survenue lors de la vérification de votre session");
        AlertService.captureException(error as Error, {
          context: "Admin.checkAuth"
        });
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: error.message || "Une erreur est survenue lors de la vérification de votre session"
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [toast, navigate]);
  
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <div className="text-[#f3ebad]">Chargement en cours...</div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#40192C] to-[#CE0067]/50">
        <div className="text-center p-8 bg-[#302234] rounded-lg border border-[#f3ebad]/20 max-w-md">
          <h2 className="text-2xl font-bold text-[#f3ebad] mb-4">Erreur</h2>
          <p className="text-[#f3ebad]/80 mb-4">
            {errorMessage || "Une erreur est survenue lors du chargement de la page d'administration."}
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
  
  if (!isAuthenticated) {
    console.log("Admin page: Redirecting to login");
    return null; // The navigate in useEffect will redirect to login
  }
  
  if (!isAdmin) {
    console.log("Admin page: User is not admin, showing access restricted");
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
  
  console.log("Admin page: Showing password check or dashboard");
  
  if (!isPasswordValid) {
    return <AdminPasswordCheck onPasswordValid={() => setIsPasswordValid(true)} />;
  }
  
  return <AdminDashboard />;
}
