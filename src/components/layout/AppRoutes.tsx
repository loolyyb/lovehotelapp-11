import { Routes, Route } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { LoveQuiz } from "@/components/quiz/Quiz";

interface AppRoutesProps {
  session: Session | null;
}

export function AppRoutes({ session }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Welcome to Love Hotel App</div>} />
      <Route path="/quiz" element={<LoveQuiz />} />
    </Routes>
  );
}