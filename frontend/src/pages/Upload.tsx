import { useState } from "react";
import API from "../api/api";

export default function Upload(){

 const [file,setFile]=useState<File | null>(null);
 const [result,setResult]=useState<any>(null);

 const upload = async () => {

   if(!file) return;

   const formData = new FormData();

   formData.append("file",file);

   const res = await API.post("/resume/upload",formData);

   setResult(res.data.analysis);
 };

 return(
   <div>

     <h2>Upload Resume</h2>

     <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)}/>

     <button onClick={upload}>Upload</button>

     {result && <pre>{JSON.stringify(result,null,2)}</pre>}

   </div>
 );
}
