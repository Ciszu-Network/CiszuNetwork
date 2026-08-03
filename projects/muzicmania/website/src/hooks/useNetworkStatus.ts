'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/ping', { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setIsOnline(true);
        setLastError(null);
        setRetryCount(0);
        return true;
      }
      throw new Error('Servidor no responde');
    } catch (e: any) {
      setIsOnline(false);
      setLastError(e.name === 'AbortError' ? 'Tiempo de espera agotado' : e.message || 'Error de red');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const startRetry = useCallback(() => {
    const delay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
    retryTimerRef.current = setTimeout(async () => {
      setRetryCount(prev => prev + 1);
      await checkConnection();
    }, delay);
  }, [retryCount, checkConnection]);

  const stopRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setLastError(null);
      setRetryCount(0);
      stopRetry();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLastError('Sin conexión a internet');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopRetry();
    };
  }, [stopRetry]);

  return { isOnline, isChecking, retryCount, setRetryCount, lastError, setLastError, checkConnection, startRetry, stopRetry };
}
