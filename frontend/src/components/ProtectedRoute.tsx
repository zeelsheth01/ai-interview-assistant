import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {

  const isLoggedIn = localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
}
