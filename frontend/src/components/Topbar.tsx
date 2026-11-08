import { useLocation, Link, useNavigate } from "react-router-dom";
import { LogOut, User, Wallet } from "lucide-react";

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "candidate@interviewassistant.io";

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Interview Preparation Workspace";
      case "/upload":
        return "Resume Intelligence Engine";
      case "/workspace":
        return "Targeted Practice Chamber";
      case "/pricing":
        return "Prepaid Voice Minutes";
      default:
        return "Dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center mb-8 pb-4 border-b border-border font-sans">
      <div className="text-left">
        <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-ink-primary tracking-tight">
          {getPageTitle()}
        </h2>
        <p className="font-mono text-xs text-ink-secondary mt-0.5">
          Grounded technical challenges &bull; STAR delivery analysis
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/pricing"
          className="btn-secondary text-xs !min-h-[36px] !px-3"
        >
          <Wallet className="h-3.5 w-3.5 text-accent" />
          <span>Minutes</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-surface text-xs font-mono">
          <div className="w-5 h-5 rounded bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold">
            <User className="w-3 h-3" />
          </div>
          <span className="text-ink-primary max-w-[130px] truncate">
            {userEmail}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-ink-secondary hover:text-error hover:bg-error-light border border-transparent hover:border-error/20 rounded transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
