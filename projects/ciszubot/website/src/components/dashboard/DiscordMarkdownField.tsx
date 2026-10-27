'use client';

import { useMemo, useRef, useState } from 'react';
import type { GuildEmoji } from '@/lib/discordGuild';

export interface DiscordMarkdownLabels {
  bold: string;
  italic: string;
  underline: string;
  spoiler: string;
  code: string;
  preview: string;
  edit: string;
  vars: string;
  emoji: string;
  quote: string;
  role: string;
  channel: string;
  serverEmojis: string;
  discordEmojis: string;
  search: string;
}

interface Props {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  labels: DiscordMarkdownLabels;
  variables?: string[];
  emojis?: GuildEmoji[];
  roles?: { id: string; label: string }[];
  channels?: { id: string; label: string }[];
}

/** Escapa HTML antes de aplicar el mini-render de Markdown de Discord. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render mínimo del Markdown de Discord (sobre texto YA escapado). */
export function renderDiscordMarkdown(raw: string): string {
  let out = escapeHtml(raw);
  out = out.replace(/`([^`\n]+)`/g, '<code class="rounded bg-white/10 px-1 py-0.5 text-[12px]">$1</code>');
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_\n]+)__/g, '<u>$1</u>');
  out = out.replace(/~~([^~\n]+)~~/g, '<s>$1</s>');
  out = out.replace(
    /\|\|([^|\n]+)\|\|/g,
    '<span class="rounded bg-black/70 text-transparent transition hover:text-inherit">$1</span>',
  );
  out = out.replace(/^&gt;\s?(.*)$/gm, '<span class="block border-l-2 border-neon-blue/60 pl-2 text-white/60">$1</span>');
  out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  out = out.replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1<em>$2</em>');
  return out.replace(/\n/g, '<br/>');
}

const STANDARD_EMOJIS = [
  '😀', '😂', '😍', '🤝', '🎉', '⭐', '💎', '🔥', '❤️', '✅', '❌', '⚠️', '💰', '🏆', '📢', '🎫',
  '😎', '🤔', '😭', '😡', '👍', '👎', '👏', '🙏', '💀', '👀', '🧠', '⚡', '🌈', '🎵', '🎮', '🚀',
];

const ROLE_COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee'];
const CHANNEL_COLORS = ['#38bdf8', '#4ade80', '#facc15', '#fb923c', '#c084fc', '#f472b6'];

const btn =
  'inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2 text-[11px] font-black text-white/75 transition hover:border-neon-blue/60 hover:text-white';

const inputCls =
  'w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-neon-blue placeholder:text-white/25';

export default function DiscordMarkdownField({
  label,
  hint,
  value,
  onChange,
  labels,
  variables = ['{user}', '{guild}', '{members}'],
  emojis = [],
  roles = [],
  channels = [],
}: Props) {
  const [preview, setPreview] = useState(false);
  const [menu, setMenu] = useState<'emoji' | 'role' | 'channel' | null>(null);
  const [emojiTab, setEmojiTab] = useState<'server' | 'discord'>('server');
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const wrap = (before: string, after: string = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
    });
  };

  const insert = (text: string) => {
    wrap(text, '');
    setMenu(null);
    setQuery('');
  };

  const filteredEmojis = useMemo(() => {
    const term = query.trim().toLowerCase();
    return emojis.filter((emoji) => !term || emoji.name.toLowerCase().includes(term));
  }, [emojis, query]);
  const filteredRoles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return roles.filter((role) => !term || role.label.toLowerCase().includes(term));
  }, [roles, query]);
  const filteredChannels = useMemo(() => {
    const term = query.trim().toLowerCase();
    return channels.filter((channel) => !term || channel.label.toLowerCase().includes(term));
  }, [channels, query]);

  const toggleMenu = (next: 'emoji' | 'role' | 'channel') => {
    setMenu((current) => (current === next ? null : next));
    setQuery('');
    if (next === 'emoji') setEmojiTab(emojis.length > 0 ? 'server' : 'discord');
  };

  const popover = 'absolute bottom-full right-0 z-50 mb-2 w-72 overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f1a]/98 shadow-2xl';

  return (
    <div className="block">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white/85">{label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => wrap('**')} className={btn} title={labels.bold}>B</button>
          <button type="button" onClick={() => wrap('*')} className={`${btn} italic`} title={labels.italic}>I</button>
          <button type="button" onClick={() => wrap('__')} className={`${btn} underline`} title={labels.underline}>U</button>
          <button type="button" onClick={() => wrap('~~')} className={btn} title={labels.spoiler}>S</button>
          <button type="button" onClick={() => wrap('> ', '')} className={btn} title={labels.quote}>❝</button>
          <button type="button" onClick={() => wrap('`')} className={`${btn} font-mono`} title={labels.code}>{'</>'}</button>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={`${btn} ${preview ? 'border-neon-blue/60 text-neon-blue' : ''}`}
          >
            {preview ? labels.edit : labels.preview}
          </button>
        </div>
      </div>

      <div className="relative">
        {preview ? (
          <div
            className="min-h-[96px] w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm leading-relaxed text-white"
            dangerouslySetInnerHTML={{ __html: renderDiscordMarkdown(value) }}
          />
        ) : (
          <textarea
            ref={ref}
            rows={4}
            className={inputCls}
            value={value}
            placeholder={hint ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {variables.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => wrap(v, '')}
            className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60 transition hover:border-neon-blue/60 hover:text-white"
          >
            {v}
          </button>
        ))}
        <span className="text-[10px] text-white/35">{labels.vars}</span>
      </div>

      {(emojis.length > 0 || roles.length > 0 || channels.length > 0) && (
        <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
          {emojis.length > 0 && (
            <button type="button" onClick={() => toggleMenu('emoji')} className={btn} title={labels.emoji}>😊</button>
          )}
          {roles.length > 0 && (
            <button type="button" onClick={() => toggleMenu('role')} className={btn} title={labels.role}>@</button>
          )}
          {channels.length > 0 && (
            <button type="button" onClick={() => toggleMenu('channel')} className={btn} title={labels.channel}>#</button>
          )}

          {menu === 'emoji' && (
            <div className={popover}>
              <div className="flex border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setEmojiTab('server')}
                  className={`flex-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest ${emojiTab === 'server' ? 'text-neon-blue' : 'text-white/40'}`}
                >
                  {labels.serverEmojis}
                </button>
                <button
                  type="button"
                  onClick={() => setEmojiTab('discord')}
                  className={`flex-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest ${emojiTab === 'discord' ? 'text-neon-blue' : 'text-white/40'}`}
                >
                  {labels.discordEmojis}
                </button>
              </div>
              <div className="p-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.search}
                  className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] text-white outline-none placeholder:text-white/25"
                />
                {emojiTab === 'server' ? (
                  <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto">
                    {filteredEmojis.length === 0 && <p className="col-span-8 p-2 text-center text-[10px] text-white/35">—</p>}
                    {filteredEmojis.map((emoji) => (
                      <button
                        key={emoji.id}
                        type="button"
                        onClick={() => insert(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
                        title={`:${emoji.name}:`}
                      >
                        <img
                          src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=32`}
                          alt={emoji.name}
                          className="h-5 w-5"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto">
                    {STANDARD_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insert(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {menu === 'role' && (
            <div className={popover}>
              <div className="p-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.search}
                  className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] text-white outline-none placeholder:text-white/25"
                />
                <div className="grid max-h-48 gap-1 overflow-y-auto">
                  {filteredRoles.map((role, index) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => insert(`<@&${role.id}>`)}
                      className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] font-bold transition hover:bg-white/5"
                      style={{ borderColor: `${ROLE_COLORS[index % ROLE_COLORS.length]}55`, color: ROLE_COLORS[index % ROLE_COLORS.length] }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: ROLE_COLORS[index % ROLE_COLORS.length] }} />
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {menu === 'channel' && (
            <div className={popover}>
              <div className="p-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.search}
                  className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] text-white outline-none placeholder:text-white/25"
                />
                <div className="grid max-h-48 gap-1 overflow-y-auto">
                  {filteredChannels.map((channel, index) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => insert(`<#${channel.id}>`)}
                      className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] font-bold transition hover:bg-white/5"
                      style={{ borderColor: `${CHANNEL_COLORS[index % CHANNEL_COLORS.length]}55`, color: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }} />
                      #{channel.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
