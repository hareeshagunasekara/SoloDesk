import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#210B2C] via-[#2A0F3A] to-[#1A0720] animate-pulse" 
           style={{ animationDuration: '8s' }} />
      
      {/* Animated waves overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BC96E6]/20 to-transparent animate-pulse"
             style={{ 
               animationDuration: '6s',
               animationDelay: '0s'
             }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD166]/15 to-transparent animate-pulse"
             style={{ 
               animationDuration: '8s',
               animationDelay: '2s'
             }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BC96E6]/25 to-transparent animate-pulse"
             style={{ 
               animationDuration: '10s',
               animationDelay: '4s'
             }} />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              i % 3 === 0 ? 'bg-[#BC96E6]/40' : 
              i % 3 === 1 ? 'bg-[#FFD166]/30' : 
              'bg-[#BC96E6]/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#210B2C]/30 via-transparent to-transparent" />
    </div>
  );
};

export default AnimatedBackground; 