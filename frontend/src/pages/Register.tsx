import { useState } from "react";
import API from "../api/api";

export default function Register(){

 const [email,setEmail]=useState<string>("");
 const [password,setPassword]=useState<string>("");

 const register = async () => {

   await API.post("/auth/register", null,{
     params:{email,password}
   });

   alert("Registered!");
 };

 return(
   <div>
     <h2>Register</h2>

     <input onChange={e=>setEmail(e.target.value)} placeholder="email"/>
     <input type="password" onChange={e=>setPassword(e.target.value)} placeholder="password"/>

     <button onClick={register}>Register</button>
   </div>
 );
}
