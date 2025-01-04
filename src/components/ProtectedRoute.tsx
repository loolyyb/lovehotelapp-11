import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  session: Session | null;
}

export function ProtectedRoute({ children, session }: ProtectedRouteProps) {
  console.log("ProtectedRoute check - Session:", session);
  if (!session) {
    console.log("No session, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Session valid, rendering protected content");
  return <>{children}</>;
}