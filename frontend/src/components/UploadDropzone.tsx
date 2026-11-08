import { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadDropzoneProps {
  onFile: (file: File | null) => void;
  selectedFile?: File | null;
}

export default function UploadDropzone({ onFile, selectedFile: externalFile }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFile = externalFile !== undefined ? externalFile : internalFile;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    
    if (!isPdf) {
      setErrorMsg("Only PDF documents are supported for hybrid OCR parsing.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File exceeds the 10MB size threshold.");
      return;
    }

    setInternalFile(file);
    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalFile(null);
    onFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Drop Target */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 sm:p-12 rounded border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragActive
            ? "border-primary bg-primary-light/50"
            : currentFile
            ? "border-primary/40 bg-surface"
            : "border-border hover:border-border-strong bg-surface hover:bg-surface-subtle"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {currentFile ? (
          /* Selected File View */
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded bg-primary-light text-primary flex items-center justify-center border border-primary-border">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="font-sans font-bold text-sm text-ink-primary max-w-sm truncate">
                  {currentFile.name}
                </span>
                <span className="font-mono text-xs text-ink-secondary tabular-nums">
                  ({formatFileSize(currentFile.size)})
                </span>
              </div>
              <p className="font-mono text-[11px] text-primary flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Analysis
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-error hover:bg-error-light hover:border-error/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
              <button
                type="button"
                className="text-xs text-ink-secondary hover:text-ink-primary font-medium underline underline-offset-2"
              >
                Choose another file
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Prompt View */
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded bg-surface-subtle text-ink-secondary flex items-center justify-center border border-border">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>

            <div className="space-y-1">
              <p className="font-sans text-sm font-semibold text-ink-primary">
                Drag and drop your resume here, or{" "}
                <span className="text-primary underline underline-offset-2">browse files</span>
              </p>
              <p className="font-mono text-xs text-ink-secondary">
                PDF format only &bull; Maximum file size 10MB
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-block font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-surface-subtle border border-border text-ink-muted">
                FastAPI OCR &bull; PyMuPDF Ingestion
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 rounded bg-error-light border border-error/20 flex items-center gap-2 text-xs text-error font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
