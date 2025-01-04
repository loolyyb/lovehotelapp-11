import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import MatchingScores from "@/pages/MatchingScores";
import Events from "@/pages/Events";
import Challenges from "@/pages/Challenges";
import Groups from "@/pages/Groups";
import Login from "@/pages/Login";
import type { Session } from "@supabase/supabase-js";

export function AppRoutes({ session }: { session: Session | null }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute session={session}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute session={session}>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matching-scores"
        element={
          <ProtectedRoute session={session}>
            <MatchingScores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute session={session}>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute session={session}>
            <Challenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute session={session}>
            <Groups />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}