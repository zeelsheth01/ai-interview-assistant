import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }: any){

  return(

    <div className="flex bg-gradient-to-br from-[#0f172a] to-[#020617] min-h-screen text-white">

      <Sidebar />

      <div className="flex-1 p-10">

        <Topbar />

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">

          {children}

        </div>

      </div>

    </div>

  );
}
