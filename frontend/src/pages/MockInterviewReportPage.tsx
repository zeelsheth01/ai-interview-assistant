import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  Sparkles,
  RotateCcw,
  LayoutDashboard,
  Loader2,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  mockInterviewApi,
  type MockInterviewReport,
} from "../services/mockInterviewApi";

export default function MockInterviewReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [report, setReport] = useState<MockInterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  const fetchReport = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await mockInterviewApi.getReport(sessionId);
      setReport(data);

      // Expand first 2 turns by default
      const initialExpanded: Record<number, boolean> = {};
      data.turns?.slice(0, 2).forEach((t) => {
        initialExpanded[t.turn_number] = true;
      });
      setExpandedTurns(initialExpanded);
    } catch (err: unknown) {
      console.error("Failed to load interview report:", err);
      const msg = err instanceof Error ? err.message : "Failed to load report.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchReport();
  }, [sessionId, fetchReport]);

  const toggleTurn = (turnNum: number) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [turnNum]: !prev[turnNum],
    }));
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-ink-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-sans uppercase tracking-widest text-ink-muted">
          Compiling Detailed Performance Report...
        </p>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="card-swiss bg-surface p-8 max-w-xl mx-auto my-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-error mx-auto" />
        <h2 className="font-editorial text-2xl font-semibold text-ink-primary">
          Unable to Load Report
        </h2>
        <p className="text-xs text-ink-secondary">
          {errorMessage || "The interview report could not be located or has not been generated."}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/mock-interview" className="btn-primary text-xs !min-h-[40px] !px-4">
            Return to Mock Interview Setup
          </Link>
        </div>
      </div>
    );
  }

  const scoreTier =
    report.overall_score >= 80
      ? { label: "Strong Candidate (Bar Raiser)", color: "text-primary", bg: "bg-primary-light", border: "border-primary" }
      : report.overall_score >= 60
      ? { label: "Solid Competency (Leaning Hire)", color: "text-warning", bg: "bg-warning-subtle", border: "border-warning" }
      : { label: "Needs Targeted Practice", color: "text-error", bg: "bg-error-subtle", border: "border-error" };

  const assessedCategories = Object.entries(report.category_scores || {});

  return (
    <div className="space-y-10 animate-fade-in text-ink-primary font-sans max-w-5xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      
      {/* Top Breadcrumb & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <Link to="/dashboard" className="hover:text-ink-primary">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/mock-interview" className="hover:text-ink-primary">
            Mock Interview
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink-primary">Performance Evaluation</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary text-xs !min-h-[36px] !px-3.5 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <Link
            to="/mock-interview"
            className="btn-primary text-xs !min-h-[36px] !px-3.5 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Mock Session</span>
          </Link>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="card-swiss bg-surface p-6 sm:p-8 shadow-card border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2 text-left">
            <span className="editorial-meta text-primary block">
              FINAL CANDIDATE ASSESSMENT &bull; SESSION #{report.session_id.slice(0, 8)}
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-semibold tracking-tight">
              {report.job_role} Interview Report
            </h1>
            <p className="text-xs text-ink-secondary flex items-center gap-3 font-sans">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Duration: {formatDuration(report.duration_seconds)}
              </span>
              <span>&bull;</span>
              <span>Evaluated: {new Date(report.created_at || Date.now()).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Large Tabular Score Box */}
          <div className="flex items-center gap-4 bg-surface-subtle p-4 sm:p-5 rounded border border-border shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-sans uppercase tracking-wider text-ink-muted block">
                Overall Index
              </span>
              <div className="font-editorial text-4xl sm:text-5xl font-bold text-ink-primary tabular-nums leading-none mt-1">
                {report.overall_score}
                <span className="text-lg font-normal text-ink-muted">/100</span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border ${scoreTier.bg} ${scoreTier.color} ${scoreTier.border}`}
            >
              {scoreTier.label}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {report.summary && (
          <div className="p-4 sm:p-5 rounded bg-surface-subtle border border-border text-xs leading-relaxed space-y-1.5 text-left">
            <p className="font-semibold text-ink-primary flex items-center gap-1.5 uppercase font-sans tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Executive Assessment Summary
            </p>
            <p className="text-ink-secondary whitespace-pre-line leading-relaxed">
              {report.summary}
            </p>
          </div>
        )}

        {/* Tabular KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded border border-border bg-surface text-center">
            <span className="text-[10px] font-sans uppercase tracking-wider text-ink-muted block">
              Total Questions
            </span>
            <span className="font-sans text-2xl font-bold text-ink-primary">
              {report.total_questions}
            </span>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface text-center">
            <span className="text-[10px] font-sans uppercase tracking-wider text-primary block flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Correct (7-10)
            </span>
            <span className="font-sans text-2xl font-bold text-primary">
              {report.correct_count}
            </span>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface text-center">
            <span className="text-[10px] font-sans uppercase tracking-wider text-warning block flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Partial (4-6)
            </span>
            <span className="font-sans text-2xl font-bold text-warning">
              {report.partially_correct_count}
            </span>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface text-center">
            <span className="text-[10px] font-sans uppercase tracking-wider text-error block flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" /> Needs Work (&lt;4)
            </span>
            <span className="font-sans text-2xl font-bold text-error">
              {report.incorrect_count}
            </span>
          </div>
        </div>
      </div>

      {/* Category-Wise Performance Section */}
      {assessedCategories.length > 0 && (
        <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-primary">
                Category-Wise Performance (Assessed Domains Only)
              </h2>
            </div>
            <span className="font-sans text-[11px] text-ink-muted">
              {assessedCategories.length} categories tested
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessedCategories.map(([category, score]) => {
              const numScore = Number(score);
              const barColor =
                numScore >= 70 ? "bg-primary" : numScore >= 40 ? "bg-warning" : "bg-error";

              return (
                <div
                  key={category}
                  className="p-3.5 rounded border border-border bg-surface-subtle space-y-2 text-left"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-primary">{category}</span>
                    <span className="font-sans font-bold text-ink-primary">
                      {numScore} / 100
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(5, numScore))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategic Insights: Strengths, Weaknesses, Knowledge Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="card-swiss bg-surface p-5 sm:p-6 shadow-subtle space-y-3.5 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-ink-secondary leading-relaxed">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold">&bull;</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="card-swiss bg-surface p-5 sm:p-6 shadow-subtle space-y-3.5 border-t-2 border-t-warning">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
            <AlertTriangle className="w-4 h-4" />
            <span>Improvement Areas</span>
          </div>
          <ul className="space-y-2 text-xs text-ink-secondary leading-relaxed">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-warning font-bold">&bull;</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Knowledge Gaps */}
        <div className="card-swiss bg-surface p-5 sm:p-6 shadow-subtle space-y-3.5 border-t-2 border-t-error">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-error">
            <Target className="w-4 h-4" />
            <span>Identified Gaps</span>
          </div>
          <ul className="space-y-2 text-xs text-ink-secondary leading-relaxed">
            {report.knowledge_gaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-error font-bold">&bull;</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Practice Questions */}
      {report.recommended_questions && report.recommended_questions.length > 0 && (
        <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold uppercase tracking-wider text-ink-primary">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Recommended Next Practice Questions</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Based on your identified knowledge gaps, our bar raiser recommends rehearsing these targeted challenges:
          </p>
          <div className="space-y-2">
            {report.recommended_questions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded bg-surface-subtle border border-border text-xs text-ink-primary flex items-start gap-2.5 font-medium"
              >
                <span className="font-sans text-primary font-bold">0{idx + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Learning Roadmap */}
      {report.learning_roadmap && report.learning_roadmap.length > 0 && (
        <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-semibold uppercase tracking-wider text-ink-primary">
            <Target className="w-4 h-4 text-primary" />
            <span>Personalized Learning Roadmap</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.learning_roadmap.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded border border-border bg-surface-subtle space-y-2 text-left"
              >
                <span className="text-[10px] font-sans text-primary uppercase font-bold tracking-wider block">
                  {stage.phase}
                </span>
                <h4 className="text-xs font-semibold text-ink-primary">{stage.title}</h4>
                <p className="text-[11px] text-ink-secondary leading-relaxed">{stage.description}</p>
                {stage.action_items && stage.action_items.length > 0 && (
                  <ul className="pt-2 border-t border-border space-y-1 text-[11px] text-ink-secondary">
                    {stage.action_items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-Wise Evaluation Deep Dive */}
      <div className="card-swiss bg-surface p-6 sm:p-7 shadow-subtle space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-primary">
              Question-by-Question Technical Evaluation
            </h2>
          </div>
          <span className="font-sans text-[11px] text-ink-muted">
            {report.turns?.length || 0} evaluated questions
          </span>
        </div>

        <div className="space-y-4">
          {report.turns?.map((turn) => {
            const isExpanded = expandedTurns[turn.turn_number];
            const score = turn.score ?? 0;
            const scoreBadgeClass =
              score >= 7
                ? "bg-primary-light text-primary border-primary"
                : score >= 4
                ? "bg-warning-subtle text-warning border-warning"
                : "bg-error-subtle text-error border-error";

            return (
              <div
                key={turn.id || turn.turn_number}
                className="rounded border border-border bg-surface-subtle overflow-hidden transition-all text-left"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleTurn(turn.turn_number)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="editorial-meta text-primary text-[10px]">
                        TURN #{turn.turn_number} &bull; {turn.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-ink-primary leading-snug">
                      {turn.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-sans font-bold border ${scoreBadgeClass}`}
                    >
                      {score} / 10
                    </span>
                    <button
                      type="button"
                      className="text-ink-muted hover:text-ink-primary"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-border bg-surface space-y-4 text-xs animate-fade-in">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="editorial-meta text-ink-muted block text-[10px]">
                        CANDIDATE RESPONSE
                      </span>
                      <p className="p-3 rounded bg-surface-subtle border border-border text-ink-primary leading-relaxed whitespace-pre-wrap">
                        {turn.candidate_response}
                      </p>
                    </div>

                    {/* Evaluator Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {turn.feedback_positive && (
                        <div className="p-3 rounded bg-primary-light/40 border border-primary/20 space-y-1">
                          <span className="font-semibold text-primary text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> What Was Articulated Well
                          </span>
                          <p className="text-ink-primary text-xs leading-relaxed">
                            {turn.feedback_positive}
                          </p>
                        </div>
                      )}

                      {turn.feedback_missing && (
                        <div className="p-3 rounded bg-warning-subtle/50 border border-warning/30 space-y-1">
                          <span className="font-semibold text-warning text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Key Missing Concepts
                          </span>
                          <p className="text-ink-secondary text-xs leading-relaxed">
                            {turn.feedback_missing}
                          </p>
                        </div>
                      )}
                    </div>

                    {turn.feedback_improvements && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold text-ink-primary text-[11px] block">
                          &bull; Actionable Advice for Senior Technical Rounds:
                        </span>
                        <p className="text-ink-secondary text-xs leading-relaxed">
                          {turn.feedback_improvements}
                        </p>
                      </div>
                    )}

                    {turn.expected_key_points && turn.expected_key_points.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="font-sans text-[10px] text-ink-muted uppercase tracking-wider block">
                          Expected Senior Architecture Points:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-ink-secondary space-y-0.5">
                          {turn.expected_key_points.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border print:hidden">
        <Link
          to="/dashboard"
          className="text-xs text-ink-secondary hover:text-ink-primary flex items-center gap-1.5 font-sans"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary text-xs !min-h-[40px] !px-4"
          >
            Export as PDF
          </button>
          <Link
            to="/mock-interview"
            className="btn-primary text-xs !min-h-[40px] !px-5 flex items-center gap-2"
          >
            <span>Start Another Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
