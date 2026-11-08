import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "../constants/brand";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        email,
        password,
      });

      console.log("REGISTER SUCCESS:", res.data);

      if (fullName) {
        localStorage.setItem("userName", fullName);
      }

      setSuccess("Account provisioned successfully. Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      console.log("REGISTER ERROR:", err);
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(
        detail ||
          "Registration failed. An account with this email may already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", res.data.email);
      if (res.data.name) {
        localStorage.setItem("userName", res.data.name);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Google authentication was unsuccessful. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-5xl w-full mx-auto card-swiss bg-surface overflow-hidden shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Editorial Section: 5 Columns */}
          <div className="lg:col-span-5 bg-surface-subtle p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Brand Header */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="w-8 h-8 rounded bg-primary text-white font-serif font-bold text-lg flex items-center justify-center">
                  A
                </span>
                <span className="font-serif text-xl font-bold text-ink-primary tracking-tight">
                  {APP_NAME}
                </span>
              </Link>

              {/* Editorial Heading */}
              <div className="space-y-3 pt-4">
                <span className="editorial-meta text-primary block">
                  CANDIDATE ONBOARDING
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal leading-tight">
                  Career intelligence built on your verified experience.
                </h1>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  Join candidates who transform standard resumes into rigorous technical practice
                  syllabi and targeted STAR interview simulations.
                </p>
              </div>

              {/* Architectural Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-ink-primary">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Resume data parsed privately without third-party training.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-ink-primary">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Curated domain questions matching your declared tech stack.</span>
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="pt-6 border-t border-border flex justify-between items-center text-[10px] font-mono text-ink-muted">
              <span>PROTOCOL v2.4</span>
              <span>CONFIDENTIAL</span>
            </div>
          </div>

          {/* Right Form Section: 7 Columns */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
                  Create Candidate Profile
                </h2>
                <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                  Enter your credentials to begin personalized assessment.
                </p>
              </div>

              {/* Error and Success Banners */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded bg-error-light border border-error/20 flex items-start gap-2.5 text-xs text-error font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded bg-success-light border border-success/20 flex items-start gap-2.5 text-xs text-success font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google OAuth Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    const googleButton = document.querySelector(
                      '[role="button"]'
                    ) as HTMLElement;
                    googleButton?.click();
                  }}
                  className="w-full min-h-[46px] rounded border border-border bg-surface hover:bg-surface-subtle text-ink-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-subtle"
                >
                  <FcGoogle className="text-lg" />
                  <span>Continue with Google</span>
                </button>

                {/* Hidden Real Google Login component */}
                <div style={{ display: "none" }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError("Google Sign-In initialization failed.");
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
                    Or Register with Email
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                    Candidate Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="e.g. Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="alex.mercer@engineering.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                    Password <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                    Confirm Password <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  <span>{loading ? "Registering Candidate Profile..." : "Create Account"}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Bottom Login Link */}
              <div className="pt-4 border-t border-border text-center text-xs text-ink-secondary">
                <span>Already have a candidate profile? </span>
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
