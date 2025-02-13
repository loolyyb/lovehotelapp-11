import { Routes, Route, Navigate } from "react-router-dom";
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
import { QualificationJourney } from "@/components/qualification/QualificationJourney";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppRoutesProps {
  session: Session | null;
}

const isPreviewEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('preview--') && hostname.endsWith('.lovable.app');
};

export const AppRoutes = ({ session }: AppRoutesProps) => {
  const [needsQualification, setNeedsQualification] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user && !isPreviewEnvironment()) {
      checkQualificationStatus();
    }
  }, [session]);

  const checkQualificationStatus = async () => {
    if (!session?.user) return;

    try {
      const { data: preferences, error } = await supabase
        .from('preferences')
        .select('qualification_completed, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error checking qualification status:', error);
        if (error.code === 'PGRST116') {
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
    } catch (error) {
      console.error('Error:', error);
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

  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    if (isPreviewEnvironment()) {
      return <>{element}</>;
    }
    return session ? <>{element}</> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={isPreviewEnvironment() ? <Landing /> : (session ? <Dashboard /> : <Landing />)}
      />
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute element={<Profile />} />}
      />
      <Route
        path="/profiles"
        element={<ProtectedRoute element={<Navigate to="/matching-scores" replace />} />}
      />
      <Route
        path="/profile/:id"
        element={<ProtectedRoute element={<ProfileDetails />} />}
      />
      <Route
        path="/messages"
        element={<ProtectedRoute element={<Messages />} />}
      />
      <Route
        path="/matching-scores"
        element={<ProtectedRoute element={<MatchingScores />} />}
      />
      <Route
        path="/events"
        element={<ProtectedRoute element={<Events />} />}
      />
      <Route
        path="/challenges"
        element={<ProtectedRoute element={<Challenges />} />}
      />
      <Route
        path="/features"
        element={<Features />}
      />
      <Route
        path="/options"
        element={<Options />}
      />
      <Route
        path="/lover-coin"
        element={<LoverCoin />}
      />
      <Route
        path="/reserver-room"
        element={<ProtectedRoute element={<ReserverRoom />} />}
      />
      <Route
        path="/rideaux-ouverts"
        element={<RideauxOuverts />}
      />
      <Route
        path="/restaurant-du-love"
        element={<RestaurantDuLove />}
      />
      <Route
        path="/admin"
        element={<Admin />}
      />
    </Routes>
  );
};
