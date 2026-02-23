import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Upload() {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const upload = async () => {

    if (!file) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      setLoading(true);

      const res = await api.post("/resume/upload", formData);

      alert(res.data.msg);

      // ✅ Redirect to dashboard and send resumeId
      navigate("/dashboard", {
        state: { resumeId: res.data.resume_id }
      });

    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h3>Upload Resume</h3>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={upload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

    </div>
  );
}