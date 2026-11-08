import { useState } from 'react';
import { Mic, Terminal, Volume2 } from 'lucide-react';
import { APP_NAME } from '../../constants/brand';

const DemoSection = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const simulateSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Could you walk me through how you optimize slow database queries in your FastAPI backend?"
      );
      utterance.rate = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section id="features" className="py-20 border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="editorial-meta text-primary block mb-2">LIVE SIMULATION WORKSPACE</span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
            See {APP_NAME} in action.
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-secondary mt-2">
            An intelligent workspace that listens, measures your delivery telemetry, and coaches you in real time.
          </p>
        </div>

        {/* Realistic Console Wireframe */}
        <div className="max-w-5xl mx-auto card-swiss bg-canvas border border-border shadow-elevated overflow-hidden">
          {/* Top Bar */}
          <div className="px-6 py-3.5 border-b border-border bg-surface flex items-center justify-between text-xs font-mono text-ink-secondary">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-semibold text-ink-primary">INTERVIEW SESSION: PYTHON & DISTRIBUTED SYSTEMS</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-accent font-semibold">CADENCE: 132 WPM (OPTIMAL)</span>
              <span className="text-[11px] text-ink-muted">FILLERS: 0 DETECTED</span>
            </div>
          </div>

          {/* Workspace Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Prompt Column (7 Cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6 bg-surface">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="editorial-meta text-primary">QUESTION 02 OF 10</span>
                  <button
                    onClick={simulateSpeech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-[11px] font-mono text-ink-primary hover:border-primary transition-colors"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-accent animate-pulse' : 'text-ink-secondary'}`} />
                    <span>{isPlayingAudio ? 'Speaking...' : 'Listen Question'}</span>
                  </button>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-ink-primary font-medium leading-snug">
                  “Explain how the Global Interpreter Lock (GIL) affects multithreaded concurrency in Python, and how you architect CPU-bound tasks around it.”
                </h3>
              </div>

              {/* Live Answer Transcript Area */}
              <div className="p-4 rounded border border-border bg-surface-subtle space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-ink-secondary">
                  <span className="flex items-center gap-1.5 text-primary font-semibold">
                    <Mic className="w-3.5 h-3.5 text-accent animate-pulse" />
                    LIVE VERBAL TRANSCRIPT
                  </span>
                  <span className="text-ink-muted">00:48s elapsed</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-ink-primary leading-relaxed">
                  “The GIL prevents multiple native threads from executing Python bytecodes simultaneously. For I/O bound work like database queries and network calls, asyncio or standard threads work great because the GIL is released during I/O. However, for CPU-intensive tasks, we bypass the GIL by utilizing the multiprocessing module or delegating computational workloads to Celery workers...”
                </p>
              </div>
            </div>

            {/* Right Coaching Feedback Column (5 Cols) */}
            <div className="md:col-span-5 p-6 sm:p-8 space-y-5 bg-surface-subtle">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-accent" />
                <span>AI Coach Telemetry Analysis</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded bg-surface border border-border space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                    Key Strengths Mentioned
                  </span>
                  <p className="text-xs text-ink-primary leading-relaxed">
                    Distinguished between I/O bound concurrency and CPU bound parallelism correctly. Mentioned Celery background tasks.
                  </p>
                </div>

                <div className="p-3.5 rounded bg-surface border border-border space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                    Opportunity for Distinction
                  </span>
                  <p className="text-xs text-ink-primary leading-relaxed">
                    Mention Python 3.13 free-threaded builds (PEP 703) to show up-to-date awareness of current Python runtime evolutions.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-ink-secondary mb-1">
                  <span>SPEECH PACING CONFIDENCE</span>
                  <span className="text-primary font-bold">94%</span>
                </div>
                <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
