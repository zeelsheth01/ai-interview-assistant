import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    return <Navigate to="/" />;
  }

  return children;
}
