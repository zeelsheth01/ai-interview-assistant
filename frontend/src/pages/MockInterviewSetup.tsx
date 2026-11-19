import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  Sliders,
  Check,
  Plus,
  X,
  History,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { mockInterviewApi, type MockInterviewSession } from "../services/mockInterviewApi";

const PRESET_ROLES = [
  "Full Stack Developer",
  "MERN Stack Developer",
  "Frontend Developer (React)",
  "Backend Developer (Node.js)",
  "Python Full Stack Developer",
  "FastAPI / Python Engineer",
  "Java / Spring Boot Developer",
  ".NET Core Developer",
  "General Software Engineer",
];

const PRESET_TECHS = [
  "React",
  "TypeScript",
  "Node.js",
  "Express.js",
  "FastAPI",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "GraphQL",
  "Tailwind CSS",
  "AWS",
  "Next.js",
  "Java",
  "Spring Boot",
  "Git & CI/CD",
];

const INTERVIEW_TYPES = [
  {
    id: "Full Mock Interview",
    label: "Full Mock Interview",
    desc: "Comprehensive evaluation covering architecture, real-world failure scenarios, security, scale, and HR.",
  },
  {
    id: "Technical Interview",
    label: "Core Technical & Architecture",
    desc: "Deep technical questions on language internals, frameworks, APIs, and data structures.",
  },
  {
    id: "Project-Based Interview",
    label: "Project & Experience Defense",
    desc: "Rigorous defense of your declared project workflow, database design, and individual contributions.",
  },
  {
    id: "Scenario-Based Interview",
    label: "Real-World Scenarios & Outages",
    desc: "Debugging production crashes, concurrency race conditions, security vulnerabilities, and traffic spikes.",
  },
  {
    id: "HR & Behavioral Interview",
    label: "HR & Leadership Behavioral",
    desc: "STAR-formatted questions on conflict resolution, technical disagreements, deadlines, and ownership.",
  },
];

const DIFFICULTY_LEVELS = [
  { id: "Adaptive", label: "Adaptive (Recommended)", desc: "AI dynamically adjusts complexity based on answer quality." },
  { id: "Beginner", label: "Beginner / Junior", desc: "Focuses on fundamentals, syntax, and standard conventions." },
  { id: "Intermediate", label: "Mid-Level Engineer", desc: "Explores trade-offs, concurrency, and real-world implementation." },
  { id: "Advanced", label: "Senior / Lead", desc: "High-scale architecture, fault tolerance, and complex trade-offs." },
];

const DURATIONS = [15, 30, 45, 60];

