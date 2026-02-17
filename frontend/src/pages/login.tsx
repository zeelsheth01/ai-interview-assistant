import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {

      await axios.post(
        `http://127.0.0.1:8000/auth/login?email=${email}&password=${password}`
      );

      localStorage.setItem("token", "logged");

      navigate("/dashboard");

    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="container">
      <h2>AI Interview Assistant</h2>

      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />

      <button onClick={loginUser}>Login</button>

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
