'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { getGuestName } from '@/lib/guest';
import { supabase } from '@/config/supabase';
import PreferencesPanel from '@/components/auth/PreferencesPanel';
import { PreferencesModal } from '@ciszu/ui';

export const GuestIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c.8-3.2 3.6-5 7.5-5s6.7 1.8 7.5 5" />
    <circle cx="12" cy="8" r="7.5" strokeDasharray="2 2" opacity="0.45" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/**
 * AuthMenu — dropdown de sesión de ciszukoantony (LOGIN_REGISTER_PROTOCOLS §4).
 * Las preferencias locales se abren desde "Preferencias locales" en un modal
 * centrado separado (PreferencesModal); aquí solo quedan sesión y accesos.
 */
export default function AuthMenu({ onClose }: { onClose: () => void }) {
  const { user } = useAppStore();
  const [guestName] = useState(() => getGuestName());
  const [prefsOpen, setPrefsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="bg-[#070712]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in-down origin-top max-h-[80vh] overflow-y-auto">
      {/* Header de sesión */}
      <div className={`px-4 py-3 border-b border-white/10 flex items-center gap-3 ${
        user ? 'bg-gradient-to-br from-neon-blue/25 via-[#6600ff]/15 to-neon-pink/15'
             : 'bg-gradient-to-br from-white/5 to-white/[0.02]'
      }`}>
        {user ? (
          <>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neon-blue/60 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-white shadow-[0_0_15px_rgba(61,106,223,0.5)] shrink-0">
                <span className="font-header font-black text-lg">{user.display_name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-header font-bold text-sm truncate">{user.display_name}</p>
              <p className="text-gray-400 text-[11px] truncate">@{user.username}</p>
              <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-gray-300 shrink-0">
              <GuestIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-header font-bold text-sm truncate">{guestName}</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Sesión de invitado</p>
            </div>
          </>
        )}
      </div>

      {/* Acciones de sesión */}
      <div className="p-3 border-b border-white/10 space-y-2">
        {user ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-pink/25 to-neon-pink/10 hover:from-neon-pink/40 border border-neon-pink/30 text-neon-pink hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-blue/25 to-neon-blue/10 hover:from-neon-blue/45 border border-neon-blue/30 text-neon-blue hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-neon-pink/25 to-neon-pink/10 hover:from-neon-pink/40 border border-neon-pink/30 text-neon-pink hover:text-white rounded-xl font-header font-bold text-sm transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Botón de preferencias locales -> abre el modal centrado */}
      <div className="p-3">
        <button
          onClick={() => setPrefsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:border-neon-blue/50 hover:text-neon-blue font-header font-bold text-sm transition-all active:scale-95"
        >
          <SettingsIcon /> Preferencias locales
        </button>
      </div>

      {/* Modal centrado de preferencias (Radix), con X de cierre */}
      <PreferencesModal open={prefsOpen} onOpenChange={setPrefsOpen} title="Preferencias locales">
        <PreferencesPanel />
      </PreferencesModal>
    </div>
  );
}