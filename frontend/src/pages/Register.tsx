import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Register(){

  const navigate = useNavigate();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);

  const handleRegister = async ()=>{

    try{

      setLoading(true);

      await api.post("/auth/register",{
        email,
        password
      });

      navigate("/");

    }catch(err:any){

      console.log("REGISTER ERROR:",err.response?.data);

      alert(err.response?.data?.detail || "Register failed");

    }finally{
      setLoading(false);
    }
  }

  return(

    <div className="flex items-center justify-center min-h-screen">

      <div className="grid grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

        <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-purple-600 to-indigo-700">

          <h1 className="text-4xl font-bold mb-4">Create Account</h1>
          <p>Start AI interview preparation today.</p>

        </div>

        <div className="p-12 w-[400px]">

          <h2 className="text-2xl font-semibold mb-6">Register</h2>

          <input
            className="w-full p-3 mb-4 rounded bg-white/20"
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-6 rounded bg-white/20"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            className="w-full bg-purple-500 hover:bg-purple-600 p-3 rounded-lg font-bold"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="mt-4 text-sm">
            Already have account? <Link to="/" className="text-blue-300">Login</Link>
          </p>

        </div>

      </div>

    </div>
  );
}
