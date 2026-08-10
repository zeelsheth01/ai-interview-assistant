import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          Your Invisible Realtime
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          AI Interview Assistant
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto mb-10">
          Chiku listens to your interview and shows precise answers on your screen.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/auth/signup" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 premium-hover">
            Try free <ArrowRight size={20} />
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-dark-900 flex items-center justify-center text-xs">
                   <Star size={12} className="text-gray-400"/>
                </div>
              ))}
            </div>
            <span>Join thousands of users</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
          <span>No credit card</span>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white font-medium">4.8</span>
            <span>average rating</span>
          </div>
        </div>
        
        {/* Mockup visual */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-xl border border-white/10 bg-dark-800/50 p-2 glass premium-hover">
          <div className="rounded-lg overflow-hidden bg-dark-900 aspect-[16/9] flex items-center justify-center relative">
             {/* Split screen representation */}
             <div className="absolute inset-0 flex flex-col md:flex-row">
                <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col items-start justify-center relative bg-gradient-to-br from-dark-800 to-dark-900">
                    <div className="absolute top-4 left-4 bg-white/10 px-2 py-1 rounded text-xs text-gray-400">Live Transcript</div>
                    <p className="text-lg text-gray-300">"So, tell me about a time when you had to optimize a slow SQL query in production."</p>
                </div>
                <div className="flex-1 p-6 flex flex-col items-start justify-center relative bg-gradient-to-bl from-primary-900/20 to-dark-900">
                    <div className="absolute top-4 left-4 bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Star size={10} className="fill-primary-300" /> AI Suggested Answer
                    </div>
                    <ul className="text-left text-gray-300 space-y-3 mt-4 text-sm md:text-base">
                        <li className="flex gap-2 items-start"><ArrowRight size={16} className="text-primary-400 mt-1 flex-shrink-0" /> Explained identifying the bottleneck using EXPLAIN ANALYZE.</li>
                        <li className="flex gap-2 items-start"><ArrowRight size={16} className="text-primary-400 mt-1 flex-shrink-0" /> Mentioned adding a composite index on frequently filtered columns.</li>
                        <li className="flex gap-2 items-start"><ArrowRight size={16} className="text-primary-400 mt-1 flex-shrink-0" /> Resulted in a 40x speedup in read times.</li>
                    </ul>
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Hero;
