'use client';

import React from 'react';
import { Icon } from '@ciszu/ui';

export function FlagVE({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <span className={`${className} flex-shrink-0 relative overflow-hidden rounded-sm inline-block`}>
      <Icon name="ve" style="flag" size={24} height={16} className="w-full h-full" />
    </span>
  );
}

export default FlagVE;
