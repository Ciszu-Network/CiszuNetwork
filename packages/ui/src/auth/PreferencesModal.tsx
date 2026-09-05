'use client';

// Modal de preferencias locales (LOGIN_REGISTER_PROTOCOLS §4): centrado, con X de
// cierre, abierto desde el botón "Preferencias locales" del dropdown AUTH. Cada web
// inyecta su estado (idioma/tema/zoom/mute) vía props para no acoplarse al store.
//
// FIX click-through: el LanguagesModal hijo se renderiza con createPortal en
// document.body (FUERA del DOM del Dialog), por lo que Radix lo trataba como
// interacción "outside" y cerraba TODO el modal de preferencias al hacer click
// en cualquier parte del selector de idiomas (scrollbar, botones, flecha de
// volver). Ahora se bloquea el cierre por outside-interaction; el overlay del
// propio modal sigue cerrando al hacer click en él (handler propio).
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
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Solo cerrar si el click es directamente en el overlay, no en el content
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`fixed inset-0 z-[60] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in ${overlayClassName}`}
          style={{ background: 'var(--overlay, rgba(0,0,0,0.7))' }}
          onClick={handleOverlayClick}
        />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={`fixed left-1/2 top-1/2 z-[60] w-[94vw] max-w-md max-h-[88vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl outline-none ${contentClassName}`}
          style={{
            background: 'var(--bg-card, var(--surface, #0a0a0f))',
            borderColor: 'var(--border, rgba(255,255,255,0.1))',
            color: 'var(--ink, #fff)',
            boxShadow: 'var(--shadow-modal, 0 25px 60px rgba(0,0,0,0.45))',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="w-9 h-9 rounded-xl border flex items-center justify-center"
                style={{
                  background: 'var(--accent-soft, rgba(34,211,238,0.1))',
                  borderColor: 'var(--accent-border, rgba(34,211,238,0.3))',
                  color: 'var(--accent, #22d3ee)',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <div>
                <Dialog.Title className="font-header text-base font-bold" style={{ color: 'var(--ink, #fff)' }}>
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-[11px] font-bold" style={{ color: 'var(--ink-faint, rgba(255,255,255,0.45))' }}>
                  Se guardan en este dispositivo como invitado.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Cerrar preferencias"
                className="rounded-lg border p-1.5 transition-colors cursor-pointer"
                style={{
                  borderColor: 'var(--border, rgba(255,255,255,0.1))',
                  color: 'var(--ink-muted, rgba(255,255,255,0.7))',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover, rgba(255,255,255,0.08))'; e.currentTarget.style.color = 'var(--ink, #fff)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-muted, rgba(255,255,255,0.7))'; }}
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