import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText } from "lucide-react";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
}

export default function UploadDropzone({ onFile }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFileName(file.name);
        onFile(file);
      } else {
        alert("Only PDF files are accepted.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFile(file);
    }
  };

  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative p-12 md:p-16 rounded-2xl text-center cursor-pointer block border-2 border-dashed transition-all duration-300 ${
        isDragActive
          ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
          : selectedFileName
          ? "border-purple-500/50 bg-purple-500/5"
          : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {selectedFileName ? (
          <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <FileText className="w-8 h-8 animate-bounce" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>
        )}

        <div>
          <p className="text-white font-semibold font-outfit text-base">
            {selectedFileName ? selectedFileName : "Drag & Drop your resume here"}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {selectedFileName ? "Click to change file" : "or click to select file from device"}
          </p>
        </div>

        <div className="text-slate-500 text-[10px] mt-2 font-mono uppercase tracking-wider">
          PDF format only // Max 10MB
        </div>
      </div>

      <input
        hidden
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />
    </motion.label>
  );
}
