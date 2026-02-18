import { useState } from "react";
import api from "../api/api";
import UploadDropzone from "../components/UploadDropzone";

export default function Upload(){

  const [file,setFile]=useState<any>();
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<any>(null);

  const upload=async()=>{

    if(!file) return alert("Select file first");

    const formData=new FormData();
    formData.append("file",file);

    setLoading(true);

    try{

      const res=await api.post("/resume/upload",formData);

      setResult(res.data);

    }catch(err){

      alert("Upload failed");

    }

    setLoading(false);
  }

  return(

    <div>

      <h1 className="text-2xl mb-6">Upload Resume</h1>

      <UploadDropzone onFile={setFile}/>

      <button
        className="mt-6 bg-blue-500 p-2 rounded"
        onClick={upload}
      >
        {loading ? "Processing..." : "Upload"}
      </button>

      {result && (

        <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-xl">

          <h2 className="text-xl mb-3">AI Analysis</h2>

          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(result,null,2)}
          </pre>

        </div>

      )}

    </div>

  );
}
