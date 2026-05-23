import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { user } = useAuth();

  // Si no hay usuario logueado en sesión, redirigir a /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario logueado, permitir el paso
  return <Outlet />;
}
