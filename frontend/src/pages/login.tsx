import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [email,setEmail]=useState<string>("");
  const [password,setPassword]=useState<string>("");

  const navigate = useNavigate();

  const login = async () => {

    const res = await API.post("/auth/login", null,{
      params:{email,password}
    });

    localStorage.setItem("token",res.data.token);

    navigate("/upload");
  };

  return (
    <div>
      <h2>Login</h2>

      <input onChange={e=>setEmail(e.target.value)} placeholder="email"/>
      <input type="password" onChange={e=>setPassword(e.target.value)} placeholder="password"/>

      <button onClick={login}>Login</button>
    </div>
  );
}
