import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {

  const loggedIn = localStorage.getItem("loggedIn");

  if(!loggedIn){

    return <Navigate to="/" />;
  }

  return children;
}
