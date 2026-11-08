import { useState, useEffect, useRef } from "react";
import { Send, Terminal, Copy, Check } from "lucide-react";
import api from "../api/api";

interface AIChatProps {
  activeQuestionText?: string;
  answerDraft?: {
    question: string;
    transcript: string;
    metrics: {
      wordCount: number;
      elapsedSeconds: number;
      wordsPerMinute: number;
      pace: "slow" | "optimal" | "rushed";
      totalFillers: number;
      fillerCounts: Record<string, number>;
    };
  } | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIChat({ activeQuestionText, answerDraft }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to your Interview Coaching Session. Select any generated question from your syllabus, or type your practice response below to receive structured STAR critique and technical evaluation.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-populate when active question changes
  useEffect(() => {
    if (activeQuestionText) {
      setInput(
        `Could you walk me through the ideal STAR answer structure and key architectural considerations for: "${activeQuestionText}"?`
      );
    }
  }, [activeQuestionText]);

  // Auto-populate when verbal voice interview transcript arrives
  useEffect(() => {
    if (!answerDraft) return;
    const paceLabel =
      answerDraft.metrics.pace === "optimal"
        ? "Optimal & Confident"
        : answerDraft.metrics.pace === "slow"
        ? "Slow / Deliberate"
        : "Fast / Rushed";
    const fillerSummary =
      Object.entries(answerDraft.metrics.fillerCounts)
        .filter(([, count]) => count > 0)
        .map(([word, count]) => `${word}: ${count}`)
        .join(", ") || "none detected";

    setInput(
      `Please provide comprehensive feedback on my verbal interview response.\n\nQuestion: "${answerDraft.question}"\n\nTranscript: "${answerDraft.transcript}"\n\nDelivery Telemetry: ${answerDraft.metrics.wordCount} words in ${answerDraft.metrics.elapsedSeconds}s (${answerDraft.metrics.wordsPerMinute} WPM, ${paceLabel}); ${answerDraft.metrics.totalFillers} fillers (${fillerSummary}).`
    );
  }, [answerDraft]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: textToSend,
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: res.data.reply || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.log("CHAT ERROR:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not connect to the AI coaching service. If you are running locally, verify your Gemini API key or internet connection. (Offline fallback: Try framing your answer with Situation, Task, Action, and Quantified Result).",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeLines = part.slice(3, -3).trim().split("\n");
        const firstLine = codeLines[0].trim();
        const isLang = firstLine && !firstLine.includes(" ");
        const language = isLang ? firstLine : "code";
        const code = isLang ? codeLines.slice(1).join("\n") : codeLines.join("\n");

        return (
          <div key={index} className="my-3 rounded border border-border bg-surface-subtle overflow-hidden">
            <div className="flex justify-between items-center px-3 py-1.5 bg-surface border-b border-border text-[10px] font-mono text-ink-secondary">
              <span className="uppercase">{language}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-primary transition-colors"
              >
                Copy snippet
              </button>
            </div>
            <pre className="p-3 font-mono text-xs text-ink-primary overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bold text
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
            if (chunk.startsWith("**") && chunk.endsWith("**")) {
              return (
                <strong key={cIdx} className="font-semibold text-ink-primary">
                  {chunk.slice(2, -2)}
                </strong>
              );
            }
            return chunk;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-primary-light text-primary flex items-center justify-center font-mono">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-sans font-bold text-ink-primary">AI Interview Coach</span>
            <span className="hidden sm:inline font-mono text-[10px] text-ink-muted ml-2">
              Gemini 2.0 Flash &bull; STAR Evaluation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          <span className="font-mono text-[10px] text-primary font-semibold">ACTIVE</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-editorial bg-canvas/30">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-ink-muted px-1">
                <span>{isUser ? "Candidate Response" : "Interview Coach"}</span>
                <span>&bull;</span>
                <span className="tabular-nums">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-white shadow-subtle"
                    : "bg-surface border border-border text-ink-primary shadow-subtle"
                }`}
              >
                {renderContent(msg.content)}

                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-border-subtle flex justify-between items-center text-[10px] text-ink-muted">
                    <span className="font-mono">STAR MODEL FEEDBACK</span>
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-primary" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-ink-muted px-1">
              <span>Interview Coach</span>
              <span>&bull;</span>
              <span>Analyzing</span>
            </div>
            <div className="p-4 rounded bg-surface border border-border text-xs text-ink-secondary flex items-center gap-2 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="font-mono text-xs">Evaluating answer structure & metrics...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Ribbon */}
      <div className="px-4 py-2 border-t border-border bg-surface-subtle flex items-center gap-2 overflow-x-auto hide-scrollbar">
        <span className="font-mono text-[10px] uppercase text-ink-muted shrink-0">
          Suggestions:
        </span>
        <button
          type="button"
          onClick={() =>
            sendMessage(
              "How would an interviewer score this answer on architectural depth and production considerations?"
            )
          }
          className="text-[11px] font-sans px-2.5 py-1 rounded bg-surface border border-border text-ink-secondary hover:text-ink-primary hover:border-primary shrink-0 transition-colors"
        >
          Score my answer depth
        </button>
        <button
          type="button"
          onClick={() =>
            sendMessage(
              "Provide a concise 90-second model answer using the STAR (Situation, Task, Action, Result) methodology."
            )
          }
          className="text-[11px] font-sans px-2.5 py-1 rounded bg-surface border border-border text-ink-secondary hover:text-ink-primary hover:border-primary shrink-0 transition-colors"
        >
          Model STAR Answer
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="input-field !min-h-[44px] flex-1 text-xs"
            placeholder="Ask a question or draft your answer for review..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary !min-h-[44px] !px-4 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
