'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';
import type { GuildEmoji } from '@/lib/discordGuild';
import { useClientI18n } from '@/hooks/useClientI18n';

/**
 * Campos enriquecidos del dashboard:
 *  · NiceSelect   → lista personalizada con buscador, iconos y filtros
 *  · GuildPicker  → mosaico de servidores con buscador (sin acciones de config)
 *  · EmojiPicker  → panel rápido con los emojis REALES del servidor
 *  · RichInput    → input con botón de emojis
 *  · RichTextarea → textarea auto-ajustable con emojis + markdown rápido
 *  · MultiSelect  → lista con checkboxes (roles/canales reales) en vez de IDs a mano
 */

const FIELD_CLS =
  'w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-neon-blue/60';

export interface ListOption {
  id: string;
  label: string;
  icon?: string;
  kind?: string;
}

export interface PickerGuild {
  id: string;
  name: string;
  icon: string | null;
  invited?: boolean | null;
}

function optionIcon(option: ListOption): string {
  if (option.icon) return option.icon;
  if (option.label.startsWith('🔊')) return 'music';
  if (option.label.startsWith('📁')) return 'box-archive';
  if (option.label.startsWith('🔞')) return 'triangle-exclamation';
  if (option.label.startsWith('@')) return 'user';
  if (option.label.startsWith('#')) return 'message-square';
  return 'message';
}

function optionKind(option: ListOption): string {
  if (option.kind) return option.kind;
  if (option.label.startsWith('🔊')) return 'voice';
  if (option.label.startsWith('📁')) return 'category';
  if (option.label.startsWith('🔞')) return 'nsfw';
  if (option.label.startsWith('@')) return 'role';
  if (option.label.startsWith('#')) return 'text';
  return 'other';
}

