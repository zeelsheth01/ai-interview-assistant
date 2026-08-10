import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Comparison = () => {
  const competitors = [
    { name: 'Parakeet AI', price: '$49/mo', diff: 'Chiku is 60% cheaper' },
    { name: 'Final Round AI', price: '$99/mo', diff: 'Chiku offers lifetime credits' },
    { name: 'Interview Warmup', price: 'Free', diff: 'Chiku has live in-interview assistance' },
    { name: 'LockedIn AI', price: '$39/mo', diff: 'Chiku includes Desi Mode & Resume Builder' }
  ];

  return (
    <div className="py-24" id="compare">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Why job seekers choose Chiku AI
          </h2>
          <p className="text-xl text-primary-400 font-medium">
            Same features as premium tools, at a lower cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {competitors.map((comp, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl border border-white/10 premium-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Chiku AI vs {comp.name}</h3>
                <p className="text-sm text-gray-400 mb-2">They charge {comp.price}</p>
                <div className="flex items-center gap-2 text-sm text-primary-300">
                  <Check size={16} /> {comp.diff}
                </div>
              </div>
              <Link to={`/compare/${comp.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                View comparison <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comparison;
