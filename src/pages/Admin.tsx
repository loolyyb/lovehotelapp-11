
import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the user is authenticated and is an admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!session) {
          // Not authenticated
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
          return;
        }
        
        setIsAdmin(profile?.role === 'admin');
      } catch (error: any) {
        console.error("Auth error:", error);
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
  
  if (!isAuthenticated) {
    return null; // The navigate in useEffect will redirect to login
  }
  
  if (!isAdmin) {
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
  
  if (!isPasswordValid) {
    return <AdminPasswordCheck onPasswordValid={() => setIsPasswordValid(true)} />;
  }
  
  return <AdminDashboard />;
}
