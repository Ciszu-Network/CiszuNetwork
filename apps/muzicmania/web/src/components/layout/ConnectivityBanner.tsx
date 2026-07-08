'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function ConnectivityBanner() {
  const { isOnline, isChecking, retryCount, checkConnection, startRetry, stopRetry, lastError } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [bannerType, setBannerType] = useState<'offline' | 'reconnecting' | 'restored'>('offline');
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setBannerType('offline');
      startRetry();
    } else if (visible && bannerType !== 'restored') {
      setBannerType('restored');
      stopRetry();
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = setTimeout(() => setVisible(false), 3000);
    }
    return () => { if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current); };
  }, [isOnline]);

  const handleReconnect = useCallback(async () => {
    setBannerType('reconnecting');
    stopRetry();
    const ok = await checkConnection();
    if (ok) {
      setBannerType('restored');
      setTimeout(() => setVisible(false), 3000);
    } else {
      setBannerType('offline');
      startRetry();
    }
  }, [checkConnection, startRetry, stopRetry]);

  if (!visible) return null;

  const bgColor = bannerType === 'restored' ? 'bg-green-600'
    : bannerType === 'reconnecting' ? 'bg-yellow-600'
    : 'bg-red-600';

  return (
    <div className={`fixed top-[60px] left-0 right-0 z-[60] ${bgColor} transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white text-sm font-bold">
          {bannerType === 'restored' ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Conexión restaurada
            </>
          ) : bannerType === 'reconnecting' ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Reconectando{retryCount > 0 ? ` (intento ${retryCount})` : ''}...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414"/></svg>
              <span>Sin conexión{retryCount > 0 ? ` (intento ${retryCount})` : ''}</span>
              {lastError && <span className="text-white/70 text-xs ml-2">— {lastError}</span>}
            </>
          )}
        </div>
        {bannerType === 'offline' && (
          <button onClick={handleReconnect} disabled={isChecking}
            className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            {isChecking ? 'VERIFICANDO...' : 'RECONECTAR'}
          </button>
        )}
      </div>
    </div>
  );
}
