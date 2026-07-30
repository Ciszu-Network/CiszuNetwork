'use client';

import React from 'react';

export function FlagVE({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <span className={`${className} flex-shrink-0 relative overflow-hidden rounded-sm inline-block`}>
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <use href="/icons/sprites/sprite-flags.svg#flag-ve" />
      </svg>
    </span>
  );
}

export default FlagVE;
