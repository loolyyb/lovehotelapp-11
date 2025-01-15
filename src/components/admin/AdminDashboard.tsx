import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Loader } from "lucide-react";
import { AdminPasswordCheck } from "./AdminPasswordCheck";
import { AdminDashboardContent } from "./AdminDashboardContent";

export function AdminDashboard() {
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isPasswordValid, setIsPasswordValid] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!session?.user?.id) {
          navigate('/login');
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder au tableau de bord administrateur.",
            variant: "destructive",
          });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          navigate('/');
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la vérification de vos droits.",
            variant: "destructive",
          });
          return;
        }

        setIsAdmin(profile?.role === 'admin');
        
        if (profile?.role !== 'admin' && isPasswordValid) {
          toast({
            title: "Accès refusé",
            description: "Vous devez être administrateur pour accéder à cette page.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [session, navigate, toast, loading, isPasswordValid]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!isPasswordValid) {
    return <AdminPasswordCheck onPasswordValid={() => setIsPasswordValid(true)} />;
  }

  if (!isAdmin) {
    return null;
  }

  return <AdminDashboardContent session={session} />;
}