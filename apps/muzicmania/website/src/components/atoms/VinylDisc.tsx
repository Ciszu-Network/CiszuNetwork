import React from 'react';

interface VinylDiscProps {
  color: string;
  className?: string;
  isSpinning?: boolean;
}

export function VinylDisc({ color, className = '', isSpinning = false }: VinylDiscProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className} ${isSpinning ? 'animate-spin' : ''}`} 
      style={{ animationDuration: '4s' }}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        {/* Vinyl Body */}
        <circle cx="100" cy="100" r="95" fill="#0d0d0d" stroke="#222222" strokeWidth="2" />
        
        {/* Grooves */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="#1c1c1c" strokeWidth="1" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#1c1c1c" strokeWidth="1" />
        <circle cx="100" cy="100" r="65" fill="none" stroke="#1c1c1c" strokeWidth="1" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="#1c1c1c" strokeWidth="1" />
        <circle cx="100" cy="100" r="45" fill="none" stroke="#1c1c1c" strokeWidth="1" />
        
        {/* Center Label */}
        <circle cx="100" cy="100" r="30" fill={color} />
        
        {/* Decorative inner rings */}
        <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        
        {/* Center Hole */}
        <circle cx="100" cy="100" r="8" fill="#000000" />
        
        {/* Glossy Overlay */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
        <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
        
        {/* Vinyl sheen / reflection slice */}
        <path d="M 100 100 L 40 40 A 85 85 0 0 1 160 40 Z" fill="rgba(255,255,255,0.025)" />
        <path d="M 100 100 L 160 160 A 85 85 0 0 1 40 160 Z" fill="rgba(255,255,255,0.025)" />
      </svg>
    </div>
  );
}
