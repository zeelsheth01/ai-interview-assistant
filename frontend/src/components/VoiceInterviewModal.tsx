import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Pause, Play, RotateCcw, Send, Volume2, X } from "lucide-react";
import { isAxiosError } from "axios";
import api from "../api/api";

export interface SpeechMetrics {
  wordCount: number;
  elapsedSeconds: number;
  wordsPerMinute: number;
  pace: "slow" | "optimal" | "rushed";
  fillerCounts: Record<string, number>;
  totalFillers: number;
}

interface VoiceInterviewModalProps {
  questionText: string;
  onComplete: (transcript: string, metrics: SpeechMetrics) => void;
  onClose: () => void;
}

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | undefined {
  const browserWindow = window as SpeechWindow;
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

const FILLER_PATTERNS: Array<[string, RegExp]> = [
  ["um", /\bum\b/gi],
  ["uh", /\buh\b/gi],
  ["like", /\blike\b/gi],
  ["actually", /\bactually\b/gi],
  ["basically", /\bbasically\b/gi],
  ["you know", /\byou\s+know\b/gi],
];

function wordCountOf(text: string): number {
  return text.trim().match(/\b[\p{L}\p{N}'-]+\b/gu)?.length ?? 0;
}

function getMetrics(transcript: string, elapsedSeconds: number): SpeechMetrics {
  const wordCount = wordCountOf(transcript);
  const wordsPerMinute = elapsedSeconds > 0 ? Math.round((wordCount * 60) / elapsedSeconds) : 0;
  const fillerCounts = Object.fromEntries(
    FILLER_PATTERNS.map(([word, pattern]) => [word, transcript.match(pattern)?.length ?? 0]),
  );
  const totalFillers = Object.values(fillerCounts).reduce((sum, count) => sum + count, 0);

  return {
    wordCount,
    elapsedSeconds,
    wordsPerMinute,
    pace: wordsPerMinute < 110 ? "slow" : wordsPerMinute <= 165 ? "optimal" : "rushed",
    fillerCounts,
    totalFillers,
  };
}

function getBillingError(error: unknown): string {
  if (isAxiosError<{ detail?: string }>(error) && error.response?.data.detail) {
    return error.response.data.detail;
  }
  return "Could not confirm your interview minute. Recording has been paused; check your connection and try again.";
}

export default function VoiceInterviewModal({ questionText, onComplete, onClose }: VoiceInterviewModalProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const transcriptRef = useRef("");
  const billingSessionIdRef = useRef<string>(window.crypto.randomUUID());
  const billedMinuteRef = useRef(0);
  const billingRequestRef = useRef(false);
  const startingListeningRef = useRef(false);
  const pendingSubmissionRef = useRef<{
    onComplete: VoiceInterviewModalProps["onComplete"];
    elapsedSeconds: number;
  } | null>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [billing, setBilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [speechPlaying, setSpeechPlaying] = useState(false);
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const recognitionSupported = Boolean(getSpeechRecognitionConstructor());
  const [notice, setNotice] = useState("");

  const metrics = useMemo(() => getMetrics(transcript, elapsedSeconds), [transcript, elapsedSeconds]);

  const billMinute = useCallback(async (minuteNumber: number): Promise<boolean> => {
    if (minuteNumber <= billedMinuteRef.current) return true;
    if (billingRequestRef.current) return false;

    billingRequestRef.current = true;
    setBilling(true);
    try {
      await api.post("/payments/usage", {
        session_id: billingSessionIdRef.current,
        minute_number: minuteNumber,
      });
      billedMinuteRef.current = minuteNumber;
      setNotice("");
      return true;
    } catch (error) {
      setNotice(getBillingError(error));
      return false;
    } finally {
      billingRequestRef.current = false;
      setBilling(false);
    }
  }, []);

  const finishPendingSubmission = useCallback(() => {
    if (!pendingSubmissionRef.current) return;
    const { onComplete: finish, elapsedSeconds: totalSeconds } = pendingSubmissionRef.current;
    pendingSubmissionRef.current = null;
    const finalTranscript = transcriptRef.current.trim();
    finish(finalTranscript, getMetrics(finalTranscript, totalSeconds));
  }, []);

  const ensureMicrophoneAccess = useCallback(async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      setNotice("Microphone permission was denied. Enable mic access in your browser settings to record your answer.");
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
    }
    setListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (startingListeningRef.current || listening) return;

    const constructor = getSpeechRecognitionConstructor();
    if (!constructor) return;

    startingListeningRef.current = true;
    try {
      const hasAccess = await ensureMicrophoneAccess();
      if (!hasAccess) return;

      const currentMinute = Math.floor(elapsedSeconds / 60) + 1;
      const billed = await billMinute(currentMinute);
      if (!billed) return;

      shouldListenRef.current = true;
      if (!recognitionRef.current) {
        const recognition = new constructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let updated = transcriptRef.current;
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
              const piece = result[0]?.transcript?.trim();
              if (piece) {
                updated = updated ? `${updated} ${piece}` : piece;
              }
            }
          }
          transcriptRef.current = updated;
          setTranscript(updated);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setNotice("Speech recognition was blocked by the browser. Please check your browser permissions.");
            stopListening();
          }
        };

        recognition.onend = () => {
          if (pendingSubmissionRef.current) {
            finishPendingSubmission();
            return;
          }
          if (shouldListenRef.current) {
            try {
              recognition.start();
              return;
            } catch {
              // no-op
            }
          }
          setListening(false);
        };

        recognitionRef.current = recognition;
      }

      if (!startedAtRef.current) {
        startedAtRef.current = Date.now() - elapsedSeconds * 1000;
      }

      recognitionRef.current.start();
      setListening(true);
    } catch {
      shouldListenRef.current = false;
      setNotice("The microphone could not start. Check browser permissions and try again.");
    } finally {
      startingListeningRef.current = false;
    }
  }, [billMinute, elapsedSeconds, ensureMicrophoneAccess, finishPendingSubmission, listening, stopListening]);

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      void startListening();
    }
  };

  useEffect(() => {
    if (!listening) return;

    const interval = setInterval(() => {
      const nextSeconds = startedAtRef.current ? Math.floor((Date.now() - startedAtRef.current) / 1000) : elapsedSeconds + 1;
      setElapsedSeconds(nextSeconds);

      const neededMinute = Math.floor(nextSeconds / 60) + 1;
      if (neededMinute > billedMinuteRef.current) {
        void (async () => {
          const billed = await billMinute(neededMinute);
          if (!billed) {
            stopListening();
          }
        })();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [billMinute, elapsedSeconds, listening, stopListening]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // no-op
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakQuestion = () => {
    if (!speechSupported) {
      setNotice("Question audio is not supported in this browser.");
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
      setSpeechPlaying(true);
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.onend = () => { setSpeechPaused(false); setSpeechPlaying(false); };
    utterance.onerror = () => { setSpeechPaused(false); setSpeechPlaying(false); };
    window.speechSynthesis.speak(utterance);
    setSpeechPaused(false);
    setSpeechPlaying(true);
  };

  const handleClose = () => {
    pendingSubmissionRef.current = null;
    stopListening();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  const handleSubmit = () => {
    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript || submitting) return;
    const finalElapsedSeconds = startedAtRef.current === null
      ? elapsedSeconds
      : Math.floor((Date.now() - startedAtRef.current) / 1000);
    if (listening && recognitionRef.current) {
      pendingSubmissionRef.current = { onComplete, elapsedSeconds: finalElapsedSeconds };
      setSubmitting(true);
      shouldListenRef.current = false;
      setListening(false);
      startedAtRef.current = null;
      setElapsedSeconds(finalElapsedSeconds);
      try {
        recognitionRef.current.stop();
      } catch {
        setNotice("Speech recognition could not finalize automatically. Submitting the captured transcript.");
        finishPendingSubmission();
      }
      return;
    }
    setElapsedSeconds(finalElapsedSeconds);
    onComplete(finalTranscript, getMetrics(finalTranscript, finalElapsedSeconds));
  };

  const paceLabel = metrics.pace === "slow" ? "Slow / Deliberate" : metrics.pace === "optimal" ? "Optimal & Confident" : "Fast / Rushed";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-primary/50 p-4 backdrop-blur-sm font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-interview-title"
          className="my-auto w-full max-w-2xl card-swiss bg-surface p-6 sm:p-8 text-ink-primary shadow-elevated border border-border"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div>
              <span className="editorial-meta text-primary block mb-1">
                LIVE INTERVIEW PROTOCOL
              </span>
              <h3 id="voice-interview-title" className="font-serif text-2xl font-bold text-ink-primary tracking-tight">
                Verbal Practice Chamber
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded hover:bg-surface-subtle border border-transparent hover:border-border text-ink-secondary hover:text-ink-primary transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Question Box */}
          <div className="my-5 p-5 rounded border border-border bg-surface-subtle space-y-3 text-left">
            <span className="editorial-meta text-ink-muted block">INTERVIEW QUESTION</span>
            <p className="font-serif text-lg text-ink-primary font-medium leading-snug">
              {questionText}
            </p>
            {speechSupported && (
              <button
                type="button"
                onClick={speakQuestion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-ink-primary hover:border-primary transition-colors"
              >
                {speechPaused ? <Play className="h-3.5 w-3.5" /> : speechPlaying ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{speechPaused ? "Resume question" : speechPlaying ? "Pause question" : "Play question audio"}</span>
              </button>
            )}
          </div>

          {!recognitionSupported && (
            <p className="p-3 mb-4 rounded border border-warning/30 bg-warning-light text-xs text-warning font-medium text-left">
              Live speech recognition is not available in this browser. Type your answer into the transcript area instead.
            </p>
          )}

          {notice && (
            <p role="status" className="p-3 mb-4 rounded border border-warning/30 bg-warning-light text-xs text-warning font-medium text-left">
              {notice}
            </p>
          )}

          {/* Controls Bar */}
          <div className="my-5 flex flex-wrap items-center justify-between gap-4 p-4 rounded border border-border bg-surface">
            <button
              type="button"
              onClick={toggleListening}
              disabled={!recognitionSupported || (billing && !listening)}
              className={`btn-primary text-xs !min-h-[42px] ${listening ? "!bg-error !border-error" : ""}`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-accent" />}
              <span>{listening ? "Stop recording" : billing ? "Loading prepaid minute…" : "Start recording"}</span>
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-ink-secondary" aria-live="polite">
              <span className={`w-2.5 h-2.5 rounded-full ${listening ? "bg-error animate-pulse" : "bg-border-strong"}`} />
              <span>{listening ? "Listening…" : "Microphone stopped"}</span>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="voice-transcript" className="block text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
              Live transcript <span className="font-normal text-ink-muted">(editable)</span>
            </label>
            <textarea
              id="voice-transcript"
              value={transcript}
              onChange={(event) => {
                transcriptRef.current = event.target.value;
                setTranscript(event.target.value);
              }}
              rows={5}
              placeholder="Your spoken answer will appear here. You can also type or edit it."
              className="input-field text-xs font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Telemetry Metric Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <MetricCard label="Words" value={metrics.wordCount} />
            <MetricCard label="Speaking pace" value={`${metrics.wordsPerMinute} WPM`} />
            <MetricCard label="Fillers" value={metrics.totalFillers} />
            <MetricCard
              label="Duration"
              value={`${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ink-secondary text-left">
            <span>
              Pace: <strong className={metrics.pace === "optimal" ? "text-primary font-bold" : metrics.pace === "slow" ? "text-accent font-bold" : "text-error font-bold"}>{paceLabel}</strong>
            </span>
            <span>
              Fillers: {Object.entries(metrics.fillerCounts).filter(([, count]) => count > 0).map(([word, count]) => `${word} ${count}`).join(" · ") || "None detected"}
            </span>
          </div>

          {/* Action Footer */}
          <footer className="mt-6 pt-5 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              disabled={billing}
              onClick={() => {
                stopListening();
                setTranscript("");
                transcriptRef.current = "";
                setElapsedSeconds(0);
                startedAtRef.current = null;
                billingSessionIdRef.current = window.crypto.randomUUID();
                billedMinuteRef.current = 0;
                setNotice("");
              }}
              className="btn-secondary text-xs !min-h-[40px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear answer</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!transcript.trim() || submitting}
              className="btn-primary text-xs !min-h-[40px] shadow-subtle"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "Finalizing transcript…" : "Submit verbal answer"}</span>
            </button>
          </footer>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-swiss bg-surface p-3 space-y-1">
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="font-mono text-lg font-bold text-ink-primary tabular-nums">{value}</p>
    </div>
  );
}
