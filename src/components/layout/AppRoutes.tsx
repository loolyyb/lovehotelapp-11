import { Routes, Route } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";
import { QualificationJourney } from "@/components/qualification/QualificationJourney";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/qualification" element={<QualificationJourney />} />
    </Routes>
  );
}
