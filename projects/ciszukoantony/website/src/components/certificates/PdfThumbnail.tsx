'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

const toAbsolute = (relative: string) =>
  `https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/${relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

const PdfThumbnail = ({ url, alt = 'PDF preview' }: { url: string; alt?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const renderFirstPage = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(false);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const loadingTask = pdfjs.getDocument({ url });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      await page.render({ canvas, viewport }).promise;
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    renderFirstPage();
  }, [renderFirstPage]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/5">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Loading preview</p>
        </div>
      </div>
    );
  }

  if (!error) {
    return (
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white/5">
      <div className="text-center">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white/40 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Preview unavailable</p>
      </div>
    </div>
  );
};

export default PdfThumbnail;
export { toAbsolute };
