import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UploadCloud, Sparkles } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 min-h-screen bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col justify-between">
      <div>
        {/* Logo area */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="font-extrabold font-outfit text-lg tracking-wide text-white">
            ELEVATE AI
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-300 ${
              isLinkActive("/dashboard")
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-300 ${
              isLinkActive("/upload")
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
            }`}
          >
            <UploadCloud className="w-4.5 h-4.5" />
            <span>Upload Resume</span>
          </Link>
        </nav>
      </div>

      <div className="text-center text-xs text-slate-500 border-t border-white/5 pt-4">
        Premium AI Assistant
      </div>
    </div>
  );
}
