import { Link } from 'react-router-dom';

const ResumeBuilder = () => {
  const steps = [
    { num: '01', title: 'Upload PDF Document', desc: 'Secure local & cloud document parsing via PyMuPDF.' },
    { num: '02', title: 'Text & Entity Extraction', desc: 'Hybrid OCR extracts technical stacks, tools, and roles.' },
    { num: '03', title: 'Skills Taxonomy Mapping', desc: 'Matches skills against 15+ high-signal engineering domains.' },
    { num: '04', title: 'Question Generation', desc: 'Synthesizes targeted technical challenges via Gemini 2.0.' }
  ];

  return (
    <section className="py-20 border-b border-border bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="editorial-meta text-primary block mb-2">INTELLIGENCE PIPELINE</span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
            How your resume transforms into an interview syllabus.
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-secondary mt-2">
            No generic LeetCode flashcards. Every question reflects your declared projects and engineering stack.
          </p>
        </div>

        {/* 4-Step Editorial Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="card-swiss bg-surface p-6 space-y-3 relative overflow-hidden shadow-subtle hover:border-primary-border transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-primary/80 tabular-nums">
                  {step.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-border" />
              </div>
              <h3 className="font-sans text-sm font-bold text-ink-primary">
                {step.title}
              </h3>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 text-center">
          <Link
            to="/auth/signup"
            className="btn-primary text-xs"
          >
            <span>Analyze Your Experience Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResumeBuilder;
