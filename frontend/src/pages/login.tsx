import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "../constants/brand";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setError("");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", email);
      if (res.data.name) {
        localStorage.setItem("userName", res.data.name);
      }

      const returnTo = (location.state as { from?: string } | null)?.from;
      navigate(returnTo ?? "/dashboard");
    } catch (err: unknown) {
      console.log("LOGIN ERROR:", err);
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(
        detail || "Invalid email or password. Please try again."
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
      setError("Google authentication failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Brand Header Lockup */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded bg-primary text-white font-serif font-bold text-xl flex items-center justify-center group-hover:bg-primary-hover transition-colors">
              A
            </span>
            <span className="font-serif text-2xl font-bold text-ink-primary tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <div className="pt-2">
            <span className="editorial-meta text-primary block mb-1">
              AUTHENTICATION PORTAL
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
              Welcome back to your preparation.
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Sign in to continue your personalized interview simulations.
            </p>
          </div>
        </div>

        {/* Swiss Auth Card */}
        <div className="card-swiss bg-surface p-8 sm:p-10 shadow-card space-y-6">
          
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded bg-error-light border border-error/20 flex items-start gap-2.5 text-xs text-error font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                Candidate Email
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
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

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              <span>{loading ? "Verifying Credentials..." : "Access Dashboard"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">
              Or Authenticate with Google
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Login Trigger */}
          <div>
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

            <div style={{ display: "none" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google sign-in attempt was rejected.");
                }}
              />
            </div>
          </div>

          {/* Registration Link */}
          <div className="pt-4 border-t border-border text-center text-xs text-ink-secondary">
            <span>New candidate? </span>
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Security Meta Footnote */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>AES-256 Encrypted Session &bull; Token Persistence</span>
        </div>

      </div>
    </div>
  );
}
