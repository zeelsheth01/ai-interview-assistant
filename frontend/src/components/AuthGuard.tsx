import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const isAuth = localStorage.getItem("loggedIn");

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  return children;
}
