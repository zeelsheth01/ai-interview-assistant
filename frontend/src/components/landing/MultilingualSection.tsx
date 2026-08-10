

const MultilingualSection = () => {
  const languages = [
    'English', 'हिन्दी', 'Español', '日本語', 'Français', 'Deutsch', 'العربية', 'বাংলা', '한국어', 'Português', 'Русский', 'தமிழ்', 'తెలుగు', 'मराठी'
  ];

  return (
    <div className="py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Interview in your language.
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time transcription in 52+ languages
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-dark-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-dark-900 to-transparent z-10 pointer-events-none"></div>

        {/* First carousel */}
        <div className="flex animate-slide-left whitespace-nowrap group-hover:pause gap-4 px-2">
          {[...languages, ...languages, ...languages].map((lang, index) => (
            <div
              key={index}
              className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-lg font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white shrink-0 cursor-default"
            >
              {lang}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultilingualSection;
