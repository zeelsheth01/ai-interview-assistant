import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Copy,
  Check,
  HelpCircle,
  ArrowUpRight,
  ArrowRight,
  Mic,
  Search,
  FileText,
  Code2,
} from "lucide-react";
import AIChat from "../components/AIChat";
import VoiceInterviewModal, { type SpeechMetrics } from "../components/VoiceInterviewModal";
import api from "../api/api";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve resume state from route or localStorage
  const resumeId = location.state?.resumeId || localStorage.getItem("latestResumeId");
  const initialQuestions = location.state?.questions;
  const initialSkills = location.state?.skills;

  const [questions, setQuestions] = useState<string[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) return initialQuestions;
    const cached = localStorage.getItem("cachedQuestions");
    return cached ? JSON.parse(cached) : [];
  });

  const [skills, setSkills] = useState<string[]>(() => {
    if (initialSkills && initialSkills.length > 0) return initialSkills;
    const cached = localStorage.getItem("cachedSkills");
    return cached ? JSON.parse(cached) : [];
  });

  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceQuestion, setVoiceQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [answerDraft, setAnswerDraft] = useState<{
    question: string;
    transcript: string;
    metrics: SpeechMetrics;
  } | null>(null);

  const userEmail = localStorage.getItem("userEmail") || "candidate@assessment.io";
  const userName = localStorage.getItem("userName") || userEmail.split("@")[0];

  // Fetch questions if resumeId is provided
  useEffect(() => {
    if (!resumeId) return;

    localStorage.setItem("latestResumeId", String(resumeId));

    // If we already have initial questions, cache them and select first
    if (initialQuestions && initialQuestions.length > 0) {
      localStorage.setItem("cachedQuestions", JSON.stringify(initialQuestions));
      if (initialSkills) {
        localStorage.setItem("cachedSkills", JSON.stringify(initialSkills));
      }
      setActiveQuestion(initialQuestions[0]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resume/${resumeId}`);
        const fetchedQuestions = res.data.questions || [];
        const fetchedSkills = res.data.skills || [];

        setQuestions(fetchedQuestions);
        setSkills(fetchedSkills);
        localStorage.setItem("cachedQuestions", JSON.stringify(fetchedQuestions));
        localStorage.setItem("cachedSkills", JSON.stringify(fetchedSkills));

        if (fetchedQuestions.length > 0) {
          setActiveQuestion(fetchedQuestions[0]);
        }
      } catch (err) {
        console.log("FETCH QUESTION ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [resumeId, initialQuestions, initialSkills]);

  // Set default active question
  useEffect(() => {
    if (questions.length > 0 && !activeQuestion) {
      setActiveQuestion(questions[0]);
    }
  }, [questions, activeQuestion]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getTagsForQuestion = (q: string) => {
    const qLower = q.toLowerCase();
    const tags: Array<{ label: string; category: string }> = [];

    if (
      qLower.includes("react") ||
      qLower.includes("frontend") ||
      qLower.includes("css") ||
      qLower.includes("js") ||
      qLower.includes("javascript") ||
      qLower.includes("component") ||
      qLower.includes("dom") ||
      qLower.includes("html")
    ) {
      tags.push({ label: "Frontend", category: "Frontend" });
    }
    if (
      qLower.includes("sql") ||
      qLower.includes("postgres") ||
      qLower.includes("database") ||
      qLower.includes("query") ||
      qLower.includes("mongo") ||
      qLower.includes("prisma") ||
      qLower.includes("db")
    ) {
      tags.push({ label: "Database", category: "Database" });
    }
    if (
      qLower.includes("system") ||
      qLower.includes("architecture") ||
      qLower.includes("scale") ||
      qLower.includes("design") ||
      qLower.includes("microservices") ||
      qLower.includes("distributed")
    ) {
      tags.push({ label: "System Design", category: "System Design" });
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
      tags.push({ label: "Backend", category: "Backend" });
    }
    if (
      qLower.includes("docker") ||
      qLower.includes("aws") ||
      qLower.includes("git") ||
      qLower.includes("ci/cd") ||
      qLower.includes("cloud")
    ) {
      tags.push({ label: "DevOps", category: "DevOps" });
    }
    if (tags.length === 0) {
      tags.push({ label: "Core Technical", category: "Core Technical" });
    }
    return tags;
  };

  const getDifficulty = (q: string, idx: number) => {
    const qLower = q.toLowerCase();
    if (
      qLower.includes("architecture") ||
      qLower.includes("distributed") ||
      qLower.includes("concurrency") ||
      qLower.includes("scale")
    ) {
      return { label: "Senior / Principal", level: "Senior" };
    }
    if (idx % 2 === 0) {
      return { label: "Mid Level", level: "Mid" };
    }
    return { label: "Foundational", level: "Junior" };
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory === "All") return true;

      const tags = getTagsForQuestion(q);
      return tags.some((t) => t.category === selectedCategory);
    });
  }, [questions, searchQuery, selectedCategory]);

  const categories = ["All", "Frontend", "Backend", "Database", "System Design", "DevOps", "Core Technical"];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Candidate Preparation Suite &bull; {userName}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal leading-tight">
            Your interview preparation.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-secondary max-w-xl">
            Questions built around your declared experience, projects, and demonstrated technical stack.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/upload"
            className="btn-secondary text-xs !min-h-[40px] !px-3"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Re-analyze Resume</span>
          </Link>
          <Link
            to="/workspace"
            className="btn-primary text-xs !min-h-[40px] !px-3 shadow-subtle"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Practice Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Candidate Profile & Status Ribbon (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-swiss bg-surface p-4 sm:p-5 space-y-1">
          <span className="editorial-meta text-ink-muted block">ANALYSIS STATUS</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-sans text-sm font-bold text-ink-primary">
              {questions.length > 0 ? "Profile Synced" : "Pending Ingestion"}
            </span>
          </div>
          <span className="font-mono text-[10px] text-ink-muted block">
            {resumeId ? `Session ID: #${resumeId}` : "No resume on file"}
          </span>
        </div>

        <div className="card-swiss bg-surface p-4 sm:p-5 space-y-1">
          <span className="editorial-meta text-ink-muted block">SYLLABUS VOLUME</span>
          <span className="font-mono text-2xl font-bold text-ink-primary tabular-nums block">
            {questions.length}
          </span>
          <span className="font-mono text-[10px] text-ink-secondary block">
            Tailored challenges
          </span>
        </div>

        <div className="card-swiss bg-surface p-4 sm:p-5 space-y-1">
          <span className="editorial-meta text-ink-muted block">PARSED SKILLS</span>
          <span className="font-mono text-2xl font-bold text-primary tabular-nums block">
            {skills.length > 0 ? skills.length : "12"}
          </span>
          <span className="font-mono text-[10px] text-ink-secondary block truncate">
            {skills.slice(0, 3).join(", ") || "Full-stack focus"}
          </span>
        </div>

        <div className="card-swiss bg-surface p-4 sm:p-5 space-y-1">
          <span className="editorial-meta text-ink-muted block">ESTIMATED PREP</span>
          <span className="font-mono text-2xl font-bold text-accent tabular-nums block">
            {Math.max(15, questions.length * 3)}m
          </span>
          <span className="font-mono text-[10px] text-ink-secondary block">
            Target review duration
          </span>
        </div>
      </div>

      {/* Recommended Spotlight Question Card (If questions exist) */}
      {questions.length > 0 && (
        <div className="card-swiss bg-surface-subtle p-6 border-l-4 border-l-primary space-y-3 text-left shadow-subtle">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-bold border border-primary-border">
              HIGH PRIORITY &bull; RECOMMENDED FIRST PRACTICE
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              Grounded in Declared Architecture
            </span>
          </div>

          <p className="font-serif text-lg sm:text-xl text-ink-primary font-medium leading-snug">
            “{questions[0]}”
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {getTagsForQuestion(questions[0]).map((t, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary"
                >
                  {t.label}
                </span>
              ))}
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-accent font-semibold">
                High Signal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVoiceQuestion(questions[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-ink-primary hover:border-primary transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-accent" />
                <span>Practice Verbally</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveQuestion(questions[0]);
                  navigate("/workspace", { state: { activeQuestion: questions[0] } });
                }}
                className="btn-primary text-xs !min-h-[34px] !px-3"
              >
                <span>Open in Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 12-Column Split: Syllabus & Search (7 Cols) vs Live AI Coach (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Question Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Filter questions by keyword or technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field !min-h-[40px] pl-9 text-xs"
                />
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[11px] text-ink-secondary">
                  Showing {filteredQuestions.length} of {questions.length}
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-[11px] font-mono uppercase tracking-wider shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white font-bold"
                      : "bg-surface border border-border text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question List View */}
          {loading ? (
            <div className="card-swiss bg-surface p-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              <span className="font-mono text-xs text-ink-secondary">
                Loading tailored interview syllabus...
              </span>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const isActive = activeQuestion === q;
                const tags = getTagsForQuestion(q);
                const diff = getDifficulty(q, idx);

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveQuestion(q)}
                    className={`card-swiss p-5 cursor-pointer text-left transition-all ${
                      isActive
                        ? "border-primary ring-1 ring-primary bg-surface shadow-card"
                        : "bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? "bg-primary text-white"
                                : "bg-surface-subtle border border-border text-ink-secondary"
                            }`}
                          >
                            Q{idx + 1}
                          </span>
                          <span className="font-mono text-[10px] text-ink-muted uppercase">
                            {diff.label}
                          </span>
                        </div>

                        <p
                          className={`font-serif text-sm sm:text-base leading-snug ${
                            isActive ? "text-ink-primary font-bold" : "text-ink-primary"
                          }`}
                        >
                          {q}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {tags.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="font-mono text-[9px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-secondary"
                            >
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1 shrink-0 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(q, idx);
                          }}
                          className="p-1.5 rounded hover:bg-surface-subtle border border-transparent hover:border-border text-ink-secondary hover:text-ink-primary transition-colors"
                          title="Copy Question"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoiceQuestion(q);
                          }}
                          className="p-1.5 rounded hover:bg-surface-subtle border border-transparent hover:border-border text-ink-secondary hover:text-primary transition-colors"
                          title="Practice verbally"
                        >
                          <Mic className="w-3.5 h-3.5 text-accent" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveQuestion(q);
                            navigate("/workspace", { state: { activeQuestion: q } });
                          }}
                          className="p-1.5 rounded hover:bg-surface-subtle border border-transparent hover:border-border text-ink-secondary hover:text-ink-primary transition-colors"
                          title="Launch in Workspace"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card-swiss bg-surface p-12 text-center space-y-4 border border-dashed border-border">
              <div className="w-10 h-10 rounded bg-surface-subtle text-ink-muted mx-auto flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-ink-primary">
                  {searchQuery ? "No matching questions" : "No interview syllabus generated yet"}
                </h3>
                <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search criteria or category filter."
                    : "Upload an engineering resume to extract your tech stack and generate high-signal questions."}
                </p>
              </div>
              {!searchQuery && (
                <Link to="/upload" className="btn-primary text-xs !min-h-[38px] inline-flex">
                  <span>Upload Resume Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

        </div>

        {/* Right Column: AI Interview Coach Workspace (5 Cols) */}
        <div className="lg:col-span-5 h-[620px] sticky top-24">
          <AIChat activeQuestionText={activeQuestion} answerDraft={answerDraft} />
        </div>

      </div>

      {/* Voice Interview Modal */}
      {voiceQuestion && (
        <VoiceInterviewModal
          questionText={voiceQuestion}
          onClose={() => setVoiceQuestion(null)}
          onComplete={(transcript, metrics) => {
            setActiveQuestion(voiceQuestion);
            setAnswerDraft({ question: voiceQuestion, transcript, metrics });
            setVoiceQuestion(null);
          }}
        />
      )}

    </div>
  );
}
