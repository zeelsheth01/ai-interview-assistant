import { Link } from "react-router-dom";

export default function Sidebar(){

  return(

    <div className="w-64 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-6">

      <h1 className="text-2xl font-bold mb-10 text-white">
        AI Assistant
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard" className="hover:text-blue-400 transition">
          Dashboard
        </Link>

        <Link to="/upload" className="hover:text-purple-400 transition">
          Upload Resume
        </Link>

      </nav>

    </div>

  );
}
