import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";
import api from "../api/api";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const loadingSteps = [
    "Uploading resume to server...",
    "Extracting details from document...",
    "Running Gemini LLM parsing engine...",
    "Generating tailor-made technical questions...",
  ];

  // Rotate loading step messages for better UX
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    } else {
      setActiveStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select or drop a PDF file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setActiveStep(0);

      const res = await api.post("/resume/upload", formData);

      // Transition to last step right before navigating
      setActiveStep(3);
      await new Promise((resolve) => setTimeout(resolve, 800));

      navigate("/dashboard", {
        state: { resumeId: res.data.resume_id },
      });
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      alert("Resume analysis failed. Please verify the backend database is connected and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 relative">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="upload-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 text-center"
          >
            <div>
              <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
                Analyze your Resume
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                Upload your engineering resume to instantly generate custom, difficulty-tagged technical interview questions.
              </p>
            </div>

            {/* Dropzone component */}
            <UploadDropzone onFile={(f) => setFile(f)} />

            {/* Action button */}
            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <button
                  onClick={handleUpload}
                  className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/10 flex items-center gap-2 mx-auto cursor-pointer transition duration-300"
                >
                  <span>Start Interview Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center"
          >
            {/* Spinning glowing loader */}
            <div className="relative mb-8 w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner">
                {activeStep < 2 ? (
                  <FileText className="w-6 h-6 text-indigo-400 animate-pulse" />
                ) : (
                  <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
                )}
              </div>
            </div>

            {/* Loading text */}
            <h3 className="text-xl font-bold font-outfit text-white mb-2">
              Analyzing Candidate Profile
            </h3>
            
            {/* Steps list */}
            <div className="w-full max-w-sm space-y-3 mt-6 bg-white/[0.01] border border-white/5 rounded-2xl p-5 text-left font-sans">
              {loadingSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition duration-300 ${
                    index === activeStep
                      ? "text-indigo-400 font-semibold"
                      : index < activeStep
                      ? "text-emerald-500"
                      : "text-slate-600"
                  }`}
                >
                  {index < activeStep ? (
                    <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                  ) : (
                    <div
                      className={`w-4.5 h-4.5 rounded-full border shrink-0 flex items-center justify-center text-[10px] ${
                        index === activeStep
                          ? "border-indigo-500 bg-indigo-500/10 animate-pulse"
                          : "border-slate-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                  )}
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}