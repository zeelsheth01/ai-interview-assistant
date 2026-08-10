import React from 'react';

const Platforms = () => {
  const platforms = ['Zoom', 'Google Meet', 'Teams', 'LeetCode', 'Superset'];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Works on every interview platform.
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Zoom, Google Meet, Microsoft Teams, HackerRank, LeetCode and more.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {platforms.map((platform, idx) => (
            <div key={idx} className="glass px-8 py-4 rounded-2xl border border-white/10 premium-hover bg-dark-800/50 flex items-center justify-center min-w-[160px]">
              <span className="text-lg font-medium text-gray-200">{platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Platforms;
