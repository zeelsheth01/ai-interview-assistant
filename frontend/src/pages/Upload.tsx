import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  Cpu,
} from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";
import api from "../api/api";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [numQuestions, setNumQuestions] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const processingSteps = [
    {
      num: "01",
      title: "Uploading your document",
      detail: "Transferring binary payload to FastAPI document service.",
    },
    {
      num: "02",
      title: "Extracting resume information",
      detail: "Executing PyMuPDF and OCR to parse text and experience entries.",
    },
    {
      num: "03",
      title: "Identifying professional skills",
      detail: "Taxonomy vectorization across 15+ engineering frameworks.",
    },
    {
      num: "04",
      title: "Generating personalized questions",
      detail: "Synthesizing production interview questions via Gemini LLM.",
    },
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (loading) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2600);
    } else {
      setActiveStep(0);
    }

    return () => clearInterval(interval);
  }, [loading, processingSteps.length]);

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a valid PDF resume to proceed.");
      return;
    }

    setErrorMessage(null);

    try {
      setLoading(true);
      setActiveStep(0);

      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await api.post(
        `/resume/upload?num_questions=${numQuestions}`,
        formData
      );

      console.log("UPLOAD SUCCESS:", res.data);

      setActiveStep(3);

      await new Promise((resolve) => setTimeout(resolve, 800));

      navigate("/dashboard", {
        state: {
          resumeId: res.data.resume_id,
          questions: res.data.questions,
          skills: res.data.skills,
        },
      });
    } catch (err: unknown) {
      console.log("UPLOAD ERROR:", err);
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setErrorMessage(
        detail ||
          "Resume analysis failed. Please verify the PDF format and network connectivity."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Editorial Page Header */}
      <div className="space-y-3 text-left border-b border-border pb-6">
        <span className="editorial-meta text-primary block">
          DOCUMENT INGESTION &bull; OCR ANALYSIS
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal leading-tight">
          Understand your experience.
        </h1>
        <p className="font-sans text-sm sm:text-base text-ink-secondary max-w-2xl">
          Upload your resume to build an interview preparation plan based on your actual skills and projects.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!loading ? (
          /* Main Ingestion Form State */
          <motion.div
            key="upload-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-4 rounded bg-error-light border border-error/20 flex items-start gap-3 text-xs text-error font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Swiss Upload Card */}
            <div className="card-swiss bg-surface p-6 sm:p-10 shadow-card space-y-8">
              
              {/* Dropzone interaction */}
              <UploadDropzone
                selectedFile={file}
                onFile={(selected) => {
                  setFile(selected);
                  if (selected) setErrorMessage(null);
                }}
              />

              {/* Configuration Controls Grid */}
              <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Number of Questions */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                    Interview Challenge Volume
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="input-field cursor-pointer font-sans"
                  >
                    <option value={10}>10 Questions (Standard Loop)</option>
                    <option value={15}>15 Questions (Thorough Assessment)</option>
                    <option value={20}>20 Questions (Senior Panel Readiness)</option>
                    <option value={30}>30 Questions (Full Day Simulation)</option>
                    <option value={40}>40 Questions (Comprehensive Bank)</option>
                  </select>
                </div>

                {/* Processing Mode Notice */}
                <div className="p-4 rounded bg-surface-subtle border border-border space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                    <span>Gemini 2.0 Flash Extraction</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary leading-snug">
                    Resumes are matched against full-stack, distributed systems, and core CS heuristics.
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border">
                <span className="font-mono text-xs text-ink-secondary">
                  {file ? `Document selected: ${file.name}` : "Awaiting PDF resume attachment"}
                </span>

                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="btn-primary w-full sm:w-auto"
                >
                  <span>Start Interview Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Assessment Expectations Note */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded border border-border bg-surface-subtle space-y-1">
                <span className="editorial-meta text-primary block">ACCURACY</span>
                <h4 className="font-sans text-xs font-bold text-ink-primary">100% Resume-Grounded</h4>
                <p className="text-[11px] text-ink-secondary">
                  No generic trivia. Questions probe your claimed frameworks and code architectures.
                </p>
              </div>
              <div className="p-4 rounded border border-border bg-surface-subtle space-y-1">
                <span className="editorial-meta text-primary block">STANDARDS</span>
                <h4 className="font-sans text-xs font-bold text-ink-primary">STAR Evaluation</h4>
                <p className="text-[11px] text-ink-secondary">
                  Situation, Task, Action, Result structured prompts to hone conversational answers.
                </p>
              </div>
              <div className="p-4 rounded border border-border bg-surface-subtle space-y-1">
                <span className="editorial-meta text-primary block">OFFLINE ENGINE</span>
                <h4 className="font-sans text-xs font-bold text-ink-primary">Fault Tolerant Fallback</h4>
                <p className="text-[11px] text-ink-secondary">
                  High-availability caching and curated domain banks ensure unbroken practice.
                </p>
              </div>
            </div>

          </motion.div>
        ) : (
          /* Processing State (Analysis Progress) */
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-swiss bg-surface p-8 sm:p-12 shadow-card space-y-8"
          >
            <div className="text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded bg-primary-light text-primary mx-auto flex items-center justify-center border border-primary-border">
                <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-ink-primary">
                Analyzing Candidate Profile
              </h2>
              <p className="text-xs text-ink-secondary">
                Inspecting document payload: <strong className="text-ink-primary font-mono">{file?.name}</strong>
              </p>
            </div>

            {/* Swiss Step-by-Step Progress Timeline */}
            <div className="max-w-xl mx-auto space-y-3">
              {processingSteps.map((step, index) => {
                const isFinished = index < activeStep;
                const isCurrent = index === activeStep;

                return (
                  <div
                    key={step.num}
                    className={`p-4 rounded border transition-colors flex items-start gap-4 ${
                      isCurrent
                        ? "bg-primary-light/40 border-primary"
                        : isFinished
                        ? "bg-surface border-border-subtle text-ink-secondary"
                        : "bg-surface-subtle border-border opacity-50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isFinished ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                      ) : (
                        <span className="font-mono text-xs text-ink-muted">{step.num}</span>
                      )}
                    </div>

                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink-primary">
                          {step.title}
                        </span>
                        {isCurrent && (
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-primary text-white">
                            RUNNING
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-ink-secondary">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[11px] font-mono text-ink-muted">
              FastAPI Processing Pipeline &bull; Do not refresh the page
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
