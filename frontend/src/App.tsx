import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import PricingPage from "./pages/PricingPage";
import InterviewWorkspace from "./pages/InterviewWorkspace";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/auth/signin" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/auth/signup" element={<Register />} />

        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Upload />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InterviewWorkspace />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
