import React, { useEffect } from "react";
import { AdminPasswordCheck } from "@/components/admin/AdminPasswordCheck";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAdminAuthStore } from "@/stores/adminAuthStore";

export default function Admin() {
  const { isAdminAuthenticated, setAdminAuthenticated } = useAdminAuthStore();

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

  if (!isAdminAuthenticated) {
    return <AdminPasswordCheck onPasswordValid={() => setAdminAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}