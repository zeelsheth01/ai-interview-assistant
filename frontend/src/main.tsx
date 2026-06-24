import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider
    clientId="887184951396-bhmccf8fvinbjdrah03olo8mp7kbmvkn.apps.googleusercontent.com"
  >
    <App />
  </GoogleOAuthProvider>
);