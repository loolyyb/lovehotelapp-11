import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";
import { Session } from "@supabase/supabase-js";

interface AppRoutesProps {
  session: Session | null;
}

export function AppRoutes({ session }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/qualification" element={<QualificationJourney />} />
    </Routes>
  );
}