'use client';

import { useEffect } from 'react';

export interface KoFiOverlayProps {
  handle: string;
  buttonText?: string;
  buttonColor?: string;
  textColor?: string;
}

export default function KoFiOverlay({
  handle,
  buttonText = 'Support me',
  buttonColor = '#794bc4',
  textColor = '#fff',
}: KoFiOverlayProps) {
  useEffect(() => {
    console.log('[KoFiOverlay] mount', { handle, buttonText, buttonColor, textColor });

    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    script.onload = () => {
      console.log('[KoFiOverlay] script loaded');
      // @ts-ignore
      if (window.kofiWidgetOverlay) {
        // @ts-ignore
        window.kofiWidgetOverlay.draw(handle, {
          type: 'floating-chat',
          'floating-chat.donateButton.text': buttonText,
          'floating-chat.donateButton.background-color': buttonColor,
          'floating-chat.donateButton.text-color': textColor,
        });
        console.log('[KoFiOverlay] draw called');
      } else {
        console.warn('[KoFiOverlay] kofiWidgetOverlay not found after script load');
      }
    };
    script.onerror = () => console.warn('[KoFiOverlay] script failed to load');
    document.body.appendChild(script);

    // @ts-ignore
    if (window.kofiWidgetOverlay) {
      // @ts-ignore
      window.kofiWidgetOverlay.draw(handle, {
        type: 'floating-chat',
        'floating-chat.donateButton.text': buttonText,
        'floating-chat.donateButton.background-color': buttonColor,
        'floating-chat.donateButton.text-color': textColor,
      });
      console.log('[KoFiOverlay] draw called (already loaded)');
    }

    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // already removed
      }
    };
  }, [handle, buttonText, buttonColor, textColor]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[99999]"
      aria-hidden="true"
    >
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-white/70">
        Ko-fi overlay: {handle}
      </div>
    </div>
  );
}
