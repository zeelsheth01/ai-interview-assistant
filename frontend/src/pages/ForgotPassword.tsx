import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset, 3 = Success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyEmail = () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    // Move to step 2 directly and verify on submit
    setStep(2);
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email,
        new_password: password,
      });

      setSuccess("Password reset successfully! Redirecting...");
      setStep(3);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to reset password. Verify email is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 font-sans relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="grid md:grid-cols-5 bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-4xl w-full"
      >
        {/* Left Promo Area */}
        <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-indigo-900/60 to-slate-900 border-r border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />

          <div className="relative z-10 flex items-center gap-2 text-indigo-400 font-semibold font-outfit tracking-wide">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>ELEVATE AI</span>
          </div>

          <div className="relative z-10 my-12">
            <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white leading-tight mb-4">
              Security <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Recovery
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Reset your credentials securely. If your account is registered, you can recover write-access immediately.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-mono">
            v1.0.0 // Account Security
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold font-outfit text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-400 text-sm mb-8">
                  Enter your email address to begin the recovery process
                </p>

                {error && (
                  <div className="p-3 mb-4 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleVerifyEmail}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition duration-300"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white transition p-1 bg-white/5 rounded-lg border border-white/5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-mono">{email}</span>
                </div>

                <h2 className="text-2xl font-bold font-outfit text-white mb-2">
                  Choose New Password
                </h2>
                <p className="text-slate-400 text-sm mb-8">
                  Enter your new password to complete recovery
                </p>

                {error && (
                  <div className="p-3 mb-4 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold font-outfit text-white mb-2">
                  Success!
                </h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-slate-400">
            Remembered password?{" "}
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
