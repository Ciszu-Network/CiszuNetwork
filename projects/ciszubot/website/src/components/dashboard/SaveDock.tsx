'use client';

import { useRef } from 'react';

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
  exportJson: string;
  importJson: string;
  unsaved: string;
  allSaved: string;
  backupNote: string;
}

interface Props {
  dirty: boolean;
  status: SaveStatus;
  busy: boolean;
  autoSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onAutoSave: (value: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  labels: SaveDockLabels;
}

const chip =
  'inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-neon-blue/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Panel flotante de guardado: aparece con cambios pendientes, colapsa solo
 * tras guardar y bloquea la interacción mientras la petición está en vuelo.
 */
export function SaveDock({
  dirty,
  status,
  busy,
  autoSave,
  canUndo,
  canRedo,
  onAutoSave,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onImport,
  labels,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const visible = dirty || status === 'saving' || status === 'ok' || status === 'error';

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

  const tone =
    status === 'error'
      ? 'border-red-400/50 bg-[#2a0a12]/90'
      : status === 'ok'
        ? 'border-emerald-400/50 bg-[#062b1a]/90'
        : 'border-white/15 bg-[#0a0a14]/90';

  return (
    <div
      aria-live="polite"
      className={`fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div
        title={labels.backupNote}
        className={`flex max-w-full flex-wrap items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl ${tone}`}
      >
        <span className="mr-1 inline-flex items-center gap-2 px-1 text-xs font-bold text-white/85">
          {status === 'saving' && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-neon-blue" />
          )}
          {status === 'ok' && <span className="text-emerald-400">✅</span>}
          {status === 'error' && <span className="text-red-400">⚠️</span>}
          {status === 'idle' && dirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
          <span className="max-w-[180px] truncate">{statusText}</span>
        </span>

        <button type="button" onClick={onUndo} disabled={!canUndo || busy} className={chip} title={labels.undo}>
          ↶ <span className="hidden sm:inline">{labels.undo}</span>
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo || busy} className={chip} title={labels.redo}>
          ↷ <span className="hidden sm:inline">{labels.redo}</span>
        </button>

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

        <button type="button" onClick={onExport} disabled={busy} className={chip} title={labels.exportJson}>
          ⬇ <span className="hidden md:inline">{labels.exportJson}</span>
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className={chip} title={labels.importJson}>
          ⬆ <span className="hidden md:inline">{labels.importJson}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = '';
          }}
        />

        <button
          type="button"
          onClick={onSave}
          disabled={busy || !dirty}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-4 py-2 text-xs font-black text-white transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {busy ? labels.saving : labels.save}
        </button>
      </div>
    </div>
  );
}
