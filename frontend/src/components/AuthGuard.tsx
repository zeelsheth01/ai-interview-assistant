import { Navigate } from "react-router-dom";

export default function AuthGuard({children}:any){

   const isAuth = localStorage.getItem("loggedIn");

   if(!isAuth){

      return <Navigate to="/login"/>;
   }

   return children;
}
