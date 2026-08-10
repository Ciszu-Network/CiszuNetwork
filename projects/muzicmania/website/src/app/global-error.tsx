'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          background: '#000',
          color: '#fff',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>¡Ups!</h1>
          <p style={{ opacity: 0.8 }}>
            Algo salió mal cargando esta página. Intenta recargar en unos segundos.
          </p>
        </div>
      </body>
    </html>
  );
}