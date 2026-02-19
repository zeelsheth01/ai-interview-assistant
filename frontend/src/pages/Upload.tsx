import { useState } from "react";
import api from "../api/api";

export default function Upload() {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {

    console.log("FILE =", file);

    if (!file) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();

    // ⭐ must match FastAPI parameter name
    formData.append("file", file);

    try {

      setLoading(true);

      // ✅ DO NOT set Content-Type manually
      await api.post("/resume/upload", formData);

      alert("Resume uploaded successfully");

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
        onChange={(e) => {
          const selected = e.target.files?.[0] || null;
          console.log("SELECTED FILE =", selected);
          setFile(selected);
        }}
      />

      <br /><br />

      <button
        type="button"
        onClick={upload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

    </div>
  );
}
