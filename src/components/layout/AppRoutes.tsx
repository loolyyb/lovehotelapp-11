import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Challenges from "@/pages/Challenges";
import ProfileDetails from "@/pages/ProfileDetails";
import Quiz from "@/pages/Quiz";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/profile/:id" element={<ProfileDetails />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
}
