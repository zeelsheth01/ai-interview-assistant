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
  const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
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
      return true;
    } catch (error) {
      shouldListenRef.current = false;
      setListening(false);
      if (startedAtRef.current !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
        startedAtRef.current = null;
      }
      let stopFailure = "";
      try {
        recognitionRef.current?.stop();
      } catch {
        stopFailure = " The microphone may still be active; close this dialog if needed.";
      }
      setNotice(`${getBillingError(error)}${stopFailure}`);
      return false;
    } finally {
      billingRequestRef.current = false;
      setBilling(false);
    }
  }, []);

  const finishPendingSubmission = () => {
    const pendingSubmission = pendingSubmissionRef.current;
    if (!pendingSubmission) return;

    pendingSubmissionRef.current = null;
    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript) {
      setSubmitting(false);
      setNotice("No speech was captured. Please try recording again or type your answer.");
      return;
    }
    pendingSubmission.onComplete(
      finalTranscript,
      getMetrics(finalTranscript, pendingSubmission.elapsedSeconds),
    );
  };

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();

    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let index = 0; index < event.results.length; index += 1) {
          fullTranscript += `${event.results[index][0].transcript} `;
        }
        transcriptRef.current = fullTranscript.trim();
        setTranscript(transcriptRef.current);
      };
      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setListening(false);
          setNotice("Microphone access was denied. Allow microphone access in your browser and try again.");
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          setNotice(`Speech recognition error: ${event.error}. You can still edit the transcript below.`);
        }
      };
      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch {
            shouldListenRef.current = false;
            setListening(false);
            if (startedAtRef.current !== null) {
              setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
              startedAtRef.current = null;
            }
            setNotice("Speech recognition could not resume. You can still edit and submit the transcript.");
            finishPendingSubmission();
          }
        } else {
          setListening(false);
          finishPendingSubmission();
        }
      };
      recognitionRef.current = recognition;
    }

    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!listening) return;
    const interval = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        const currentElapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsedSeconds(currentElapsedSeconds);
        const elapsedMinute = Math.floor(currentElapsedSeconds / 60) + 1;
        if (elapsedMinute > billedMinuteRef.current && !billingRequestRef.current) {
          void billMinute(billedMinuteRef.current + 1);
        }
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [billMinute, listening]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      setNotice("Speech recognition could not stop cleanly. Your captured transcript is still available.");
    }
    setListening(false);
    if (startedAtRef.current !== null) {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      startedAtRef.current = null;
    }
  }, []);

  const toggleListening = async () => {
    if (listening) {
      stopListening();
      return;
    }
    if (startingListeningRef.current || billingRequestRef.current) return;
    if (!recognitionRef.current) {
      setNotice("Live speech transcription is not supported in this browser. You can type your answer in the transcript box.");
      return;
    }
    setNotice("");
    startingListeningRef.current = true;
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphone.getTracks().forEach((track) => track.stop());
    } catch {
      startingListeningRef.current = false;
      setNotice("Microphone access is required to record. Allow microphone access in your browser and try again.");
      return;
    }
    const minuteNumber = Math.floor(elapsedSeconds / 60) + 1;
    const minuteAuthorized = await billMinute(minuteNumber);
    startingListeningRef.current = false;
    if (!minuteAuthorized) return;

    shouldListenRef.current = true;
    startedAtRef.current = Date.now() - elapsedSeconds * 1000;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      shouldListenRef.current = false;
      setNotice("The microphone could not start. Check browser permissions and try again.");
    }
  };

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
    window.speechSynthesis?.cancel();
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
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      >
        <motion.section
          role="dialog" aria-modal="true" aria-labelledby="voice-interview-title"
          className="my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:p-7"
          initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        >
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-indigo-300"><Volume2 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Voice mock interview</span></div>
              <h2 id="voice-interview-title" className="text-xl font-bold">Practice your answer out loud</h2>
            </div>
            <button type="button" onClick={handleClose} aria-label="Close voice interview" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          </header>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Interview question</p>
            <p className="text-sm leading-relaxed text-slate-100">{questionText}</p>
            <button type="button" onClick={speakQuestion} disabled={!speechSupported} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50">
              {speechPaused ? <Play className="h-4 w-4" /> : speechPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {speechPaused ? "Resume question" : speechPlaying ? "Pause question" : "Play question audio"}
            </button>
          </div>

          {!recognitionSupported && <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">Live speech recognition is not available in this browser. Type your answer into the transcript area instead.</p>}
          {notice && <p role="status" className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">{notice}</p>}

          <div className="my-5 flex flex-wrap items-center justify-center gap-4">
            <button type="button" onClick={toggleListening} disabled={!recognitionSupported || (billing && !listening)} className={`relative inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${listening ? "bg-rose-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-400"}`}>
              {listening && <span className="absolute inset-0 animate-ping rounded-xl bg-rose-400/30" />}
              <span className="relative inline-flex items-center gap-2">{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{listening ? "Stop recording" : billing ? "Loading prepaid minute…" : "Start recording"}</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-300" aria-live="polite">
              <span className={`h-2.5 w-2.5 rounded-full ${listening ? "animate-pulse bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.8)]" : "bg-slate-600"}`} />
              {listening ? "Listening…" : "Microphone stopped"}
            </div>
          </div>

          <label htmlFor="voice-transcript" className="mb-2 block text-sm font-semibold text-slate-200">Live transcript <span className="font-normal text-slate-500">(editable)</span></label>
          <textarea id="voice-transcript" value={transcript} onChange={(event) => { transcriptRef.current = event.target.value; setTranscript(event.target.value); }} rows={5} placeholder="Your spoken answer will appear here. You can also type or edit it." className="w-full resize-y rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60" />

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Words" value={metrics.wordCount} />
            <MetricCard label="Speaking pace" value={`${metrics.wordsPerMinute} WPM`} />
            <MetricCard label="Fillers" value={metrics.totalFillers} />
            <MetricCard label="Duration" value={`${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Pace: <strong className={metrics.pace === "optimal" ? "text-emerald-300" : metrics.pace === "slow" ? "text-amber-300" : "text-rose-300"}>{paceLabel}</strong></span>
            <span>Fillers: {Object.entries(metrics.fillerCounts).filter(([, count]) => count > 0).map(([word, count]) => `${word} ${count}`).join(" · ") || "None detected"}</span>
          </div>

          <footer className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-5 sm:flex-row">
            <button type="button" disabled={billing} onClick={() => { stopListening(); setTranscript(""); transcriptRef.current = ""; setElapsedSeconds(0); startedAtRef.current = null; billingSessionIdRef.current = window.crypto.randomUUID(); billedMinuteRef.current = 0; setNotice(""); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw className="h-4 w-4" />Clear answer</button>
            <button type="button" onClick={handleSubmit} disabled={!transcript.trim() || submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" />{submitting ? "Finalizing transcript…" : "Submit verbal answer"}</button>
          </footer>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}
