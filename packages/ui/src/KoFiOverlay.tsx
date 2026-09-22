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
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    document.body.appendChild(script);

    const draw = () => {
      // @ts-ignore
      if (window.kofiWidgetOverlay) {
        // @ts-ignore
        window.kofiWidgetOverlay.draw(handle, {
          type: 'floating-chat',
          'floating-chat.donateButton.text': buttonText,
          'floating-chat.donateButton.background-color': buttonColor,
          'floating-chat.donateButton.text-color': textColor,
        });
      }
    };

    script.onload = draw;
    // @ts-ignore
    if (window.kofiWidgetOverlay) {
      draw();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [handle, buttonText, buttonColor, textColor]);

  return null;
}
