
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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

      setSuccess("Account created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      console.log("REGISTER ERROR:", err);

      setError(
        err.response?.data?.detail ||
          "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 font-sans relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="grid md:grid-cols-5 bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-4xl w-full"
      >
        <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-purple-900/60 to-slate-900 border-r border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />

          <div className="relative z-10 flex items-center gap-2 text-purple-400 font-semibold font-outfit tracking-wide">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>ELEVATE AI</span>
          </div>

          <div className="relative z-10 my-12">
            <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white leading-tight mb-4">
              Join the <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Next Gen
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Start parsing your experience, generating challenges, and
              leveling up your technical interview game today.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-mono">
            v1.0.0 // Free Registration
          </div>
        </div>

        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold font-outfit text-white mb-2">
            Create Account
          </h2>

          <p className="text-slate-400 text-sm mb-8">
            Sign up in seconds to start preparing
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 mb-4 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 mb-4 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl"
            >
              {success}
            </motion.div>
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-300"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-300"
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                <input
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-300"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
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
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Register Account"}

              {!loading && (
                <ArrowRight className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

