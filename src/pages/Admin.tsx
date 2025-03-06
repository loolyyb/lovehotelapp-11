
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

  const makeUserAdmin = async () => {
    try {
      // Hard-coded user ID to set as admin (this is the ID specified in the code)
      const adminUserId = "b777ae12-9da5-46c7-9506-741e90e7d9a8";
      
      // Update the profile to set role as admin
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", adminUserId);
      
      if (error) {
        console.error("Error setting user as admin:", error);
        return false;
      }
      
      console.log("Admin user role set successfully");
      return true;
    } catch (error) {
      console.error("Exception when setting admin role:", error);
      return false;
    }
  };

  const checkAdminAuth = async () => {
    try {
      // Ensure the designated user is set as admin first
      await makeUserAdmin();
      
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
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        // Try again but with user_id
        const { data: profileByUserId, error: userIdError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (userIdError) {
          console.error("Error fetching profile by user_id:", userIdError);
          throw userIdError;
        }

        if (profileByUserId?.role !== 'admin') {
          console.log("User is not admin, role:", profileByUserId?.role);
          return;
        }
      } else if (profile?.role !== 'admin') {
        console.log("User is not admin, role:", profile?.role);
        return;
      }

      // L'utilisateur a le rôle admin, on le définit comme authentifié
      setAdminAuthenticated(true);
      console.log("Admin role verified. Auth state set to true");
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
