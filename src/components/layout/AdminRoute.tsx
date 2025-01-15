import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, userProfile } = useAuthSession();

  if (!session || userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}