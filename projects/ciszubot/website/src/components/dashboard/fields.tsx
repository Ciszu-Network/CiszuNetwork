'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GuildEmoji } from '@/lib/discordGuild';

/**
 * Campos enriquecidos del dashboard:
 *  · NiceSelect   → select con estilo propio (no nativo)
 *  · EmojiPicker  → panel rápido con los emojis REALES del servidor
 *  · RichInput    → input con botón de emojis
 *  · RichTextarea → textarea auto-ajustable con emojis + markdown rápido
 *  · MultiSelect  → lista con checkboxes (roles/canales reales) en vez de IDs a mano
 */

const FIELD_CLS =
  'w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-neon-blue/60';

export function NiceSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CLS} appearance-none pr-8 [&>option]:bg-[#0b0f1a] [&>option]:text-white`}
      >
        <option value="" disabled>
          {placeholder ?? '—'}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40">▼</span>
    </div>
  );
}

/** Inserta texto en la posición del cursor de un input/textarea. */
function insertAtCursor(el: HTMLInputElement | HTMLTextAreaElement | null, text: string) {
  if (!el) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const next = el.value.slice(0, start) + text + el.value.slice(end);
  el.value = next;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  const pos = start + text.length;
  el.setSelectionRange(pos, pos);
  el.focus();
}

function EmojiPanel({ emojis, onPick, onClose }: { emojis: GuildEmoji[]; onPick: (e: string) => void; onClose: () => void }) {
  const STANDARD = ['😀', '😂', '😍', '🤝', '🎉', '⭐', '💎', '🔥', '❤️', '✅', '❌', '⚠️', '💰', '🏆', '📢', '🎫'];
  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-white/15 bg-[#0b0f1a]/98 p-2 shadow-2xl">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Emojis del servidor</span>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <div className="grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
        {emojis.length === 0 && <p className="col-span-8 text-[10px] text-white/35">Sin emojis en este servidor.</p>}
        {emojis.map((e) => (
          <button
            key={e.id}
            type="button"
            title={`:${e.name}:`}
            onClick={() => {
              onPick(`<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`);
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10"
          >
            <img
              src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}?size=32`}
              alt={e.name}
              className="h-5 w-5"
            />
          </button>
        ))}
      </div>
      <div className="mt-2 border-t border-white/10 pt-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Estándar</span>
        <div className="mt-1 grid grid-cols-8 gap-1">
          {STANDARD.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onPick(e);
                onClose();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-white/10"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function useEmojiInsert() {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [open, setOpen] = useState(false);
  const insert = useCallback((text: string) => insertAtCursor(ref.current, text), []);
  return { ref, open, setOpen, insert };
}

export function RichInput({
  value,
  onChange,
  placeholder,
  maxLength,
  emojis = [],
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  emojis?: GuildEmoji[];
  className?: string;
}) {
  const { ref, open, setOpen, insert } = useEmojiInsert();
  return (
    <div className={`relative ${className ?? ''}`}>
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        className={`${FIELD_CLS} pr-9`}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        title="Insertar emoji"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-white/40 transition hover:text-neon-blue"
      >
        😊
      </button>
      {open && <EmojiPanel emojis={emojis} onPick={(e) => { insert(e); onChange((ref.current as HTMLInputElement | null)?.value ?? value); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function RichTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 2000,
  emojis = [],
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  emojis?: GuildEmoji[];
  rows?: number;
}) {
  const { ref, open, setOpen, insert } = useEmojiInsert();
  const wrap = (before: string, after = before) => {
    const el = ref.current as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = el.value.slice(start, end) || 'texto';
    const next = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    el.value = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    onChange(next);
  };
  return (
    <div className="relative">
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        className={`${FIELD_CLS} min-h-[70px] resize-y pr-9`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1 flex items-center gap-1">
        {(
          [
            ['B', () => wrap('**')],
            ['I', () => wrap('*')],
            ['</>', () => wrap('`')],
            ['||', () => wrap('||')],
          ] as const
        ).map(([label, fn]) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            className="rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-black text-white/50 transition hover:border-neon-blue/60 hover:text-white"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          title="Insertar emoji"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-sm text-white/40 transition hover:text-neon-blue"
        >
          😊
        </button>
        {open && (
          <div className="absolute bottom-6 right-0">
            <EmojiPanel emojis={emojis} onPick={(e) => { insert(e); onChange((ref.current as HTMLTextAreaElement | null)?.value ?? value); }} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${FIELD_CLS} flex min-h-[34px] flex-wrap items-center gap-1 text-left`}
      >
        {values.length === 0 && <span className="text-white/30">{placeholder ?? '—'}</span>}
        {values.slice(0, 4).map((id) => {
          const opt = options.find((o) => o.id === id);
          return (
            <span key={id} className="rounded-md bg-neon-blue/15 px-1.5 py-0.5 text-[10px] font-bold text-neon-blue">
              {opt?.label ?? id}
            </span>
          );
        })}
        {values.length > 4 && <span className="text-[10px] text-white/40">+{values.length - 4}</span>}
        <span className="ml-auto text-[10px] text-white/40">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#0b0f1a]/98 p-1.5 shadow-2xl">
          {options.length === 0 && <p className="p-2 text-[10px] text-white/35">Sin opciones.</p>}
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                values.includes(opt.id) ? 'bg-neon-blue/15 text-neon-blue' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                  values.includes(opt.id) ? 'border-neon-blue bg-neon-blue/30' : 'border-white/25'
                }`}
              >
                {values.includes(opt.id) && <span className="text-[8px] font-black">✓</span>}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
