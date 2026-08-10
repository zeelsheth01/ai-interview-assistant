
import { FileText } from 'lucide-react';

const ResumeBuilder = () => {
  return (
    <div className="py-24 bg-dark-900/80 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          An AI resume that lands interviews.
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Ten ATS-friendly templates. Let the AI write, rewrite, and tighten until your resume earns the callback.
        </p>
      </div>

      {/* Templates Carousel */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="shrink-0 w-64 h-80 rounded-xl bg-white/5 border border-white/10 p-4 snap-center premium-hover flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <FileText size={48} className="text-gray-600 group-hover:text-primary-500 transition-colors mb-4" />
              <div className="w-3/4 h-2 bg-white/10 rounded-full mb-3"></div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-2"></div>
              <div className="w-5/6 h-2 bg-white/10 rounded-full mb-2"></div>
              <div className="w-4/6 h-2 bg-white/10 rounded-full"></div>
              <p className="mt-6 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Template {i}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Steps */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center text-sm font-medium text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">1</div>
              Upload CV
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">2</div>
              AI Extracts
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">3</div>
              Choose Template
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">4</div>
              AI Rewrite
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">5</div>
              Live Preview
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center text-primary-400 border border-primary-500/30">6</div>
              Download PDF
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
