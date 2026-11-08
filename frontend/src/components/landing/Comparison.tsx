import { APP_NAME } from "../../constants/brand";
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comparison = () => {
  const comparisons = [
    {
      name: 'Parakeet AI',
      pricing: '$49 / month',
      distinction: 'Subscription-locked recurring fee vs. pay-per-minute on-demand.'
    },
    {
      name: 'Final Round AI',
      pricing: '$99 / month',
      distinction: 'Expensive enterprise tiered lock-in without lifetime minutes.'
    },
    {
      name: 'Interview Warmup',
      pricing: 'Free (Generic)',
      distinction: 'Static questions without resume-parsing or STAR critique.'
    },
    {
      name: 'LockedIn AI',
      pricing: '$39 / month',
      distinction: 'Lacks speech cadence telemetry and offline STAR fallback.'
    }
  ];

  return (
    <section id="compare" className="py-20 border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="editorial-meta text-primary block mb-2">BENCHMARK COMPARISON</span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
            Why candidates choose {APP_NAME}.
          </h2>
          <p className="font-sans text-sm sm:text-base text-ink-secondary mt-2">
            The same high-signal interview preparation at a fraction of the cost, with transparent pay-as-you-go minutes.
          </p>
        </div>

        {/* Swiss Comparison Table */}
        <div className="card-swiss bg-surface max-w-5xl mx-auto overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-[11px] font-mono text-ink-secondary uppercase tracking-wider">
                  <th className="py-3 px-6">Platform</th>
                  <th className="py-3 px-6">Pricing Model</th>
                  <th className="py-3 px-6">Architectural Advantage</th>
                  <th className="py-3 px-6 text-right">Preparation Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {comparisons.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-subtle/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-ink-primary">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-ink-secondary font-mono">
                      {item.pricing}
                    </td>
                    <td className="py-4 px-6 text-ink-primary">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{item.distinction}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-bold hover:underline"
                      >
                        <span>View Rates</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
