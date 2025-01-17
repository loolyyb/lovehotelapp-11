import { Routes, Route, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Profiles from "@/pages/Profiles";
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
import Quiz from "@/pages/Quiz";
import SwipePage from "@/pages/SwipePage";
import { QualificationJourney } from '@/components/qualification/QualificationJourney';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppRoutesProps {
  session: Session | null;
}

export const AppRoutes = ({ session }: AppRoutesProps) => {
  const [needsQualification, setNeedsQualification] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
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

  if (session && needsQualification) {
    return <QualificationJourney onComplete={() => setNeedsQualification(false)} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={session ? <Dashboard /> : <Landing />}
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
        path="/profiles"
        element={session ? <Profiles /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile/:id"
        element={session ? <ProfileDetails /> : <Navigate to="/login" replace />}
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
        path="/quiz"
        element={session ? <Quiz /> : <Navigate to="/login" replace />}
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
        path="/restaurant-du-love"
        element={<RestaurantDuLove />}
      />
      <Route
        path="/admin"
        element={<Admin />}
      />
      <Route
        path="/swipe"
        element={session ? <SwipePage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};
