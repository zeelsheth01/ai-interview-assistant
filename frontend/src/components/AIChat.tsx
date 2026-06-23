import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, User, Copy, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";

interface AIChatProps {
  activeQuestionText?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIChat({ activeQuestionText }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Interview Coach. Ask me anything about your resume, or click any question in the list on the left to review its key concepts and suggested answers.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-populate input when active question changes
  useEffect(() => {
    if (activeQuestionText) {
      setInput(`Could you explain the recommended answer and core technical concepts behind this question: "${activeQuestionText}"?`);
    }
  }, [activeQuestionText]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: currentInput,
      });

      const aiMessage: Message = {
        role: "assistant",
        content: res.data.reply || "No reply received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.log("CHAT ERROR:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered an error connecting to the AI endpoint. Please verify that your Gemini API Key is configured and your network is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Helper to parse basic text markdown (bold, list items, and multiline code blocks)
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      // Check if code block
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        // Extract language if specified on first line
        const hasLang = /^[a-zA-Z0-9+#]+$/.test(lines[0] || "");
        const lang = hasLang ? lines[0] : "";
        const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-white/10 bg-slate-950 font-mono text-xs">
            {lang && (
              <div className="bg-white/5 px-4 py-1.5 text-slate-400 font-sans border-b border-white/5 uppercase tracking-wider text-[10px]">
                {lang}
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-slate-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Handle normal paragraphs, bold formatting, and bullet lists
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lineIdx) => {
            let processedLine = line;
            
            // Check for list bullet
            const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
            if (isBullet) {
              processedLine = line.trim().replace(/^[-*]\s+/, "");
            }

            // Parse bold tags **bold**
            const boldRegex = /\*\*(.*?)\*\*/g;
            const boldParts = processedLine.split(boldRegex);
            const lineContent = boldParts.map((bPart, bIdx) => {
              if (bIdx % 2 === 1) {
                return <strong key={bIdx} className="text-white font-semibold">{bPart}</strong>;
              }
              return bPart;
            });

            if (isBullet) {
              return (
                <ul key={lineIdx} className="list-disc pl-5 my-1 text-slate-300">
                  <li>{lineContent}</li>
                </ul>
              );
            }

            return processedLine.trim() === "" ? (
              <div key={lineIdx} className="h-2" />
            ) : (
              <p key={lineIdx} className="text-slate-300 leading-relaxed text-sm">
                {lineContent}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 relative">
      {/* Header */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold font-outfit text-white">AI Coach Workspace</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-600" />
          <span>Active Context // Resume questions</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isAI = m.role === "assistant";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${isAI ? "items-start" : "items-start flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                    isAI
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  }`}
                >
                  {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col max-w-[80%] space-y-1">
                  <div
                    className={`relative group p-4 rounded-2xl border transition duration-300 ${
                      isAI
                        ? "bg-white/[0.02] border-white/5 text-slate-300"
                        : "bg-indigo-500/10 border-indigo-500/20 text-white ml-auto"
                    }`}
                  >
                    {/* Format content */}
                    {renderFormattedContent(m.content)}

                    {/* Copy Button */}
                    {isAI && (
                      <button
                        onClick={() => handleCopyMessage(m.content, i)}
                        className="absolute bottom-2 right-2 p-1.5 bg-slate-950 border border-white/5 text-slate-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition duration-300"
                        title="Copy coach response"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono text-slate-500 px-1 ${
                    isAI ? "" : "text-right"
                  }`}>
                    {m.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 items-start"
          >
            <div className="w-8 h-8 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl max-w-[80%] flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-slate-500">Gemini is formulating response...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white/[0.01] border-t border-white/5">
        <div className="flex gap-2 bg-slate-900 border border-white/5 rounded-xl p-1.5 focus-within:border-indigo-500/50 transition duration-300">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your question or choose a pre-filled prompt..."
            className="flex-1 px-4 py-2.5 bg-transparent border-none outline-none text-white text-sm placeholder-slate-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white p-3 rounded-lg cursor-pointer transition duration-300 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
