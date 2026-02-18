import { useState } from "react";
import api from "../api/api";

export default function Upload(){

  const [file,setFile]=useState<File|null>(null);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<any>(null);

  const upload = async ()=>{

    if(!file){
      alert("Select file first");
      return;
    }

    try{

      setLoading(true);

      const formData = new FormData();
      formData.append("file",file);

      const res = await api.post(
        "/resume/resume/upload",
        formData
      );

      console.log("AI RESULT:",res.data);

      // ⭐ SAVE RESULT INTO STATE
      setResult(res.data.analysis);

    }catch(err){

      console.log(err);
      alert("Upload failed");

    }finally{

      // ⭐ STOP LOADING
      setLoading(false);
    }
  };

  return(

    <div>

      <h1 className="text-2xl mb-6">Upload Resume</h1>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e)=>{
          if(e.target.files){
            setFile(e.target.files[0]);
          }
        }}
      />

      <button
        className="mt-6 bg-blue-500 p-2 rounded"
        onClick={upload}
      >
        {loading ? "Processing AI..." : "Upload"}
      </button>

      {/* ⭐ SHOW AI RESULT */}
      {result && (
        <div className="mt-8 bg-white/10 p-6 rounded-xl">
          <h2 className="text-xl mb-4">AI Interview Questions</h2>

          <pre className="whitespace-pre-wrap">
            {result.analysis}
          </pre>

        </div>
      )}

    </div>
  );
}
