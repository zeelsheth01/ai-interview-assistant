import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas font-sans text-ink-primary antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col p-6 md:p-8">
        <Topbar />
        <main className="flex-1 card-swiss bg-surface p-6 sm:p-8 shadow-card">
          {children}
        </main>
      </div>
    </div>
  );
}
