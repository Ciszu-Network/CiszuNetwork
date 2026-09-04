'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

const toAbsolute = (relative) =>
  `https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/${relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

const PdfThumbnail = ({ url, alt = 'PDF preview' }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const renderFirstPage = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    const loadingTask = pdfjs.getDocument(url);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    setLoading(false);
  }, [url]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    renderFirstPage().catch(() => {
      setError(true);
      setLoading(false);
    });
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
        alt={alt}
        className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <iframe
      src={url}
      title={alt}
      className="w-full h-full border-0 bg-white transition-transform duration-300 group-hover:scale-105"
    />
  );
};

export default PdfThumbnail;
export { toAbsolute };
