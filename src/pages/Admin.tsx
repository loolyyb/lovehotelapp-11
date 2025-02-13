
import React, { useEffect } from "react";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAdminAuthenticated, setAdminAuthenticated } = useAdminAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'admin est toujours authentifié au chargement
    const checkAdminAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setAdminAuthenticated(false);
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder à l'administration",
        });
        navigate("/login");
        return;
      }

      const adminAuth = localStorage.getItem('admin-auth-storage');
      if (!adminAuth || !JSON.parse(adminAuth).state.isAdminAuthenticated) {
        setAdminAuthenticated(false);
      }
    };
    
    checkAdminAuth();
  }, [setAdminAuthenticated, navigate, toast]);

  if (!isAdminAuthenticated) {
    return <AdminPasswordCheck onPasswordValid={() => setAdminAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}
