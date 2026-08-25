'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/store';
import { supabase } from '@/config/supabase';
import { getGuestName } from '@/lib/guest';
import PreferencesPanel from '@/components/auth/PreferencesPanel';
import { PreferencesModal, useToast } from '@ciszu/ui';

const GuestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    <path d="M18 3l3 4M21 3l-3 4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LoginIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const RegisterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/**
 * AuthMenu — Botón AUTH del navbar + dropdown de sesión e invitado.
 * Controlado por el Navbar (open/onClose): cuando se abre search o la
 * hamburguesa, el Navbar cierra este dropdown (exclusividad mútua).
 * Las preferencias locales viven en un MODAL centrado separado (PreferencesModal).
 */
export default function AuthMenu({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const { user, isHydrated, setUser } = useAppStore();
  const { toast } = useToast();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (guestName === null && typeof window !== 'undefined') {
      setGuestName(getGuestName());
    }
  }, [guestName]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const toggle = () => onToggle();

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast('Error al cerrar sesión', 'error');
    } else {
      setUser(null);
      onClose();
      toast('Sesión cerrada. Vuelve pronto.', 'success');
    }
    setLoggingOut(false);
  };

  const displayName = user?.display_name || user?.username || 'Usuario';
  const guest = guestName ?? 'Guest';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={toggle}
        className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 ${
          open
            ? 'bg-gradient-to-r from-brand-light via-brand-accent to-brand-light border-transparent text-white shadow-[0_0_15px_rgba(58,107,240,0.4)]'
            : 'bg-white/5 border-white/20 text-white hover:border-brand-light hover:bg-white/10'
        }`}
        title={user ? `Cuenta — ${displayName}` : 'Cuenta de invitado'}
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${open ? 'bg-black/30' : 'bg-black/40 border border-brand-light/30'}`}>
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={displayName}
              width={28}
              height={28}
              className="rounded-full object-cover w-7 h-7"
            />
          ) : (
            <span className="text-brand-light"><GuestIcon /></span>
          )}
        </span>
        <span className="max-w-[120px] truncate text-xs font-header font-bold tracking-wide">
          {isHydrated ? (user ? displayName : guest) : '…'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-3 w-[300px] max-w-[85vw] z-50 animate-fade-in-down origin-top">
          <div className="bg-[#070710]/98 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
            {/* Cabecera del dropdown */}
            <div className="flex items-center gap-3 pb-3 mb-1 border-b border-white/10">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10 border border-brand-light/40 shadow-[0_0_10px_rgba(58,107,240,0.3)]"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-black/50 border border-brand-light/30 text-brand-light flex items-center justify-center">
                  <GuestIcon />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-header font-black text-white truncate">
                  {isHydrated ? (user ? displayName : guest) : '…'}
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                  {isHydrated ? (user ? user.email : 'Guest local') : 'Cargando…'}
                </p>
              </div>
            </div>

            {/* Acciones de sesión */}
            {user ? (
              <div className="pt-1 pb-1 border-b border-white/10">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <LogoutIcon />
                  {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </button>
              </div>
            ) : (
              <div className="pt-1 pb-1 border-b border-white/10 grid grid-cols-2 gap-1.5">
                <Link
                  href="/login"
                  onClick={() => onClose()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-light/10 border border-brand-light/30 text-brand-light text-xs font-bold hover:bg-brand-light hover:text-black transition-all cursor-pointer active:scale-95"
                >
                  <LoginIcon /> Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => onClose()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:border-brand-accent/50 hover:text-brand-accent transition-all cursor-pointer active:scale-95"
                >
                  <RegisterIcon /> Registrarse
                </Link>
              </div>
            )}

            {/* Botón de preferencias locales -> abre el modal centrado */}
            <div className="pt-1">
              <button
                onClick={() => { setPrefsOpen(true); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:border-brand-light/50 hover:text-brand-light transition-all cursor-pointer active:scale-95"
              >
                <SettingsIcon /> Preferencias locales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal centrado de preferencias (Radix), con X de cierre */}
      <PreferencesModal open={prefsOpen} onOpenChange={setPrefsOpen} title="Preferencias locales">
        <PreferencesPanel />
      </PreferencesModal>
    </div>
  );
}