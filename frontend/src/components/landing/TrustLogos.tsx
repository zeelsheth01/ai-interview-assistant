import React from 'react';

const TrustLogos = () => {
  const logos = ['Google', 'Microsoft', 'Meta', 'Netflix', 'LinkedIn', 'PayPal', 'IBM', 'MongoDB', 'X/Twitter'];

  return (
    <div className="py-12 border-y border-white/5 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-400 mb-8">
          Used for 10,000+ interviews
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {logos.map((logo, index) => (
            <span key={index} className="text-xl font-bold text-gray-300">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustLogos;
