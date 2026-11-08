import { ArrowRight, CheckCircle2, FileSearch, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border bg-canvas">
      {/* Background architectural grid texture */}
      <div className="absolute inset-0 bg-editorial-grid pointer-events-none opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric 12-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: 7 Cols on Desktop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Editorial Category Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface border border-border text-[11px] font-mono uppercase tracking-widest text-ink-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>System Protocol &bull; Career Intelligence 2026</span>
            </div>

            {/* Editorial Heading */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-[4.25rem] text-ink-primary leading-[1.08] tracking-tight">
              Prepare with purpose.<br />
              <span className="italic font-normal text-primary">
                Interview with confidence.
              </span>
            </h1>

            {/* Description */}
            <p className="font-sans text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl">
              Turn your experience into a personalized interview preparation plan.
              Analyze your resume, discover relevant technical questions, and practice
              with an AI interview coach trained on production engineering benchmarks.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                to="/auth/signup"
                className="btn-primary text-sm shadow-card group"
              >
                <span>Upload Resume &bull; Start Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#methodology"
                className="btn-secondary text-sm"
              >
                <span>Explore the STAR Method</span>
              </a>
            </div>

            {/* Architectural Trust Points */}
            <div className="pt-6 border-t border-border grid grid-cols-3 gap-4 max-w-xl">
              <div className="space-y-1">
                <span className="font-mono text-xl sm:text-2xl font-bold text-ink-primary tabular-nums">
                  15+
                </span>
                <p className="text-xs text-ink-secondary font-medium">
                  Verified Engineering Stacks
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xl sm:text-2xl font-bold text-ink-primary tabular-nums">
                  &lt;1.2s
                </span>
                <p className="text-xs text-ink-secondary font-medium">
                  Sub-second Cache Latency
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xl sm:text-2xl font-bold text-primary tabular-nums">
                  100%
                </span>
                <p className="text-xs text-ink-secondary font-medium">
                  Grounded in Your Document
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Cols on Desktop - Realistic Editorial Assessment Preview */}
          <div className="lg:col-span-5">
            <div className="card-swiss bg-surface p-6 shadow-elevated relative overflow-hidden">
              {/* Document Assessment Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border text-[11px] font-mono text-ink-secondary">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-ink-primary">CANDIDATE INTELLIGENCE REPORT</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary-light text-primary font-semibold text-[10px]">
                  ACTIVE PROFILE
                </span>
              </div>

              {/* Candidate Metadata Breakdown */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-ink-secondary font-mono text-[11px]">IDENTIFIED ROLE</span>
                  <span className="font-semibold text-ink-primary">Senior Full Stack Architect</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-ink-secondary font-mono text-[11px]">DEMONSTRATED STACK</span>
                  <span className="font-mono text-[11px] text-ink-primary font-medium">
                    React &bull; Python &bull; PostgreSQL
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-ink-secondary font-mono text-[11px]">EXPERIENCE EVALUATION</span>
                  <span className="text-ink-primary font-semibold">4.5 Years &bull; High Signal</span>
                </div>
              </div>

              {/* Sample High-Signal Question Card */}
              <div className="p-4 rounded border border-border bg-surface-subtle space-y-2.5 mt-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-primary font-bold px-1.5 py-0.5 rounded bg-surface border border-border">
                    QUESTION 01 &bull; SYSTEM DESIGN
                  </span>
                  <span className="text-[10px] font-mono text-accent font-semibold">HIGH PRIORITY</span>
                </div>
                <p className="font-serif text-sm font-medium text-ink-primary leading-snug">
                  "How would you architect a connection-pooled cache invalidation strategy for Neon PostgreSQL when running under serverless FastAPI microservices?"
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                    FastAPI
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                    Redis Cache
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-ink-secondary">
                    SQLAlchemy
                  </span>
                </div>
              </div>

              {/* Coach Telemetry Preview */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono text-[11px]">STAR Coaching: Active</span>
                </div>
                <span className="text-primary font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Practice
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
