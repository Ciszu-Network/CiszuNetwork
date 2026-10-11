'use client';

export type SaveStatus = 'idle' | 'saving' | 'ok' | 'error';

export interface SaveDockLabels {
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  autoSaveLabel: string;
  autoSaveHint: string;
  undo: string;
  redo: string;
  unsaved: string;
  allSaved: string;
  backupNote: string;
  cancel: string;
}

interface Props {
  dirty: boolean;
  status: SaveStatus;
  /** Aviso extra (p. ej. bot desconectado) dentro del panel. */
  note?: string | null;
  busy: boolean;
  autoSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** Intento de salir/cambiar con cambios sin guardar: sacudida roja. */
  blocked?: boolean;
  /** Motivo del bloqueo (p. ej. bot fuera del servidor): desactiva guardar. */
  saveDisabled?: boolean;
  onAutoSave: (value: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onCancel: () => void;
  labels: SaveDockLabels;
}

const chip =
  'inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-neon-blue/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

const UndoIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

const RedoIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
    <path d="M5 3h11.2L21 7.8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 2v5h8V5H7zm-1 9v5h12v-5H6z" />
  </svg>
);

/**
 * Panel flotante de guardado.
 *
 * Undo/Redo viven SIEMPRE a la izquierda (aunque no haya cambios), con 30
 * niveles de historial en memoria. El resto: estado (amarillo con cambios,
 * verde guardado, rojo error o bloqueo por intento de salida), autosave,
 * cancelar (descarta cambios) y guardar (degradado verde). Los JSON de
 * import/export ya no viven aquí: están por sección, junto a su título.
 */
export function SaveDock({
  note,
  dirty,
  status,
  busy,
  autoSave,
  canUndo,
  canRedo,
  blocked = false,
  saveDisabled = false,
  onAutoSave,
  onUndo,
  onRedo,
  onSave,
  onCancel,
  labels,
}: Props) {
  const statusText =
    status === 'saving'
      ? labels.saving
      : status === 'ok'
        ? labels.saved
        : status === 'error'
          ? labels.saveError
          : dirty
            ? labels.unsaved
            : labels.allSaved;

  const tone = blocked
    ? 'border-red-500/70 bg-[#2a0a12]/95'
    : status === 'error'
      ? 'border-red-400/50 bg-[#2a0a12]/90'
      : status === 'ok'
        ? 'border-emerald-400/50 bg-[#062b1a]/90'
        : dirty
          ? 'border-amber-400/50 bg-[#241a06]/90'
          : 'border-white/15 bg-[#0a0a14]/90';

  return (
    <div aria-live="polite" className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 transition-all duration-300">
      <div
        title={labels.backupNote}
        className={`flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl ${tone} ${blocked ? 'cz-shake' : ''}`}
      >
        {/* Undo/Redo: siempre visibles, a la izquierda del todo. */}
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
          <button type="button" onClick={onUndo} disabled={!canUndo || busy} className={chip} title={labels.undo}>
            <UndoIcon />
            <span className="hidden sm:inline">{labels.undo}</span>
          </button>
          <button type="button" onClick={onRedo} disabled={!canRedo || busy} className={chip} title={labels.redo}>
            <RedoIcon />
            <span className="hidden sm:inline">{labels.redo}</span>
          </button>
        </div>

        <span className="mr-1 inline-flex items-center gap-2 px-1 text-xs font-bold text-white/85">
          {status === 'saving' && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-neon-blue" />
          )}
          {status === 'ok' && <span className="text-emerald-400">✓</span>}
          {status === 'error' && <span className="text-red-400">⚠</span>}
          {status === 'idle' && dirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
          {status === 'idle' && !dirty && <span className="h-2 w-2 rounded-full bg-emerald-400/70" />}
          <span className="max-w-[180px] truncate">{statusText}</span>
        </span>

        {note && (
          <span className="w-full text-center text-[10px] font-bold leading-snug text-red-400 sm:w-auto sm:flex-1">
            {note}
          </span>
        )}

        <button
          type="button"
          onClick={() => onAutoSave(!autoSave)}
          disabled={busy}
          className={`${chip} ${autoSave ? 'border-neon-blue/60 text-neon-blue' : ''}`}
          title={labels.autoSaveHint}
          aria-pressed={autoSave}
        >
          <span
            className={`relative h-4 w-7 shrink-0 rounded-full transition ${
              autoSave ? 'bg-gradient-to-r from-neon-blue to-neon-pink' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                autoSave ? 'left-3.5' : 'left-0.5'
              }`}
            />
          </span>
          <span className="hidden sm:inline">{labels.autoSaveLabel}</span>
        </button>

        <button type="button" onClick={onCancel} disabled={busy || !dirty} className={chip}>
          {labels.cancel}
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={busy || !dirty || saveDisabled}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-xs font-black text-white transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <SaveIcon />
          )}
          {busy ? labels.saving : labels.save}
        </button>
      </div>
    </div>
  );
}
