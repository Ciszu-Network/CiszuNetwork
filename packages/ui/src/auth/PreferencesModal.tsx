'use client';

// Modal de preferencias locales (LOGIN_REGISTER_PROTOCOLS §4): centrado, con X de
// cierre, abierto desde el botón "Preferencias locales" del dropdown AUTH. Cada web
// inyecta su estado (idioma/tema/zoom/mute) vía props para no acoplarse al store.
import * as Dialog from '@radix-ui/react-dialog';

export interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
}

export function PreferencesModal({
  open,
  onOpenChange,
  title = 'Preferencias locales',
  children,
  overlayClassName = '',
  contentClassName = '',
}: PreferencesModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in ${overlayClassName}`} />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-[60] w-[94vw] max-w-md max-h-[88vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl shadow-cyan-500/10 outline-none ${contentClassName}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <div>
                <Dialog.Title className="font-header text-base font-bold text-white">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-[11px] text-gray-500 font-bold">
                  Se guardan en este dispositivo como invitado.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar preferencias"
                className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PreferencesModal;