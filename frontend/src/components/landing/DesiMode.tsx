import { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const DesiMode = () => {
  const [activeTab, setActiveTab] = useState('behavioral');

  return (
    <div className="py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/30 border border-primary-500/30 text-xs font-semibold text-primary-400 mb-6 uppercase tracking-wider">
            <Sparkles size={14} />
            Desi Mode <span className="bg-primary-500 text-white px-2 py-0.5 rounded-full text-[10px] ml-2">NEW</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
            AI answers that sound like you, not a textbook.
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setActiveTab('behavioral')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'behavioral' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Behavioral Question
              </button>
              <button 
                onClick={() => setActiveTab('technical')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'technical' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Technical Question
              </button>
            </div>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl overflow-hidden border border-white/10 premium-hover">
            <div className="p-6 md:p-8 border-b border-white/10 bg-dark-800/50">
              <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-3">Interview Question</p>
              <p className="text-xl md:text-2xl font-medium text-white">
                {activeTab === 'behavioral' 
                  ? '"Tell me about a time you handled a conflict in your team."' 
                  : '"How would you explain an API to a non-technical person?"'}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row">
              {/* Normal AI */}
              <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10 bg-dark-900/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-300">Normal AI</h3>
                  <span className="text-xs bg-red-900/30 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                    Sounds rehearsed
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {activeTab === 'behavioral' 
                    ? 'In a previous professional capacity, I encountered a paradigm-shifting conflict regarding resource allocation. I proactively synthesized our disparate viewpoints into a synergistic framework, thereby optimizing cross-functional collaboration and maximizing ROI.'
                    : 'An Application Programming Interface (API) is a set of defined rules that enables different applications to communicate with each other. It acts as an intermediary layer that processes data transfers between systems, following REST or SOAP protocols to ensure robust and secure data exchange.'}
                </p>
              </div>

              {/* Humanize / Desi Mode */}
              <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-primary-900/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-lg font-semibold text-primary-400 flex items-center gap-2">
                    Humanize <Sparkles size={16} />
                  </h3>
                  <span className="text-xs bg-primary-900/50 text-primary-300 px-3 py-1 rounded-full border border-primary-500/30 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Sounds like you
                  </span>
                </div>
                <p className="text-gray-200 leading-relaxed text-sm md:text-base relative z-10">
                  {activeTab === 'behavioral' 
                    ? 'We had a situation where two senior devs disagreed on which database to use. Instead of arguing in circles, I suggested we spend a day prototyping both. Once we saw the performance metrics, it was obvious which one worked better for our specific use case, and everyone was happy to move forward.'
                    : 'Think of an API like a waiter at a restaurant. You are the customer, and the kitchen is the system you want to get data from. You don\'t go into the kitchen yourself—you tell the waiter what you want, the waiter takes your order to the kitchen, and brings your food back to you. An API does exactly that for software.'}
                </p>
                <div className="mt-8 space-y-2 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-primary-300/80">
                    <CheckCircle2 size={14} className="text-primary-500" /> Simple language
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary-300/80">
                    <CheckCircle2 size={14} className="text-primary-500" /> Short sentences
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary-300/80">
                    <CheckCircle2 size={14} className="text-primary-500" /> Real-world examples
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesiMode;
