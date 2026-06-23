import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, HelpCircle, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import AIChat from "../components/AIChat";
import api from "../api/api";

export default function Dashboard() {
  const location = useLocation();
  const resumeId = location.state?.resumeId;

  const [questions, setQuestions] = useState<string[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch questions automatically after redirect
  useEffect(() => {
    if (!resumeId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resume/${resumeId}`);
        setQuestions(res.data.questions || []);
        if (res.data.questions && res.data.questions.length > 0) {
          setActiveQuestion(res.data.questions[0]);
        }
      } catch (err) {
        console.log("FETCH QUESTION ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [resumeId]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getTagsForQuestion = (q: string) => {
    const qLower = q.toLowerCase();
    const tags = [];
    if (
      qLower.includes("react") ||
      qLower.includes("frontend") ||
      qLower.includes("css") ||
      qLower.includes("js") ||
      qLower.includes("javascript") ||
      qLower.includes("component") ||
      qLower.includes("html")
    ) {
      tags.push({ label: "Frontend", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" });
    }
    if (
      qLower.includes("sql") ||
      qLower.includes("postgres") ||
      qLower.includes("database") ||
      qLower.includes("query") ||
      qLower.includes("prisma") ||
      qLower.includes("db")
    ) {
      tags.push({ label: "Database", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" });
    }
    if (
      qLower.includes("system") ||
      qLower.includes("architecture") ||
      qLower.includes("scale") ||
      qLower.includes("design") ||
      qLower.includes("microservices")
    ) {
      tags.push({ label: "System Design", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" });
    }
    if (
      qLower.includes("python") ||
      qLower.includes("django") ||
      qLower.includes("fastapi") ||
      qLower.includes("node") ||
      qLower.includes("backend") ||
      qLower.includes("api") ||
      qLower.includes("server")
    ) {
      tags.push({ label: "Backend", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" });
    }
    if (tags.length === 0) {
      tags.push({ label: "Core Technical", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" });
    }
    return tags;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)]">
      {/* LEFT PANEL: Generated Questions (2/5 columns) */}
      <div className="lg:col-span-2 flex flex-col h-full overflow-hidden bg-white/[0.01] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold font-outfit text-white">Generated Syllabus</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Based on your resume, Gemini has generated the following questions. Click any card to load it in the chat assistant.
        </p>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
            <span className="text-xs text-slate-500">Loading syllabus...</span>
          </div>
        ) : questions.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            <AnimatePresence>
              {questions.map((q, i) => {
                const isActive = activeQuestion === q;
                const tags = getTagsForQuestion(q);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveQuestion(q)}
                    className={`group relative p-4 rounded-xl border cursor-pointer transition duration-300 ${
                      isActive
                        ? "bg-indigo-500/5 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                        : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-mono font-bold mt-1 px-1.5 py-0.5 rounded ${
                          isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500"
                        }`}>
                          Q{i + 1}
                        </span>
                        <div>
                          <p className={`text-sm leading-relaxed ${
                            isActive ? "text-white font-medium" : "text-slate-300"
                          }`}>
                            {q}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tag.color}`}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(q, i);
                          }}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition"
                          title="Copy question"
                        >
                          {copiedIndex === i ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <ArrowUpRight className={`w-3.5 h-3.5 transition duration-300 ${
                          isActive ? "text-indigo-400 translate-x-0.5 -translate-y-0.5" : "text-slate-500"
                        }`} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No questions generated yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Go to the upload page to analyze a resume document.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Chat Workspace (3/5 columns) */}
      <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden h-full">
        <AIChat activeQuestionText={activeQuestion} />
      </div>
    </div>
  );
}