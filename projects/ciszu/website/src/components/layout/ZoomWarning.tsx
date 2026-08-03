'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ZoomWarning = () => {
  const [dismissed, setDismissed] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);
    if (zoom > 120) {
      setShow(true);
      setDismissed(false);
    }
  }, []);

  if (dismissed || !show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] max-w-md mx-auto md:mx-4">
      <div className="glass rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up border border-yellow-500/30">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold mb-1">Zoom alto detectado</p>
          <p className="text-gray-400 text-xs">Reduce el zoom del navegador para una mejor experiencia (100-120%).</p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-500 hover:text-white transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ZoomWarning;
