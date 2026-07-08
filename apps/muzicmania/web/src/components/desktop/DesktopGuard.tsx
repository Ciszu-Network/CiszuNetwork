'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { isTauri } from '@/lib/isTauri';
import { DesktopConfirmDialog } from './DesktopConfirmDialog';

interface DesktopSettings {
  close_confirm: boolean;
  link_confirm: boolean;
}

const DEFAULT_SETTINGS: DesktopSettings = { close_confirm: true, link_confirm: true };

async function getSettings(): Promise<DesktopSettings> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<DesktopSettings>('get_settings');
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function setSettings(s: DesktopSettings) {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('update_settings', { settings: s });
  } catch { /* fallback */ }
}

export function DesktopGuard({ children }: { children: React.ReactNode }) {
  const [closeDialog, setCloseDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState<{ url: string } | null>(null);
  const [settings, setSettingsState] = useState<DesktopSettings>(DEFAULT_SETTINGS);
  const unlistenRef = useRef<(() => void) | undefined>(undefined);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!isTauri()) return;
    getSettings().then(setSettingsState);
  }, []);

  const handleCloseConfirm = useCallback(async (dontAskAgain: boolean) => {
    if (dontAskAgain) {
      const next = { ...settingsRef.current, close_confirm: false };
      setSettingsState(next);
      await setSettings(next);
    }
    setCloseDialog(false);
    if (isTauri()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_window');
      } catch {
        try {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          await getCurrentWindow().close();
        } catch {
          window.close();
        }
      }
    }
  }, []);

  const handleCloseCancel = useCallback(() => {
    setCloseDialog(false);
  }, []);

  const handleLinkConfirm = useCallback(async (dontAskAgain: boolean, url: string) => {
    if (dontAskAgain) {
      const next = { ...settingsRef.current, link_confirm: false };
      setSettingsState(next);
      await setSettings(next);
    }
    setLinkDialog(null);
    window.open(url, '_blank');
  }, []);

  const handleLinkCancel = useCallback(() => {
    setLinkDialog(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isTauri()) return;

    let cancelled = false;

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (cancelled) return;
      listen('close-requested', () => {
        if (settingsRef.current.close_confirm) {
          setCloseDialog(true);
        } else {
          import('@tauri-apps/api/core').then(({ invoke }) =>
            invoke('close_window')
          ).catch(() => {
            import('@tauri-apps/api/window').then(({ getCurrentWindow }) =>
              getCurrentWindow().close()
            );
          });
        }
      }).then((fn) => { unlistenRef.current = fn; });
    });

    return () => {
      cancelled = true;
      unlistenRef.current?.();
    };
  }, []);

  // Intercept external links
  useEffect(() => {
    if (typeof window === 'undefined' || !isTauri()) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (href.startsWith(window.location.origin)) return;

      e.preventDefault();
      e.stopPropagation();

      if (settingsRef.current.link_confirm) {
        setLinkDialog({ url: href });
      } else {
        window.open(href, '_blank');
      }
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  // Block ALL unwanted browser/Tauri shortcuts
  useEffect(() => {
    if (typeof window === 'undefined' || !isTauri()) return;

    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Bloquear F-keys: F1-F12 (ayuda, buscar, recargar, devtools, etc)
      if (key.startsWith('F') && key.length >= 2 && key.length <= 3) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Bloquear combinaciones Ctrl/Cmd + tecla
      if (ctrl) {
        const blockedCtrl = ['p', 's', 'u', 'j', 'o', 'w', 'q', 'r', 'n', 't', 'd', 'e', 'f', 'g', 'h', 'a', 'b', 'c'];
        if (blockedCtrl.includes(key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // Bloquear Ctrl+Shift+I/J/C (DevTools)
      if (ctrl && shift && ['i', 'j', 'c'].includes(key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Bloquear teclas individuales problemáticas
      const blockedKeys = ['PrintScreen', 'ScrollLock', 'Pause', 'ContextMenu', 'BrowserBack', 'BrowserForward', 'BrowserRefresh', 'BrowserSearch', 'BrowserFavorites', 'BrowserHome'];
      if (blockedKeys.includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    document.addEventListener('keydown', blockKeys, true);
    return () => document.removeEventListener('keydown', blockKeys, true);
  }, []);

  // Block context menu (right-click) and image drag
  useEffect(() => {
    if (typeof window === 'undefined' || !isTauri()) return;

    const blockCtx = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blockDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('contextmenu', blockCtx, true);
    document.addEventListener('dragstart', blockDrag, true);

    return () => {
      document.removeEventListener('contextmenu', blockCtx, true);
      document.removeEventListener('dragstart', blockDrag, true);
    };
  }, []);

  const toggleFocus = useCallback(() => {
    document.body.classList.toggle('focus-mode');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isTauri()) {
      (window as any).__toggleFocusMode = toggleFocus;
    }
  }, [toggleFocus]);

  return (
    <>
      {children}
      <DesktopConfirmDialog
        open={closeDialog}
        title="CERRAR MUZICMANIA"
        message="¿Estás seguro de que deseas salir de MuzicMania? Se perderá tu partida actual."
        confirmLabel="SALIR"
        cancelLabel="SEGUIR JUGANDO"
        showDontAsk={true}
        onConfirm={(d) => handleCloseConfirm(d)}
        onCancel={handleCloseCancel}
      />
      <DesktopConfirmDialog
        open={linkDialog !== null}
        title="SALIR DE MUZICMANIA"
        message={`Se abrirá un enlace externo en tu navegador. ¿Deseas continuar?`}
        confirmLabel="ABRIR ENLACE"
        cancelLabel="CANCELAR"
        showDontAsk={true}
        onConfirm={(d) => linkDialog && handleLinkConfirm(d, linkDialog.url)}
        onCancel={handleLinkCancel}
      />
    </>
  );
}
