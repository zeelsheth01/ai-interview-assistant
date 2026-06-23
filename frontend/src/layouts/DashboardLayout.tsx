import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-100 font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden p-6 md:p-8">
        <Topbar />
        
        {/* Inner Card Panel */}
        <div className="flex-1 bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
