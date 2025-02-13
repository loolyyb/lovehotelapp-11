
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
  console.log("AppRoutes - Current hostname:", hostname);
  const isPreview = hostname.includes('preview--') && hostname.endsWith('.lovable.app');
  console.log("AppRoutes - Is preview environment:", isPreview);
  return isPreview;
};

export const AppRoutes = ({ session }: AppRoutesProps) => {
  console.log("AppRoutes rendering. Session:", session);
  console.log("Is preview environment:", isPreviewEnvironment());

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

  console.log("AppRoutes - About to render routes");
  return (
    <Routes>
      <Route
        path="/"
        element={<Landing />}
      />
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={session ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile/:id"
        element={session ? <ProfileDetails /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/features"
        element={<Features />}
      />
      <Route
        path="/restaurant-du-love"
        element={<RestaurantDuLove />}
      />
      <Route
        path="/messages"
        element={session ? <Messages /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/matching-scores"
        element={session ? <MatchingScores /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/events"
        element={session ? <Events /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/challenges"
        element={session ? <Challenges /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/reserver-room"
        element={session ? <ReserverRoom /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/rideaux-ouverts"
        element={<RideauxOuverts />}
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
        path="/admin"
        element={<Admin />}
      />
    </Routes>
  );
};
