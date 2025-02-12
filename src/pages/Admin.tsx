
import React, { useEffect } from "react";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAdminAuthenticated, setAdminAuthenticated } = useAdminAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'admin est toujours authentifié au chargement
    const checkAdminAuth = () => {
      const adminAuth = localStorage.getItem('admin-auth-storage');
      if (!adminAuth || !JSON.parse(adminAuth).state.isAdminAuthenticated) {
        setAdminAuthenticated(false);
      }
    };
    
    checkAdminAuth();
  }, [setAdminAuthenticated]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAdminAuthenticated(false);
      navigate('/');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  if (!isAdminAuthenticated) {
    return <AdminPasswordCheck onPasswordValid={() => setAdminAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-end py-4">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-destructive hover:text-destructive/90"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}
