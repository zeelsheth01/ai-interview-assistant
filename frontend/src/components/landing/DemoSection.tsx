import React from 'react';
import { Play } from 'lucide-react';

const DemoSection = () => {
  return (
    <div className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            See Chiku in action.
          </h2>
          <p className="text-xl text-gray-400">
            Two minutes. One coding interview.
          </p>
        </div>

        <div className="max-w-[1100px] mx-auto rounded-[20px] overflow-hidden border border-white/10 glass aspect-video relative group cursor-pointer premium-hover">
          <div className="absolute inset-0 bg-dark-900/40 group-hover:bg-dark-900/20 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary-600/90 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] group-hover:scale-110 transition-transform duration-300">
              <Play size={32} className="text-white ml-2" />
            </div>
          </div>
          {/* Fallback pattern for video */}
          <div className="w-full h-full bg-dark-800" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DemoSection;