function PickerAvatar({ guild, size = 28 }: { guild: PickerGuild; size?: number }) {
  if (guild.icon) {
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full"
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple font-black text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {guild.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function NiceSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  clearable = false,
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: ListOption[];
  placeholder?: string;
  className?: string;
  clearable?: boolean;
}) {
  const { dict } = useClientI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.id === value) ?? null;
  const kinds = Array.from(new Set(options.map(optionKind)));
  const hasKinds = kinds.length > 1 && !kinds.every((entry) => entry === 'other');

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const filtered = options.filter((option) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || option.label.toLowerCase().includes(q);
    const matchesKind = kind === 'all' || optionKind(option) === kind;
    return matchesQuery && matchesKind;
  });

  return (
    <div ref={boxRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`${FIELD_CLS} flex min-h-[34px] items-center gap-2 text-left`}
      >
        <Icon name={selected ? optionIcon(selected) : 'menu'} size={13} className="shrink-0 text-neon-blue" />
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-white' : 'text-white/30'}`}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        {clearable && selected && (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
              setOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChange('');
                setOpen(false);
              }
            }}
            className="rounded p-0.5 text-[10px] text-white/35 hover:text-rose-300"
            title={dict.guildPage.multiSelectClear}
          >
            ✕
          </span>
        )}
        <span className="text-[10px] text-white/40">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[60] mt-1 w-full min-w-[220px] rounded-xl border border-white/15 bg-[#0b0f1a]/98 p-2 shadow-2xl">
          <label className="mb-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
            <Icon name="search" size={12} className="shrink-0 text-white/35" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dict.guildPage.mdSearch}
              className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/25"
            />
          </label>
          {hasKinds && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setKind('all')}
                className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                  kind === 'all' ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue' : 'border-white/10 text-white/40'
                }`}
              >
                {dict.dashboardPage.searchUi.all}
              </button>
              {kinds.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setKind(entry)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                    kind === entry ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue' : 'border-white/10 text-white/40'
                  }`}
                >
                  <Icon name={entry === 'text' ? 'message-square' : entry === 'voice' ? 'music' : entry === 'role' ? 'user' : entry === 'category' ? 'box-archive' : 'triangle-exclamation'} size={9} />
                  {entry}
                </button>
              ))}
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-2 text-[10px] text-white/35">{dict.guildPage.multiSelectEmpty}</p>
            ) : (
              filtered.map((option) => {
                const active = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                      active ? 'bg-neon-blue/15 text-neon-blue' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon name={optionIcon(option)} size={13} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {active && <Icon name="check" size={11} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GuildPicker({
  guilds,
  value,
  onChange,
  placeholder,
  className,
}: {
  guilds: PickerGuild[];
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { dict } = useClientI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const selected = guilds.find((guild) => guild.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const visible = guilds.filter((guild) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || guild.name.toLowerCase().includes(q) || guild.id.includes(q);
    const matchesAvailability = !onlyAvailable || guild.invited !== false;
    return matchesQuery && matchesAvailability;
  });

  return (
    <div ref={boxRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`${FIELD_CLS} flex min-h-[34px] items-center gap-2 text-left`}
      >
        {selected ? <PickerAvatar guild={selected} size={22} /> : <Icon name="server" size={14} className="text-neon-blue" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-white' : 'text-white/30'}`}>
          {selected?.name ?? placeholder ?? '—'}
        </span>
        <span className="text-[10px] text-white/40">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[60] mt-1 w-full min-w-[280px] rounded-2xl border border-white/15 bg-[#0a0a14]/98 p-3 shadow-2xl">
          <label className="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
            <Icon name="search" size={12} className="shrink-0 text-white/35" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dict.dashboardPage.searchUi.placeholder}
              className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/25"
            />
          </label>
          <div className="mb-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setOnlyAvailable(false)}
              className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${!onlyAvailable ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40'}`}
            >
              {dict.dashboardPage.searchUi.all}
            </button>
            <button
              type="button"
              onClick={() => setOnlyAvailable(true)}
              className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${onlyAvailable ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40'}`}
            >
              {dict.dashboardPage.searchUi.invited}
            </button>
          </div>
          {visible.length === 0 ? (
            <p className="p-2 text-[10px] text-white/35">{dict.dashboardPage.searchUi.noResults}</p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
              {visible.map((guild) => {
                const active = guild.id === value;
                return (
                  <button
                    key={guild.id}
                    type="button"
                    onClick={() => {
                      onChange(guild.id);
                      setOpen(false);
                    }}
                    title={guild.name}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition ${
                      active ? 'border-neon-cyan/60 bg-neon-cyan/10' : 'border-white/10 hover:border-neon-cyan/40 hover:bg-white/5'
                    }`}
                  >
                    <PickerAvatar guild={guild} size={36} />
                    <span className="w-full truncate text-center text-[9px] font-bold text-white/75">{guild.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
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
  const { dict } = useClientI18n();
  const t = dict.guildPage;
  const [tab, setTab] = useState<'server' | 'discord'>(emojis.length > 0 ? 'server' : 'discord');
  const [query, setQuery] = useState('');
  const STANDARD = ['😀', '😂', '😍', '🤝', '🎉', '⭐', '💎', '🔥', '❤️', '✅', '❌', '⚠️', '💰', '🏆', '📢', '🎫'];
  const filtered = emojis.filter((emoji) => !query.trim() || emoji.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-white/15 bg-[#0b0f1a]/98 p-2 shadow-2xl">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.emojiServerLabel}</span>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab('server')}
          className={`flex-1 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${tab === 'server' ? 'text-neon-blue' : 'text-white/40'}`}
        >
          {t.mdServerEmojis}
        </button>
        <button
          type="button"
          onClick={() => setTab('discord')}
          className={`flex-1 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest ${tab === 'discord' ? 'text-neon-blue' : 'text-white/40'}`}
        >
          {t.mdDiscordEmojis}
        </button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.mdSearch}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-white/25"
      />
      {tab === 'server' ? (
        <div className="mt-1.5 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
          {filtered.length === 0 && <p className="col-span-8 text-[10px] text-white/35">{t.emojiServerEmpty}</p>}
          {filtered.map((e) => (
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
      ) : (
        <div className="mt-1.5 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
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
      )}
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
  const { dict } = useClientI18n();
  const t = dict.guildPage;
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
        title={t.emojiInsert}
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
  const { dict } = useClientI18n();
  const t = dict.guildPage;
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
          title={t.emojiInsert}
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
  options: ListOption[];
  placeholder?: string;
}) {
  const { dict } = useClientI18n();
  const t = dict.guildPage;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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

  const filtered = options.filter(
    (opt) => !query.trim() || opt.label.toLowerCase().includes(query.trim().toLowerCase()),
  );


  return (
    <div ref={boxRef} className="relative flex gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${FIELD_CLS} flex min-h-[34px] flex-1 flex-wrap items-center gap-1 text-left`}
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
      {values.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-lg border border-white/10 px-2 text-[10px] text-white/40 transition hover:border-rose-400/40 hover:text-rose-200"
          title={t.multiSelectClear}
        >
          ✕
        </button>
      )}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#0b0f1a]/98 p-1.5 shadow-2xl">
          <label className="mb-1 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
            <Icon name="search" size={11} className="shrink-0 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.mdSearch}
              className="min-w-0 flex-1 bg-transparent text-[10px] text-white outline-none placeholder:text-white/25"
            />
          </label>
          {filtered.length === 0 && <p className="p-2 text-[10px] text-white/35">{t.multiSelectEmpty}</p>}
          {filtered.map((opt) => (
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
              <Icon name={optionIcon(opt)} size={12} className="shrink-0 text-white/40" />
              <span className="min-w-0 flex-1 truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
