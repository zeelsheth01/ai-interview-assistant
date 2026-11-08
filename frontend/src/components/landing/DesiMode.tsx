import { useState } from 'react';
import { Check, X, Sparkles, MessageSquare } from 'lucide-react';

const DesiMode = () => {
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>('behavioral');

  return (
    <section id="methodology" className="py-20 border-b border-border bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface border border-border text-[11px] font-mono uppercase tracking-widest text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Humanized Answer Modeling</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
            Answers that sound authentic, not memorized.
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-secondary mt-2">
            Eliminate robotic AI jargon. Rehearse responses that sound natural, structured, and persuasive to human hiring directors.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-surface rounded border border-border">
            <button
              onClick={() => setActiveTab('behavioral')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'behavioral'
                  ? 'bg-primary text-white shadow-subtle'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Behavioral Challenge
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'technical'
                  ? 'bg-primary text-white shadow-subtle'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Technical System Architecture
            </button>
          </div>
        </div>

        {/* Comparison Board */}
        <div className="card-swiss bg-surface max-w-5xl mx-auto overflow-hidden shadow-card">
          {/* Interview Question Prompt Banner */}
          <div className="p-6 border-b border-border bg-surface-subtle flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="editorial-meta text-primary block mb-1">INTERVIEWER PROMPT</span>
              <p className="font-serif text-lg sm:text-xl text-ink-primary font-medium leading-snug">
                {activeTab === 'behavioral'
                  ? '“Tell me about a time you handled an architectural disagreement during a production release.”'
                  : '“How do you decide between SQLite, Neon PostgreSQL, and Redis caching for our data layer?”'}
              </p>
            </div>
          </div>

          {/* Two-Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Textbook Bot Column */}
            <div className="p-6 sm:p-8 space-y-4 bg-surface-subtle/50">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-error uppercase tracking-wider">
                <X className="w-4 h-4" />
                <span>Textbook Academic Bot (Unnatural)</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-ink-secondary leading-relaxed italic">
                {activeTab === 'behavioral'
                  ? '“In accordance with optimal conflict management paradigms, disagreement is a natural byproduct of multi-stakeholder initiatives. I systematically convened a synergy session with the disgruntled engineer, utilizing active listening techniques to harmonize cross-functional friction...”'
                  : '“SQLite is an in-process library implementing a self-contained, serverless, zero-configuration SQL database engine. On the other hand, PostgreSQL is an enterprise-grade object-relational database system with over 35 years of active development...”'}
              </p>
              <div className="p-3 rounded bg-error-light/60 border border-error/20 text-[11px] text-error font-medium">
                Sounds scripted, defensive, and detached from realistic production engineering pressures.
              </div>
            </div>

            {/* Swiss STAR Coach Column */}
            <div className="p-6 sm:p-8 space-y-4 bg-surface">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                <Check className="w-4 h-4" />
                <span>STAR Framework Delivery (High Signal)</span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-ink-primary leading-relaxed">
                {activeTab === 'behavioral'
                  ? '“During our Q3 deployment, our backend lead wanted to push a breaking migration while I was concerned with read replicas lagging. Instead of debating in Slack, I ran a benchmark test on staging, demonstrated the 4-second replication delay with hard metrics, and we agreed on a blue-green schema migration without downtime.”'
                  : '“For local development and unit testing, we rely on local SQLite for zero-friction setup. For production, Neon PostgreSQL gives us connection pooling and serverless autoscaling, while Redis serves as our L1 cache for sub-millisecond responses on hot endpoints.”'}
              </p>
              <div className="p-3 rounded bg-primary-light border border-primary-border text-[11px] text-primary font-medium">
                Concise, quantified metrics, engineering trade-offs, and authentic collaborative resolution.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesiMode;
