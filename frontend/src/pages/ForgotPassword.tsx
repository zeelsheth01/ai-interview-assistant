import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../api/api";
import { APP_NAME } from "../constants/brand";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = Email, 2 = New Password, 3 = Complete
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please specify your registered account email.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters in length.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email,
        new_password: password,
      });

      setSuccess("Account password successfully updated.");
      setStep(3);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(
        detail || "Password reset failed. Please ensure the email address is registered."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="w-8 h-8 rounded bg-primary text-white font-serif font-bold text-lg flex items-center justify-center">
              A
            </span>
            <span className="font-serif text-2xl font-bold text-ink-primary tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <div className="pt-2">
            <span className="editorial-meta text-primary block mb-1">
              CREDENTIAL RECOVERY
            </span>
            <h1 className="font-editorial text-3xl text-ink-primary font-normal tracking-tight">
              {step === 3 ? "Password Updated" : "Reset Account Password"}
            </h1>
            <p className="text-xs text-ink-secondary mt-1">
              {step === 1 && "Confirm your email address to initiate verification."}
              {step === 2 && "Configure a new secure password for your candidate account."}
              {step === 3 && "Your credentials have been securely refreshed."}
            </p>
          </div>
        </div>

        {/* Swiss Card */}
        <div className="card-swiss bg-surface p-8 sm:p-10 shadow-card space-y-6">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-border text-[11px] font-mono text-ink-secondary">
            <span className={step >= 1 ? "text-primary font-bold" : "text-ink-muted"}>01 IDENTIFY</span>
            <span>&bull;</span>
            <span className={step >= 2 ? "text-primary font-bold" : "text-ink-muted"}>02 CONFIGURE</span>
            <span>&bull;</span>
            <span className={step >= 3 ? "text-primary font-bold" : "text-ink-muted"}>03 CONFIRMED</span>
          </div>

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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded bg-success-light border border-success/20 flex items-start gap-2.5 text-xs text-success font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                  Registered Account Email
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

              <button
                type="submit"
                className="btn-primary w-full mt-2"
              >
                <span>Continue to Password Reset</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded bg-surface-subtle border border-border text-xs text-ink-secondary">
                Resetting password for: <strong className="text-ink-primary font-mono">{email}</strong>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                  New Password
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
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="input-field pl-10 pr-10"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  <span>{loading ? "Updating..." : "Commit Reset"}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Completed */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-success-light text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-ink-secondary">
                Your password change was verified. Redirecting you to sign in automatically...
              </p>
              <Link to="/login" className="btn-primary inline-flex text-xs">
                <span>Sign In Immediately</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Return link */}
          <div className="pt-4 border-t border-border text-center text-xs text-ink-secondary">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink-primary font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
