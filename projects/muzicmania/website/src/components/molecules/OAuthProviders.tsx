'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"/>
    <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <rect x="1" y="1" width="10.5" height="10.5" fill="#F35325"/>
    <rect x="12.5" y="1" width="10.5" height="10.5" fill="#81BC06"/>
    <rect x="1" y="12.5" width="10.5" height="10.5" fill="#05A6F0"/>
    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFBA08"/>
  </svg>
);

interface OAuthProviderButtonProps {
  name: string;
  icon: React.ReactNode;
  accentClass: string;
  onSelect: (provider: string) => void;
}

const OAuthProviderButton = ({ name, icon, accentClass, onSelect }: OAuthProviderButtonProps) => (
  <button
    type="button"
    onClick={() => onSelect(name)}
    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 font-header font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${accentClass}`}
  >
    {icon}
    {name}
  </button>
);

interface OAuthProvidersProps {
  showToast?: (msg: string) => void;
}

export default function OAuthProviders({ showToast }: OAuthProvidersProps) {
  const store = useAppStore();

  const notify = showToast ?? store.showToast;

  const handleSelect = (provider: string) => {
    notify(`OAuth de ${provider} disponible en futura versión beta`);
  };

  return (
    <div className="pt-6 border-t border-white/5">
      <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">
        Opciones adicionales
      </p>
      <div className="flex gap-3">
        <OAuthProviderButton
          name="Google"
          icon={<GoogleIcon />}
          accentClass="hover:border-[#4285F4]/60 hover:bg-[#4285F4]/10 hover:text-[#4285F4]"
          onSelect={handleSelect}
        />
        <OAuthProviderButton
          name="Microsoft"
          icon={<MicrosoftIcon />}
          accentClass="hover:border-[#05A6F0]/60 hover:bg-[#05A6F0]/10 hover:text-[#05A6F0]"
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}