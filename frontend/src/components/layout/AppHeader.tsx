import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  FileText,
  LayoutDashboard,
  Code2,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { APP_NAME } from "../../constants/brand";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "candidate@assessment.io";
  const userName = localStorage.getItem("userName") || userEmail.split("@")[0];

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Resume Intelligence",
      path: "/upload",
      icon: FileText,
      badge: "AI",
    },
    {
      label: "Practice Workspace",
      path: "/workspace",
      icon: Code2,
      badge: "Live",
    },
    {
      label: "Interview Minutes",
      path: "/pricing",
      icon: Coins,
      badge: null,
    },
  ];

  const isCurrent = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border shadow-subtle">
      {/* Top Utility Bar */}
      <div className="border-b border-border-subtle bg-surface-subtle py-1 px-4 sm:px-8 text-[11px] text-ink-secondary flex justify-between items-center tabular-nums">
        <div className="flex items-center gap-3">
          <span className="font-mono uppercase tracking-wider text-[10px] text-accent font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
            Candidate Intelligence Engine
          </span>
          <span className="hidden sm:inline text-border-strong">/</span>
          <span className="hidden sm:inline font-mono text-[10px] text-ink-muted">
            SWISS MINIMALIST INTERFACE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1 text-[11px] text-ink-muted">
            <ShieldCheck className="w-3 h-3 text-accent" />
            End-to-End Encrypted Session
          </span>
          <span className="font-mono text-[10px] text-ink-muted">v2.4.0</span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-ink-primary flex items-center justify-center text-white font-serif text-lg font-bold group-hover:bg-accent transition-colors">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-ink-primary tracking-tight leading-none">
                {APP_NAME}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted mt-0.5">
                Technical Interview Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-border">
            {navItems.map((item) => {
              const active = isCurrent(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
                    active
                      ? "text-ink-primary bg-surface-subtle font-bold border border-border"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-accent" : "text-ink-muted"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-light text-accent border border-accent-border font-medium">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Session & Account Info */}
        <div className="hidden md:flex items-center gap-4">
          {/* User pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-border bg-surface-subtle">
            <div className="w-6 h-6 rounded bg-accent-light text-accent flex items-center justify-center text-xs font-bold font-mono">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-ink-primary leading-tight max-w-[150px] truncate capitalize">
                {userName}
              </span>
              <span className="text-[10px] font-mono text-ink-muted leading-none truncate max-w-[150px]">
                {userEmail}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-ink-secondary hover:text-error hover:bg-error-light border border-transparent hover:border-error/20 rounded transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">Exit</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink-secondary hover:text-ink-primary border border-border rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2.5 p-2 rounded bg-surface-subtle border border-border">
            <div className="w-7 h-7 rounded bg-accent-light text-accent flex items-center justify-center text-xs font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-ink-primary">{userName}</span>
              <span className="text-[10px] font-mono text-ink-muted">{userEmail}</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const active = isCurrent(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                    active
                      ? "bg-accent-light text-accent font-semibold border border-accent-border"
                      : "text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-error bg-error-light border border-error/20 rounded"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
