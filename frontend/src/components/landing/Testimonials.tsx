
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Alex Sharma",
      role: "Software Engineer at MNC",
      quote: "Chiku AI helped me land a job at a top tech company. The live suggestions were incredibly accurate and kept me on track during intense coding rounds.",
      avatar: "AS"
    },
    {
      name: "Priya Patel",
      role: "Product Manager",
      quote: "I used the Desi Mode for behavioral questions. It sounded so natural that the interviewers felt they were just having a conversation with me.",
      avatar: "PP"
    },
    {
      name: "Rahul Gupta",
      role: "Data Scientist",
      quote: "The resume builder is fantastic. It analyzed my CV and generated a version that passed the ATS seamlessly. Highly recommended!",
      avatar: "RG"
    }
  ];

  return (
    <div className="py-24 bg-dark-900/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Stories from people who landed the job
          </h2>
          <p className="text-xl text-gray-400">
            Real users, real offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass p-8 rounded-2xl border border-white/10 premium-hover flex flex-col h-full">
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-lg flex-grow mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center font-bold text-white shadow-lg">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{t.name}</h4>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
