import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  LoaderCircle,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import VoiceInterviewModal from "../components/VoiceInterviewModal";
import api from "../api/api";

export default function InterviewWorkspace() {
  const location = useLocation();

  // Retrieve cached questions or state
  const cachedQuestions: string[] = useMemo(() => {
    const fromState = location.state?.questions;
    if (fromState && fromState.length > 0) return fromState;
    const raw = localStorage.getItem("cachedQuestions");
    return raw ? JSON.parse(raw) : [];
  }, [location.state?.questions]);

  const cachedSkills: string[] = useMemo(() => {
    const raw = localStorage.getItem("cachedSkills");
    return raw ? JSON.parse(raw) : [];
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"star" | "freeform">("star");

  // STAR form inputs
  const [starSituation, setStarSituation] = useState("");
  const [starTask, setStarTask] = useState("");
  const [starAction, setStarAction] = useState("");
  const [starResult, setStarResult] = useState("");

  // Freeform text input
  const [freeformAnswer, setFreeformAnswer] = useState("");

  // Evaluation state
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set initial question if passed from dashboard
  useEffect(() => {
    if (location.state?.activeQuestion && cachedQuestions.length > 0) {
      const idx = cachedQuestions.indexOf(location.state.activeQuestion);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [location.state?.activeQuestion, cachedQuestions]);

  const currentQuestion = cachedQuestions[currentIndex] || "No question selected.";

  const getCategory = (q: string) => {
    const qLower = q.toLowerCase();
    if (qLower.includes("react") || qLower.includes("frontend") || qLower.includes("dom") || qLower.includes("css")) return "Frontend Architecture";
    if (qLower.includes("system") || qLower.includes("scale") || qLower.includes("distributed")) return "System Design";
    if (qLower.includes("sql") || qLower.includes("postgres") || qLower.includes("database") || qLower.includes("cache")) return "Data Layer";
    if (qLower.includes("python") || qLower.includes("fastapi") || qLower.includes("node") || qLower.includes("backend")) return "Backend Engineering";
    return "Core Technical";
  };

  const currentCategory = getCategory(currentQuestion);

  const handleNext = () => {
    if (currentIndex < cachedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setEvaluation(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setEvaluation(null);
    }
  };

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(currentQuestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const compositeAnswer = useMemo(() => {
    if (activeTab === "star") {
      return `Situation: ${starSituation.trim() || "Not specified."}\nTask: ${starTask.trim() || "Not specified."}\nAction: ${starAction.trim() || "Not specified."}\nResult: ${starResult.trim() || "Not specified."}`;
    }
    return freeformAnswer.trim();
  }, [activeTab, starSituation, starTask, starAction, starResult, freeformAnswer]);

  const handleEvaluate = async () => {
    if (!compositeAnswer.trim()) return;

    setEvaluating(true);
    setEvaluation(null);

    const prompt = `Please evaluate my technical interview response.\n\nQuestion: "${currentQuestion}"\n\nCandidate Answer:\n${compositeAnswer}\n\nPlease format your critique strictly as:\n1. Strengths\n2. Areas to Refine / Missed Edge Cases\n3. Model High-Signal Response (under 90 seconds).`;

    try {
      const res = await api.post("/ai/chat", {
        message: prompt,
      });

      setEvaluation(res.data.reply || "Evaluation completed.");
    } catch (err) {
      console.log("EVALUATION ERROR:", err);
      setEvaluation("Could not connect to evaluation service. Please verify network access.");
    } finally {
      setEvaluating(false);
    }
  };

  const wordCount = useMemo(() => {
    return compositeAnswer.trim() ? compositeAnswer.trim().split(/\s+/).length : 0;
  }, [compositeAnswer]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Workspace Navigation Bar */}
      <div className="card-swiss bg-surface px-6 py-4 border border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Back & Category */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-border-strong">/</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-bold border border-primary-border uppercase">
              {currentCategory}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border">
              Question {cachedQuestions.length > 0 ? currentIndex + 1 : 0} of {cachedQuestions.length}
            </span>
          </div>
        </div>

        {/* Right: Step Pagination & Jump dropdown */}
        <div className="flex items-center gap-3">
          {cachedQuestions.length > 0 && (
            <select
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(Number(e.target.value));
                setEvaluation(null);
              }}
              className="text-xs font-mono px-3 py-1.5 rounded border border-border bg-surface text-ink-primary outline-none cursor-pointer"
            >
              {cachedQuestions.map((_, i) => (
                <option key={i} value={i}>
                  Jump to Q{i + 1}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded border border-border hover:bg-surface-subtle text-ink-primary disabled:opacity-40 transition-colors"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= cachedQuestions.length - 1}
              className="p-1.5 rounded border border-border hover:bg-surface-subtle text-ink-primary disabled:opacity-40 transition-colors"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {cachedQuestions.length === 0 ? (
        /* Empty State */
        <div className="card-swiss bg-surface p-12 text-center space-y-4 max-w-xl mx-auto">
          <HelpCircle className="w-8 h-8 text-ink-muted mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-ink-primary">
            No Interview Questions Loaded
          </h2>
          <p className="text-xs text-ink-secondary">
            Upload your resume document to generate your tailored interview syllabus.
          </p>
          <Link to="/upload" className="btn-primary text-xs !min-h-[38px] inline-flex">
            <span>Upload Resume Now</span>
          </Link>
        </div>
      ) : (
        /* 12-Column Grid: Question & Response (7 Cols) vs AI Evaluation (5 Cols) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Cols): Question & Answer Builder */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Question Card */}
            <div className="card-swiss bg-surface p-6 sm:p-8 space-y-4 text-left shadow-card">
              <div className="flex justify-between items-start gap-4">
                <span className="editorial-meta text-primary">TARGET CHALLENGE</span>
                <button
                  type="button"
                  onClick={handleCopyQuestion}
                  className="p-1.5 rounded border border-border text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors flex items-center gap-1 font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal leading-snug">
                “{currentQuestion}”
              </h2>

              {/* Focus points & Evaluator signals */}
              <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="editorial-meta text-ink-muted block">EVALUATOR FOCUS</span>
                  <p className="text-ink-secondary text-[11px] leading-snug">
                    Architecture trade-offs, concurrency handling, and error resiliency.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="editorial-meta text-ink-muted block">LINKED RESUME SKILLS</span>
                  <div className="flex flex-wrap gap-1">
                    {(cachedSkills.length > 0 ? cachedSkills.slice(0, 3) : ["System Design", "Databases", "APIs"]).map((s, idx) => (
                      <span key={idx} className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-surface-subtle border border-border text-ink-secondary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Construction Card */}
            <div className="card-swiss bg-surface p-6 sm:p-8 space-y-5 shadow-card text-left">
              {/* Tab Selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-border">
                <div className="inline-flex p-1 bg-surface-subtle rounded border border-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab("star")}
                    className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === "star"
                        ? "bg-primary text-white font-bold shadow-subtle"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    STAR Methodology Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("freeform")}
                    className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === "freeform"
                        ? "bg-primary text-white font-bold shadow-subtle"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    Freeform Response
                  </button>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-ink-secondary">
                  <span>{wordCount} words drafted</span>
                  <button
                    type="button"
                    onClick={() => setVoiceActive(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-light text-primary border border-primary-border font-semibold hover:bg-primary hover:text-white transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Practice Verbally</span>
                  </button>
                </div>
              </div>

              {/* STAR Form Fields */}
              {activeTab === "star" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-primary mb-1">
                      01 &bull; Situation (Context & Environment)
                    </label>
                    <textarea
                      rows={2}
                      className="input-field !min-h-[64px] text-xs resize-none"
                      placeholder="Describe the production setting, scale, or business scenario where this occurred..."
                      value={starSituation}
                      onChange={(e) => setStarSituation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-primary mb-1">
                      02 &bull; Task (Engineering Objective / Constraint)
                    </label>
                    <textarea
                      rows={2}
                      className="input-field !min-h-[64px] text-xs resize-none"
                      placeholder="What was the specific technical hurdle, SLA requirement, or bug to resolve?"
                      value={starTask}
                      onChange={(e) => setStarTask(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-primary mb-1">
                      03 &bull; Action (Architectural Decision & Execution)
                    </label>
                    <textarea
                      rows={3}
                      className="input-field !min-h-[80px] text-xs resize-none"
                      placeholder="Detail the technical decisions, code modifications, tools used, and engineering trade-offs..."
                      value={starAction}
                      onChange={(e) => setStarAction(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-primary mb-1">
                      04 &bull; Result (Quantified Impact & Takeaways)
                    </label>
                    <textarea
                      rows={2}
                      className="input-field !min-h-[64px] text-xs resize-none"
                      placeholder="State latency improvements, throughput, test coverage, or team outcomes (e.g. 40x speedup)..."
                      value={starResult}
                      onChange={(e) => setStarResult(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                /* Freeform Textarea */
                <div>
                  <textarea
                    rows={12}
                    className="input-field text-xs font-sans leading-relaxed resize-none"
                    placeholder="Draft your complete technical or behavioral answer here..."
                    value={freeformAnswer}
                    onChange={(e) => setFreeformAnswer(e.target.value)}
                  />
                </div>
              )}

              {/* Submit Evaluation CTA */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-mono text-[11px] text-ink-muted">
                  Feedback evaluated against production engineering hiring rubrics.
                </span>
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || wordCount < 5}
                  className="btn-primary text-xs !min-h-[40px] !px-4"
                >
                  {evaluating ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Critiquing Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for AI Critique</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Right Column (5 Cols): AI Critique Feedback Stream */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="card-swiss bg-surface border border-border p-6 sm:p-7 shadow-card space-y-5 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <h3 className="font-serif text-lg font-bold text-ink-primary">
                    AI Coach Evaluation
                  </h3>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-secondary">
                  {evaluating ? "ANALYZING" : evaluation ? "CRITIQUE COMPLETE" : "AWAITING RESPONSE"}
                </span>
              </div>

              {evaluating ? (
                <div className="py-16 text-center space-y-3">
                  <LoaderCircle className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="font-mono text-xs text-ink-secondary">
                    Evaluating answer with Gemini 2.0 Flash...
                  </p>
                </div>
              ) : evaluation ? (
                <div className="space-y-4">
                  <div className="p-4 rounded bg-surface-subtle border border-border max-h-[460px] overflow-y-auto scrollbar-editorial text-xs leading-relaxed text-ink-primary whitespace-pre-wrap font-sans">
                    {evaluation}
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => handleNext()}
                      className="btn-primary text-xs w-full justify-center"
                    >
                      <span>Proceed to Next Challenge</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 bg-surface-subtle rounded border border-border p-6">
                  <Lightbulb className="w-6 h-6 text-accent mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-sans text-xs font-bold text-ink-primary">
                      Ready for Evaluation
                    </h4>
                    <p className="text-[11px] text-ink-secondary max-w-xs mx-auto">
                      Draft your answer using the STAR tabs on the left, or click "Practice Verbally" to rehearse aloud with speech telemetry.
                    </p>
                  </div>
                </div>
              )}

              {/* Rubric Points */}
              <div className="pt-4 border-t border-border space-y-2 text-[11px] text-ink-secondary font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>STAR Structure Check (Situation, Task, Action, Result)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Technical depth & architecture tradeoff audit</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Voice Interview Modal */}
      {voiceActive && (
        <VoiceInterviewModal
          questionText={currentQuestion}
          onClose={() => setVoiceActive(false)}
          onComplete={(transcript, metrics) => {
            setVoiceActive(false);
            setFreeformAnswer(transcript);
            setActiveTab("freeform");
            // Auto submit for evaluation
            void (async () => {
              setEvaluating(true);
              try {
                const res = await api.post("/ai/chat", {
                  message: `Please evaluate my verbal interview answer.\n\nQuestion: "${currentQuestion}"\n\nSpoken Transcript: "${transcript}"\n\nDelivery Metrics: ${metrics.wordCount} words in ${metrics.elapsedSeconds}s (${metrics.wordsPerMinute} WPM, ${metrics.pace}); ${metrics.totalFillers} fillers detected.`,
                });
                setEvaluation(res.data.reply || "Evaluation received.");
              } catch (e) {
                console.error(e);
              } finally {
                setEvaluating(false);
              }
            })();
          }}
        />
      )}

    </div>
  );
}
