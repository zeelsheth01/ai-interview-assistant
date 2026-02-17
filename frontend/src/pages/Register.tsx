import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {

  const navigate = useNavigate();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const registerUser = async () => {

    await axios.post(
      `http://127.0.0.1:8000/auth/register?email=${email}&password=${password}`
    );

    alert("Registered successfully");

    navigate("/");
  };

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />

      <button onClick={registerUser}>Register</button>
    </div>
  );
}
