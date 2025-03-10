
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import ProfileDetails from "@/pages/ProfileDetails";
import Landing from "@/pages/Landing";
import Features from "@/pages/Features";
import RestaurantDuLove from "@/pages/RestaurantDuLove";
import Admin from "@/pages/Admin";
import Messages from "@/pages/Messages";
import MatchingScores from "@/pages/MatchingScores";
import Events from "@/pages/Events";
import Challenges from "@/pages/Challenges";
import ReserverRoom from "@/pages/ReserverRoom";
import RideauxOuverts from "@/pages/RideauxOuverts";
import Dashboard from "@/pages/Dashboard";
import Options from "@/pages/Options";
import LoverCoin from "@/pages/LoverCoin";
import Announcements from "@/pages/Announcements";
import PasswordReset from "@/pages/PasswordReset";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/LogService";
import { useLogger } from "@/hooks/useLogger";

interface AppRoutesProps {
  session: Session | null;
}

const isPreviewEnvironment = () => {
  return window.location.hostname.includes('preview--') && 
         window.location.hostname.endsWith('.lovable.app');
};

export const AppRoutes = ({ session }: AppRoutesProps) => {
  const [needsQualification, setNeedsQualification] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { info, error } = useLogger('AppRoutes');

  useEffect(() => {
    info("AppRoutes mounted", { 
      isAuthenticated: !!session,
      currentPath: window.location.pathname
    });

    if (session?.user && !isPreviewEnvironment()) {
      checkQualificationStatus();
    }
  }, [session]);

  const checkQualificationStatus = async () => {
    if (!session?.user) return;

    try {
      const { data: preferences, error: supabaseError } = await supabase
        .from('preferences')
        .select('qualification_completed, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (supabaseError) {
        console.error('Error checking qualification status:', supabaseError);
        if (supabaseError.code === 'PGRST116') {
          setNeedsQualification(true);
          return;
        }

        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de vérifier votre statut de qualification.",
        });
        return;
      }

      setNeedsQualification(!preferences?.qualification_completed);
    } catch (err) {
      console.error('Error:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification de votre statut.",
      });
    }
  };

  if (session && needsQualification && !isPreviewEnvironment()) {
    return <QualificationJourney onComplete={() => setNeedsQualification(false)} />;
  }

  // Improved ProtectedRoute that properly handles authentication
  const ProtectedRoute = () => {
    info("Protected route accessed", { 
      isAuthenticated: !!session,
      path: window.location.pathname 
    });
    
    if (isPreviewEnvironment()) {
      return <Outlet />;
    }
    
    return session ? <Outlet /> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Admin route - explicitly placed first for priority matching */}
      <Route path="/admin" element={<Admin />} />
      
      <Route
        path="/"
        element={session ? <Dashboard /> : <Landing />}
      />

      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/" replace />}
      />

      <Route
        path="/password-reset"
        element={<PasswordReset />}
      />

      {/* Group protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profiles" element={<Navigate to="/matching-scores" replace />} />
        <Route path="/profile/:id" element={<ProfileDetails />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/matching-scores" element={<MatchingScores />} />
        <Route path="/events" element={<Events />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/reserver-room" element={<ReserverRoom />} />
        <Route path="/announcements" element={<Announcements />} />
      </Route>

      {/* Public routes */}
      <Route path="/features" element={<Features />} />
      <Route path="/options" element={<Options />} />
      <Route path="/lover-coin" element={<LoverCoin />} />
      <Route path="/rideaux-ouverts" element={<RideauxOuverts />} />
      <Route path="/restaurant-du-love" element={<RestaurantDuLove />} />
      
      {/* Catch-all route for unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
