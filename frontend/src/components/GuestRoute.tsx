import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");

  if (token && loggedIn === "true") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
