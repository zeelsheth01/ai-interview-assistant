import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Send,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import {
  mockInterviewApi,
  type MockInterviewSession,
  type MockInterviewTurn,
} from "../services/mockInterviewApi";

interface SpeechResultList {
  [index: number]: {
    [index: number]: {
      transcript: string;
    };
  };
  length: number;
}

interface SpeechEvent {
  resultIndex: number;
  results: SpeechResultList;
}

interface SpeechError {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function MockInterviewChat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [turns, setTurns] = useState<MockInterviewTurn[]>([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [copiedTurnId, setCopiedTurnId] = useState<number | null>(null);
  const [expandedFeedbackTurn, setExpandedFeedbackTurn] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);

  // Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll to bottom on turns update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessionData = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await mockInterviewApi.getSession(sessionId);
      setSession(data);
      setTurns(data.turns || []);

      // If already completed, prompt redirect to report
      if (data.status === "completed") {
        navigate(`/mock-interview/${sessionId}/report`);
      }
    } catch (err: unknown) {
      console.error("Failed to load interview session:", err);
      const msg = err instanceof Error ? err.message : "Failed to load session.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionData();
  }, [sessionId, fetchSessionData]);

  useEffect(() => {
    scrollToBottom();
  }, [turns, submitting]);

  // Setup countdown timer
  useEffect(() => {
    if (!session || session.status === "completed") return;

    // Calculate remaining seconds based on start time
    if (session.start_time) {
      const startTime = new Date(session.start_time).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const initialRemaining = Math.max(0, session.duration_minutes * 60 - elapsed);
      setRemainingSeconds(initialRemaining);
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const handleSendMessage = async () => {
    if (!sessionId || !candidateInput.trim() || submitting) return;

    const answer = candidateInput.trim();
    setCandidateInput("");
    setSubmitting(true);
    setErrorMessage(null);

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      const result = await mockInterviewApi.respondToQuestion(sessionId, answer);

      // Refresh turns
      setTurns((prevTurns) => {
        const updated = prevTurns.map((t) => {
          if (t.turn_number === result.turn_completed) {
            return {
              ...t,
              candidate_response: answer,
              score: result.evaluation.score,
              feedback_positive: result.evaluation.feedback_positive,
              feedback_missing: result.evaluation.feedback_missing,
              feedback_improvements: result.evaluation.feedback_improvements,
              expected_key_points: result.evaluation.expected_key_points,
            };
          }
          return t;
        });

        // Append next turn if not present
        if (!updated.some((t) => t.turn_number === result.next_turn.turn_number)) {
          updated.push(result.next_turn);
        }
        return updated;
      });

      // Automatically expand feedback for recently completed turn
      setExpandedFeedbackTurn(result.turn_completed);
    } catch (err: unknown) {
      console.error("Failed to submit response:", err);
      const msg = err instanceof Error ? err.message : "Failed to evaluate response.";
      setErrorMessage(msg);
      // Restore input so candidate doesn't lose text
      setCandidateInput(answer);
    } finally {
      setSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleCompleteInterview = async () => {
    if (!sessionId) return;
    try {
      setCompleting(true);
      setErrorMessage(null);
      await mockInterviewApi.completeInterview(sessionId);
      navigate(`/mock-interview/${sessionId}/report`);
    } catch (err: unknown) {
      console.error("Failed to finalize interview:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate report.";
      setErrorMessage(msg);
      setCompleting(false);
      setShowEndModal(false);
    }
  };

  const handleCopyText = (text: string, turnId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTurnId(turnId);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  // Toggle Speech Recognition
  const toggleRecording = () => {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: SpeechError) => {
        console.error("Speech Recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = remainingSeconds <= 120; // 2 minutes remaining

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-ink-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">
          Connecting to Mock Interview Chamber...
        </p>
      </div>
    );
  }

  // Active / current turn awaiting candidate answer
  const activeTurn = turns.find((t) => t.candidate_response === null) || turns[turns.length - 1];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[600px] max-w-5xl mx-auto font-sans text-ink-primary">
      {/* Top Utility Ribbon */}
      <div className="bg-surface border border-border rounded-t-lg p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-white font-bold text-xs flex items-center justify-center font-mono">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-ink-primary">
                {session?.job_role || "Technical Candidate"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-subtle border border-border text-primary font-medium">
                {session?.difficulty || "Adaptive"}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary font-mono">
              Session #{sessionId?.slice(0, 8)} &bull; {session?.interview_type}
            </p>
          </div>
        </div>

        {/* Timer, Turn Badge & Conclude Button */}
        <div className="flex items-center gap-4 self-end sm:self-center">
          {/* Turn Tracker */}
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
              Active Turn
            </span>
            <span className="font-mono text-xs font-semibold text-ink-primary">
              Question {activeTurn?.turn_number || 1}
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono font-semibold transition-colors ${
              isLowTime
                ? "bg-error-subtle border-error text-error animate-pulse"
                : "bg-surface-subtle border-border text-ink-primary"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Conclude Button */}
          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="btn-secondary text-xs !min-h-[36px] !px-3 font-semibold text-error hover:border-error"
          >
            Conclude & Evaluate
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 bg-canvas border-x border-border overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-editorial">
        {errorMessage && (
          <div className="p-3.5 rounded bg-error-subtle border border-error/30 text-error flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-error hover:opacity-70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Turn Loop */}
        {turns.map((turn) => {
          const isAnswered = turn.candidate_response !== null;
          const isExpanded = expandedFeedbackTurn === turn.turn_number;

          return (
            <div key={turn.id || turn.turn_number} className="space-y-4 animate-fade-in">
              {/* Interviewer Message Card */}
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="w-7 h-7 rounded bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 font-mono">
                  AI
                </div>
                <div className="flex-1 space-y-2">
                  {/* Category & Turn Metadata */}
                  <div className="flex items-center justify-between">
                    <span className="editorial-meta text-primary text-[10px]">
                      TURN #{turn.turn_number} &bull; {turn.category.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(turn.question, turn.turn_number)}
                      className="text-ink-muted hover:text-ink-primary p-1 rounded transition-colors text-[10px] flex items-center gap-1 font-mono"
                    >
                      {copiedTurnId === turn.turn_number ? (
                        <>
                          <Check className="w-3 h-3 text-primary" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Question Box */}
                  <div className="card-swiss bg-surface p-4 sm:p-5 shadow-subtle border-border space-y-2">
                    <p className="text-sm sm:text-base font-medium text-ink-primary leading-relaxed whitespace-pre-line">
                      {turn.question}
                    </p>
                  </div>
                </div>
              </div>

              {/* Candidate Response Card if answered */}
              {isAnswered && (
                <div className="flex items-start gap-3 max-w-3xl ml-auto flex-row-reverse">
                  <div className="w-7 h-7 rounded bg-ink-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 font-mono">
                    YOU
                  </div>
                  <div className="flex-1 space-y-2 text-right">
                    <span className="editorial-meta text-ink-muted text-[10px]">
                      CANDIDATE RESPONSE
                    </span>
                    <div className="card-swiss bg-surface p-4 sm:p-5 shadow-subtle border-primary-border text-left space-y-3">
                      <p className="text-xs sm:text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
                        {turn.candidate_response}
                      </p>

                      {/* Immediate Evaluation Feedback Toggle */}
                      {turn.score !== null && (
                        <div className="pt-2 border-t border-border">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedFeedbackTurn(isExpanded ? null : turn.turn_number)
                            }
                            className="w-full flex items-center justify-between text-xs text-ink-secondary hover:text-ink-primary font-mono py-1"
                          >
                            <span className="flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-primary" />
                              <span className="font-semibold">Technical Evaluation:</span>
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  turn.score >= 7
                                    ? "text-primary bg-primary-light"
                                    : turn.score >= 4
                                    ? "text-warning bg-warning-subtle"
                                    : "text-error bg-error-subtle"
                                }`}
                              >
                                {turn.score} / 10
                              </span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-primary font-sans font-semibold">
                              {isExpanded ? "Hide Feedback" : "Inspect Feedback"}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </button>

                          {/* Expanded Evaluation Details */}
                          {isExpanded && (
                            <div className="mt-3 p-3.5 rounded bg-surface-subtle border border-border space-y-2.5 text-xs text-left animate-fade-in">
                              {turn.feedback_positive && (
                                <div>
                                  <span className="font-semibold text-primary text-[11px] block">
                                    &bull; What was articulated well:
                                  </span>
                                  <p className="text-ink-primary text-xs mt-0.5 leading-relaxed">
                                    {turn.feedback_positive}
                                  </p>
                                </div>
                              )}

                              {turn.feedback_missing && (
                                <div>
                                  <span className="font-semibold text-warning text-[11px] block">
                                    &bull; Key missing concepts & trade-offs:
                                  </span>
                                  <p className="text-ink-secondary text-xs mt-0.5 leading-relaxed">
                                    {turn.feedback_missing}
                                  </p>
                                </div>
                              )}

                              {turn.feedback_improvements && (
                                <div>
                                  <span className="font-semibold text-ink-primary text-[11px] block">
                                    &bull; Recommendation for senior interviews:
                                  </span>
                                  <p className="text-ink-secondary text-xs mt-0.5 leading-relaxed">
                                    {turn.feedback_improvements}
                                  </p>
                                </div>
                              )}

                              {turn.expected_key_points && turn.expected_key_points.length > 0 && (
                                <div>
                                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider block">
                                    Expected Bar-Raiser Points:
                                  </span>
                                  <ul className="list-disc list-inside text-[11px] text-ink-secondary mt-1 space-y-0.5">
                                    {turn.expected_key_points.map((pt, i) => (
                                      <li key={i}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing / Processing State */}
        {submitting && (
          <div className="flex items-start gap-3 max-w-xl animate-fade-in">
            <div className="w-7 h-7 rounded bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 font-mono">
              AI
            </div>
            <div className="card-swiss bg-surface p-4 shadow-subtle border-border flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-ink-primary">
                  Evaluating response depth...
                </p>
                <p className="text-[11px] text-ink-secondary">
                  Analyzing architecture trade-offs & generating contextual follow-up question.
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Answer Input Dock */}
      <div className="bg-surface border border-border rounded-b-lg p-3 sm:p-4 shadow-subtle shrink-0 space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your structured answer here (e.g. explain your approach, architecture, metrics, and error handling)..."
            disabled={submitting}
            className="input-field w-full text-xs sm:text-sm resize-none pr-24 py-3 leading-relaxed scrollbar-editorial"
          />

          {/* Action buttons inside textarea dock */}
          <div className="absolute right-2.5 bottom-3 flex items-center gap-2">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleRecording}
              title={isRecording ? "Stop recording speech" : "Speak your response"}
              className={`p-2 rounded border text-xs transition-colors ${
                isRecording
                  ? "bg-error text-white border-error animate-pulse"
                  : "bg-surface-subtle border-border text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!candidateInput.trim() || submitting}
              className="btn-primary text-xs !min-h-[36px] !px-3.5 flex items-center gap-1.5 shadow-subtle"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Bar Footer */}
        <div className="flex items-center justify-between text-[11px] text-ink-muted font-mono px-1">
          <div className="flex items-center gap-2">
            <span>Words: {candidateInput.trim() ? candidateInput.trim().split(/\s+/).length : 0}</span>
            <span>&bull;</span>
            <span className="hidden sm:inline">Press Enter to submit, Shift + Enter for new line</span>
          </div>
          {isRecording && (
            <span className="text-error font-semibold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              Listening to speech...
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal to End Interview */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-fade-in">
          <div className="card-swiss bg-surface p-6 sm:p-7 max-w-md w-full shadow-elevated space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-semibold text-ink-primary">
                  Conclude Interview Session?
                </h3>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  Ending this interview will finalize your {turns.filter((t) => t.candidate_response).length}{" "}
                  evaluated answers and generate your comprehensive performance assessment report.
                </p>
              </div>
            </div>

            <div className="p-3 rounded bg-surface-subtle border border-border text-[11px] text-ink-secondary leading-relaxed space-y-1">
              <p className="font-semibold text-ink-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> What happens next:
              </p>
              <p>&bull; Comprehensive overall score out of 100.</p>
              <p>&bull; Category-wise scores for assessed domains.</p>
              <p>&bull; Identification of critical knowledge gaps and tailored practice questions.</p>
              <p>&bull; Phased personalized engineering roadmap.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                disabled={completing}
                className="btn-secondary text-xs !min-h-[38px] !px-4"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleCompleteInterview}
                disabled={completing}
                className="btn-primary text-xs !min-h-[38px] !px-4 flex items-center gap-2"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Report...</span>
                  </>
                ) : (
                  <span>Generate Final Report</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
