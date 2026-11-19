import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import PricingPage from "./pages/PricingPage";
import InterviewWorkspace from "./pages/InterviewWorkspace";
import MockInterviewSetup from "./pages/MockInterviewSetup";
import MockInterviewChat from "./pages/MockInterviewChat";
import MockInterviewReportPage from "./pages/MockInterviewReportPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (Logged-in users are automatically redirected to /dashboard) */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/auth/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
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

        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MockInterviewSetup />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mock-interview/:sessionId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MockInterviewChat />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mock-interview/:sessionId/report"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MockInterviewReportPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
