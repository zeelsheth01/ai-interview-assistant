import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await api.post("/auth/login", null,{
        params:{ email,password }
      });

      // store auth
      localStorage.setItem("loggedIn","true");

      navigate("/dashboard");

    } catch(err){

      alert("Login failed");

    }
  }

  return (

    <div className="flex items-center justify-center min-h-screen">

      <div className="grid grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

        <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-blue-600 to-purple-700">

          <h1 className="text-4xl font-bold mb-4">AI Interview Assistant</h1>

          <p>Prepare smarter. Practice faster. Crack interviews.</p>

        </div>

        <div className="p-12 w-[400px]">

          <h2 className="text-2xl font-semibold mb-6">Login</h2>

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
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-bold"
          >
            Login
          </button>

          <p className="mt-4 text-sm">
            Don't have account? <Link to="/register" className="text-blue-300">Register</Link>
          </p>

        </div>

      </div>

    </div>
  );
}
