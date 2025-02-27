
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

  const checkAdminAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session) {
        setAdminAuthenticated(false);
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder à l'administration",
        });
        navigate("/login");
        return;
      }

      // Vérifier le rôle admin dans la base de données
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.role !== 'admin') {
        setAdminAuthenticated(false);
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'avez pas les droits administrateur nécessaires",
        });
        navigate("/");
        return;
      }

      // L'utilisateur a le rôle admin, alors nous n'avons plus besoin de vérifier
      // l'état isAdminAuthenticated car il sera persisté via localStorage
      console.log("Admin role verified. Auth state:", isAdminAuthenticated);
    } catch (error) {
      console.error('Error checking admin auth:', error);
      setAdminAuthenticated(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification des droits administrateur",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  if (!isAdminAuthenticated) {
    return <AdminPasswordCheck onPasswordValid={() => setAdminAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}
