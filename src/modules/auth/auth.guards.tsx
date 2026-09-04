import { Navigate, Outlet, useLocation } from "react-router";
import { Loading } from "@/components/loading";
import { useAuthStore } from "./auth.store";

interface RouteGuardProps {
  redirectTo?: string;
}

export function ProtectedRoute({ redirectTo = "/sign-in" }: RouteGuardProps) {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logout = useAuthStore((state) => state.logout);

  if (!isHydrated) {
    return <Loading />;
  }

  const currentRole = role || user?.role;
  if (!accessToken || currentRole?.toLowerCase() !== "sales") {
    if (accessToken && currentRole?.toLowerCase() !== "sales") {
      logout();
    }
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute({
  redirectTo = "/dashboard",
}: RouteGuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <Loading />;
  }

  if (accessToken) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
