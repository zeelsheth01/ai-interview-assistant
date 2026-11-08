const MultilingualSection = () => {
  const languages = [
    'English', 'हिन्दी', 'Español', '日本語', 'Français', 'Deutsch', 'العربية', 'বাংলা', '한국어', 'Português', 'Русский', 'தமிழ்', 'తెలుగు', 'मराठी'
  ];

  return (
    <section className="py-20 border-b border-border bg-surface overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <span className="editorial-meta text-primary block mb-2">GLOBAL REACH &bull; SPEECH PROCESSING</span>
        <h2 className="font-editorial text-3xl sm:text-4xl text-ink-primary font-normal tracking-tight">
          Interview in your native tongue.
        </h2>
        <p className="font-sans text-sm sm:text-base text-ink-secondary max-w-xl mx-auto mt-2">
          Real-time speech transcription and natural conversational nuance across 52+ regional languages.
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        <div className="flex animate-slide-left whitespace-nowrap gap-3 px-2">
          {[...languages, ...languages, ...languages].map((lang, index) => (
            <div
              key={index}
              className="px-6 py-2.5 rounded border border-border bg-surface-subtle text-sm font-sans font-medium text-ink-primary hover:border-primary hover:bg-surface transition-colors shrink-0 shadow-subtle"
            >
              {lang}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MultilingualSection;