export default function MockInterviewSetup() {
  const navigate = useNavigate();

  // Configuration state
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);

  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "React",
    "FastAPI",
    "PostgreSQL",
    "Docker",
  ]);
  const [customTechInput, setCustomTechInput] = useState("");

  const [interviewType, setInterviewType] = useState("Full Mock Interview");
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [duration, setDuration] = useState(30);

  // History state
  const [pastSessions, setPastSessions] = useState<MockInterviewSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPastSessions();
  }, []);

  const loadPastSessions = async () => {
    try {
      setLoadingHistory(true);
      const sessions = await mockInterviewApi.getSessions();
      setPastSessions(sessions);
    } catch (err) {
      console.error("Failed to load interview sessions:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleAddCustomTech = () => {
    const trimmed = customTechInput.trim();
    if (trimmed && !selectedTechs.includes(trimmed)) {
      setSelectedTechs([...selectedTechs, trimmed]);
      setCustomTechInput("");
    }
  };

  const handleStartInterview = async () => {
    try {
      setStartingSession(true);
      setErrorMessage(null);

      const jobRoleToUse = isCustomRole ? customRole.trim() : selectedRole;
      if (!jobRoleToUse) {
        setErrorMessage("Please select or enter a valid job role.");
        setStartingSession(false);
        return;
      }

      if (selectedTechs.length === 0) {
        setErrorMessage("Please select at least one technology in your stack.");
        setStartingSession(false);
        return;
      }

      const session = await mockInterviewApi.createSession({
        job_role: jobRoleToUse,
        technologies: selectedTechs,
        interview_type: interviewType,
        difficulty: difficulty,
        duration_minutes: duration,
      });

      navigate(`/mock-interview/${session.id}`);
    } catch (err: unknown) {
      console.error("Failed to start mock interview:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to initialize interview chamber. Please try again.";
      setErrorMessage(errorMsg);
      setStartingSession(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-ink-primary font-sans max-w-5xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="space-y-3 text-left border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface border border-border text-[11px] font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Real-Time Evaluation Chamber &bull; 18 Knowledge Categories</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-semibold tracking-tight leading-tight">
          AI Mock Interview Practice.
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary max-w-3xl leading-relaxed">
          Experience an adaptive, realistic technical interview conducted by an AI interviewer trained on senior
          software engineering standards. The system evaluates your project architecture, code decisions, debugging
          reasoning, and industry-level problem solving.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded bg-error-subtle border border-error/30 text-error flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Configuration Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STEP 1: Job Role */}
          <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-primary">
                1. Target Job Role
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_ROLES.map((role) => {
                const active = !isCustomRole && selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsCustomRole(false);
                    }}
                    className={`p-3 rounded text-left border transition-all text-xs flex items-center justify-between ${
                      active
                        ? "border-primary bg-primary-light/40 font-semibold text-primary"
                        : "border-border bg-surface-subtle text-ink-secondary hover:border-border-strong hover:text-ink-primary"
                    }`}
                  >
                    <span>{role}</span>
                    {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Role Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCustomRole(!isCustomRole)}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                {isCustomRole ? "Choose from standard roles" : "+ Specify a custom engineering role"}
              </button>

              {isCustomRole && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems Engineer, Site Reliability Engineer..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="input-field text-xs w-full"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Technology Stack */}
          <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-primary">
                  2. Technology Stack & Frameworks
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-muted">
                {selectedTechs.length} selected
              </span>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Select the technologies you have implemented in your projects. The interviewer will challenge your
              architecture choices and explore real-world production scenarios around these tools.
            </p>

            {/* Chip Cloud */}
            <div className="flex flex-wrap gap-2">
              {PRESET_TECHS.map((tech) => {
                const isSelected = selectedTechs.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleToggleTech(tech)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-white border-primary font-medium"
                        : "bg-surface-subtle border-border text-ink-secondary hover:border-primary-border hover:text-ink-primary"
                    }`}
                  >
                    <span>{tech}</span>
                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-ink-muted" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom technology (e.g. Kafka, RabbitMQ, Vue.js)..."
                value={customTechInput}
                onChange={(e) => setCustomTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTech();
                  }
                }}
                className="input-field text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomTech}
                disabled={!customTechInput.trim()}
                className="btn-secondary text-xs !min-h-[42px] !px-4 shrink-0"
              >
                Add
              </button>
            </div>

            {/* Active Selected Tags Display */}
            {selectedTechs.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-mono text-ink-muted mr-1">Active:</span>
                {selectedTechs.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface border border-border text-[11px] font-mono text-ink-primary"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleToggleTech(t)}
                      className="text-ink-muted hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* STEP 3: Format & Difficulty */}
          <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <Sliders className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-primary">
                3. Interview Format & Difficulty
              </h2>
            </div>

            {/* Interview Type Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                Interview Focus Area
              </label>
              <div className="space-y-2">
                {INTERVIEW_TYPES.map((type) => {
                  const active = interviewType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`p-3.5 rounded border transition-all cursor-pointer flex items-start gap-3 ${
                        active
                          ? "border-primary bg-primary-light/40"
                          : "border-border bg-surface-subtle hover:border-border-strong"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          active ? "border-primary bg-primary" : "border-border bg-surface"
                        }`}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-semibold ${active ? "text-primary" : "text-ink-primary"}`}>
                          {type.label}
                        </p>
                        <p className="text-[11px] text-ink-secondary leading-snug">{type.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Level & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Difficulty Calibration
                </label>
                <div className="space-y-1.5">
                  {DIFFICULTY_LEVELS.map((lvl) => {
                    const active = difficulty === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDifficulty(lvl.id)}
                        className={`w-full p-2.5 rounded text-left border text-xs transition-all flex flex-col ${
                          active
                            ? "border-primary bg-primary-light/40 text-primary font-semibold"
                            : "border-border bg-surface-subtle text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        <span>{lvl.label}</span>
                        <span className="text-[10px] font-normal text-ink-muted leading-tight mt-0.5">
                          {lvl.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Duration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Target Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((mins) => {
                    const active = duration === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuration(mins)}
                        className={`p-3 rounded text-center border text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                          active
                            ? "border-primary bg-primary text-white font-semibold"
                            : "border-border bg-surface-subtle text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${active ? "text-white" : "text-ink-muted"}`} />
                        <span className="font-mono">{mins} Min</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed pt-1">
                  You can end the interview at any time to receive your full performance assessment report.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Summary & Past Sessions (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Trigger Card */}
          <div className="card-swiss bg-surface p-6 shadow-card border-primary/40 space-y-5 sticky top-24">
            <span className="editorial-meta text-primary block">SESSION BRIEF</span>
            
            <div className="space-y-3 text-xs divide-y divide-border">
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Role:</span>
                <span className="font-semibold text-ink-primary max-w-[180px] truncate text-right">
                  {isCustomRole ? customRole || "Custom Role" : selectedRole}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Format:</span>
                <span className="font-semibold text-ink-primary text-right">{interviewType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Difficulty:</span>
                <span className="font-semibold text-ink-primary">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Allocated Time:</span>
                <span className="font-mono font-semibold text-ink-primary">{duration} Minutes</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink-secondary">Stack Depth:</span>
                <span className="font-mono font-semibold text-ink-primary">
                  {selectedTechs.length} Technologies
                </span>
              </div>
            </div>

            <div className="p-3 rounded bg-surface-subtle border border-border text-[11px] text-ink-secondary leading-relaxed">
              <p className="font-semibold text-ink-primary mb-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" /> Mandatory Protocol
              </p>
              Every interview begins with a self-introduction. The interviewer uses your academic and project
              explanation to synthesize your personalized technical questions.
            </div>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={startingSession}
              className="btn-primary w-full text-xs font-semibold py-3.5 flex items-center justify-center gap-2 group shadow-subtle"
            >
              {startingSession ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Chamber...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Interview</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Past Sessions List */}
          <div className="card-swiss bg-surface p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-ink-primary text-xs font-semibold uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-primary" />
                <span>Session Records</span>
              </div>
              <button
                type="button"
                onClick={loadPastSessions}
                className="text-[10px] text-primary hover:underline font-mono"
              >
                Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 flex justify-center text-ink-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : pastSessions.length === 0 ? (
              <p className="text-xs text-ink-muted py-4 text-center">
                No mock interviews recorded yet. Complete your first session to build your assessment history.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-editorial pr-1">
                {pastSessions.map((s) => {
                  const isCompleted = s.status === "completed";
                  const turnCount = s.turns?.length || 0;
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded border border-border bg-surface-subtle hover:border-primary-border transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-ink-primary truncate max-w-[170px]">
                          {s.job_role}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                            isCompleted
                              ? "bg-primary-light text-primary font-semibold"
                              : "bg-surface border border-border text-ink-muted"
                          }`}
                        >
                          {isCompleted ? "Report Ready" : "In Progress"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                        <span className="font-mono">{turnCount} Turns</span>
                        {s.created_at && (
                          <span className="font-mono text-[10px] text-ink-muted">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        {isCompleted ? (
                          <Link
                            to={`/mock-interview/${s.id}/report`}
                            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" />
                            <span>View Report</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            to={`/mock-interview/${s.id}`}
                            className="text-[11px] font-semibold text-ink-primary hover:underline flex items-center gap-1"
                          >
                            <span>Resume</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
