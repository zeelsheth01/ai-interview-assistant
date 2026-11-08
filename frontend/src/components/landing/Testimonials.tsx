import { Star } from 'lucide-react';
import { APP_NAME } from '../../constants/brand';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Alex Sharma",
      role: "Senior Software Engineer &bull; FinTech Platform",
      quote: `${APP_NAME} helped me structure my system design answers concisely. Grounding questions directly in my actual resume meant zero generic fluff during my rounds.`,
      initials: "AS"
    },
    {
      name: "Priya Patel",
      role: "Product Engineering Lead &bull; SaaS Enterprise",
      quote: "The STAR methodology coaching transformed how I answer behavioral trade-offs. The feedback showed me where I was rambling and tightened my delivery.",
      initials: "PP"
    },
    {
      name: "Rahul Gupta",
      role: "Distributed Systems Engineer &bull; Cloud Infrastructure",
      quote: "The verbal telemetry caught my pace rushing when answering concurrency edge cases. Practicing with speech metrics built genuine interview composure.",
      initials: "RG"
    }
  ];

  return (
    <section className="py-20 border-b border-border bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="editorial-meta text-primary block mb-2">VERIFIED CANDIDATE OUTCOMES</span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
            Engineers who prepared with purpose.
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-secondary mt-2">
            Engineers across software, infrastructure, and product roles preparing for high-stakes technical loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="card-swiss bg-surface p-6 sm:p-7 flex flex-col justify-between shadow-card hover:border-primary-border transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="font-serif text-base text-ink-primary leading-relaxed italic">
                  “{t.quote}”
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-surface-subtle border border-border text-xs font-mono font-bold text-primary flex items-center justify-center">
                  {t.initials}
                </div>
                <div className="text-left">
                  <h4 className="font-sans text-xs font-bold text-ink-primary">
                    {t.name}
                  </h4>
                  <p
                    className="text-[11px] text-ink-secondary font-mono"
                    dangerouslySetInnerHTML={{ __html: t.role }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
