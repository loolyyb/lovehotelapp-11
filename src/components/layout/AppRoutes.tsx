import { Routes, Route, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Profiles from "@/pages/Profiles";
import ProfileDetails from "@/pages/ProfileDetails";
import Landing from "@/pages/Landing";
import RideauxOuverts from "@/pages/RideauxOuverts";
import Admin from "@/pages/Admin";
import Messages from "@/pages/Messages";
import MatchingScores from "@/pages/MatchingScores";
import Events from "@/pages/Events";

interface AppRoutesProps {
  session: Session | null;
}

export const AppRoutes = ({ session }: AppRoutesProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={session ? <Profiles /> : <Landing />}
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
        path="/lover-coin"
        element={<div className="p-8 text-center">Page LoverCoin en construction</div>}
      />
      <Route
        path="/rideaux-ouverts"
        element={<RideauxOuverts />}
      />
      <Route
        path="/admin"
        element={<Admin />}
      />
    </Routes>
  );
};