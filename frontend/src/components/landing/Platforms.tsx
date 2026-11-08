const Platforms = () => {
  const platforms = [
    { name: 'Google Meet', type: 'Video Rounds' },
    { name: 'Zoom Enterprise', type: 'Virtual Panel' },
    { name: 'Microsoft Teams', type: 'Hiring Calls' },
    { name: 'HackerRank & LeetCode', type: 'Live Coding' },
    { name: 'Codeshare & CoderPad', type: 'Architecture Loops' }
  ];

  return (
    <section className="py-16 border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="editorial-meta text-ink-muted block mb-2">ECOSYSTEM COMPATIBILITY</span>
        <h2 className="font-editorial text-2xl sm:text-3xl text-ink-primary font-normal tracking-tight mb-2">
          Engineered for every major interview format.
        </h2>
        <p className="font-sans text-xs sm:text-sm text-ink-secondary max-w-xl mx-auto mb-8">
          Practice your delivery for technical video screens, paired coding sessions, and whiteboarding loops.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {platforms.map((platform, idx) => (
            <div
              key={idx}
              className="p-4 rounded border border-border bg-surface-subtle text-left space-y-1 hover:border-primary-border transition-colors"
            >
              <span className="font-sans text-xs font-bold text-ink-primary block">
                {platform.name}
              </span>
              <span className="font-mono text-[10px] text-ink-secondary block">
                {platform.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Platforms;
