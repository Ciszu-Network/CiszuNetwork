'use client';

import React from 'react';

/**
 * Fallback estático para certificados sin preview generado (no usa pdfjs:
 * todos los PDFs tienen preview real generado por `pnpm sync:certificates`,
 * que rasteriza la página 1 a PNG en `shared/docs/certificados/previews/`).
 */
const PdfThumbnail = ({ alt = 'PDF preview' }: { alt?: string }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white/5" role="img" aria-label={alt}>
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