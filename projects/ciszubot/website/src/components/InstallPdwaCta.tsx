'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@ciszu/ui';

interface InstallPdwaCtaProps {
  title: string;
  desc: string;
  notice: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPdwaCta({ title, desc, notice }: InstallPdwaCtaProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferred(null);
      return;
    }
    setHint(true);
  };

  if (installed) return null;

  return (
    <div>
      <h3 className="font-bold text-xl text-ink mb-2">{title}</h3>
      <p className="text-sm text-muted mb-5 leading-relaxed">{desc}</p>
      {deferred ? (
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white shadow-[0_8px_22px_-8px_rgba(0,212,255,0.7)] transition-all hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.9)] active:scale-95"
        >
          <Icon name="download" size={16} />
          {title}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-neon-blue/50 text-neon-blue bg-neon-blue/10 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-95"
        >
          <Icon name="download" size={16} />
          {title}
        </button>
      )}
      {hint && <p className="mt-3 text-xs text-warn">{notice}</p>}
    </div>
  );
}