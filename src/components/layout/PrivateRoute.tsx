import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { session } = useAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}