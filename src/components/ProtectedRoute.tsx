import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  session: Session | null;
}

export function ProtectedRoute({ children, session }: ProtectedRouteProps) {
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}