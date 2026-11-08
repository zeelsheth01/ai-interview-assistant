import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Code2, Coins } from "lucide-react";
import { APP_NAME } from "../constants/brand";

export default function Sidebar() {
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Resume Intelligence", path: "/upload", icon: FileText },
    { label: "Practice Workspace", path: "/workspace", icon: Code2 },
    { label: "Voice Minutes", path: "/pricing", icon: Coins },
  ];

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border p-6 flex flex-col justify-between font-sans">
      <div className="space-y-8">
        {/* Logo area */}
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 group">
          <div className="w-8 h-8 rounded bg-primary text-white font-serif font-bold text-lg flex items-center justify-center">
            A
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif text-lg font-bold tracking-tight text-ink-primary leading-none">
              {APP_NAME}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted mt-0.5">
              Candidate Suite
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex flex-col space-y-1">
          {navLinks.map((item) => {
            const active = isLinkActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-primary-light text-primary font-bold border border-primary-border"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-ink-muted"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border text-[11px] font-mono text-ink-muted text-center">
        SYSTEM PROTOCOL &bull; v2.4
      </div>
    </aside>
  );
}
