import { useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";

export default function Topbar() {
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail") || "candidate@elevate.ai";

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Interview Preparation";
      case "/upload":
        return "Upload Resume";
      default:
        return "Dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
      <div>
        <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">
          {getPageTitle()}
        </h2>
        <p className="text-xs text-slate-400">Prepare smarter. Crack your next interview.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-slate-300 max-w-[140px] truncate">
            {userEmail}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 rounded-xl transition duration-300 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
