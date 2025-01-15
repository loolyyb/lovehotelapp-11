import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import ProfileDetails from "@/pages/ProfileDetails";
import Messages from "@/pages/Messages";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Features from "@/pages/Features";
import Events from "@/pages/Events";
import Profiles from "@/pages/Profiles";
import Options from "@/pages/Options";
import LoverCoin from "@/pages/LoverCoin";
import Challenges from "@/pages/Challenges";
import ReserverRoom from "@/pages/ReserverRoom";
import RestaurantDuLove from "@/pages/RestaurantDuLove";
import RideauxOuverts from "@/pages/RideauxOuverts";
import MatchingScores from "@/pages/MatchingScores";
import { useAuthSession } from "@/hooks/useAuthSession";

export function AppRoutes() {
  const { session } = useAuthSession();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/features" element={<Features />} />
      <Route path="/lovercoin" element={<LoverCoin />} />

      {/* Protected routes */}
      {session && (
        <>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<ProfileDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/options" element={<Options />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/reserver-room" element={<ReserverRoom />} />
          <Route path="/restaurant-du-love" element={<RestaurantDuLove />} />
          <Route path="/rideaux-ouverts" element={<RideauxOuverts />} />
          <Route path="/matching-scores" element={<MatchingScores />} />
        </>
      )}
    </Routes>
  );
}