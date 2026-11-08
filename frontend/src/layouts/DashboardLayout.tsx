import type { ReactNode } from "react";
import AppHeader from "../components/layout/AppHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink-primary selection:bg-accent selection:text-white">
      {/* Editorial App Header */}
      <AppHeader />

      {/* Primary Workspace Frame (Swiss 12-column Grid Container, max ~1280px) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>

      {/* Editorial Footer Strip */}
      <footer className="border-t border-border bg-surface py-5 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink-secondary">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-ink-primary">AI Interview Assistant</span>
            <span className="text-border-strong">/</span>
            <span className="font-mono text-[11px] text-ink-muted">
              Editorial Precision &bull; Swiss Minimalist Architecture
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] text-ink-muted">
            <span>LLM: GEMINI 2.0 FLASH</span>
            <span>&bull;</span>
            <span>STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
