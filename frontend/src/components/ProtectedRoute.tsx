import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");

  if (!token || loggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
