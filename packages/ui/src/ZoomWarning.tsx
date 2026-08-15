import React, { useState, useEffect } from 'react';

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ZoomWarning() {
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
        <AlertTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold mb-1">Zoom alto detectado</p>
          <p className="text-gray-400 text-xs">
            Reduce el zoom del navegador para una mejor experiencia (100-120%).
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-white transition-colors shrink-0"
          aria-label="Cerrar aviso de zoom"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ZoomWarning;