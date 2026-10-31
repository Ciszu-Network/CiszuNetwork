'use client';

import { useMemo, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';
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
  icon?: string;
  value: string;
  onChange: (value: string) => void;
  labels: DiscordMarkdownLabels;
  variables?: string[];
  emojis?: GuildEmoji[];
  roles?: { id: string; label: string }[];
  channels?: { id: string; label: string }[];
  maxLength?: number;
  rows?: number;
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

const EMOJI_CATEGORIES = [
  {
    id: 'all',
    icon: 'menu',
    emojis: [
      '😀', '😂', '😍', '🤝', '🎉', '⭐', '💎', '🔥', '❤️', '✅', '❌', '⚠️', '💰', '🏆', '📢', '🎫',
      '😎', '🤔', '😭', '😡', '👍', '👎', '👏', '🙏', '💀', '👀', '🧠', '⚡', '🌈', '🎵', '🎮', '🚀',
      '😊', '🥰', '😘', '😅', '🤣', '🙃', '😴', '🤯', '🥳', '😤', '🤬', '😱', '🤗', '🤫', '🧐', '🤓',
      '🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐸', '🐙', '🦄', '🌸', '🌻', '🌙', '☀️', '🌊', '🍀',
      '🍕', '🍔', '🍟', '🍣', '🍩', '🍪', '🍫', '☕', '🍺', '🍷', '⚽', '🏀', '🎯', '🎲', '🎸', '🎧',
      '💻', '📱', '🖥️', '📷', '🎁', '🛒', '🔑', '💡', '📌', '📎', '✏️', '📝', '🔔', '🔒', '🔓', '⚙️',
      '💯', '✨', '💫', '💥', '💢', '💤', '💬', '💭', '🕐', '📅', '📍', '🔗', '➡️', '⬅️', '⬆️', '⬇️',
      '🏳️', '🏴', '🏁', '🚩', '🇻🇪', '🇺🇸', '🇪🇸', '🇲🇽', '🇦🇷', '🇨🇴', '🇧🇷', '🇨🇱', '🇵🇪', '🇪🇨', '🇺🇾', '🇵🇾',
    ],
  },
  { id: 'smileys', icon: 'message', emojis: ['😀','😂','😍','😊','🥰','😘','😅','🤣','🙃','😴','🤯','🥳','😤','🤬','😱','🤗','🤫','🧐','🤓','😎','🤔','😭','😡','👍','👎','👏','🙏'] },
  { id: 'people', icon: 'user', emojis: ['👤','👥','🧑','👩','👨','🧒','👶','🧓','👮','🕵️','💂','👷','🤴','👸','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🙋','🙆','🙅','🤷','🤦','💁','🙇'] },
  { id: 'nature', icon: 'heart', emojis: ['🐶','🐱','🦊','🐻','🐼','🐨','🦁','🐸','🐙','🦄','🌸','🌻','🌙','☀️','🌊','🍀','🌲','🌴','🌵','🍄','🌹','🌺','🌼','🌷','⭐','✨','⚡','🔥'] },
  { id: 'food', icon: 'gift', emojis: ['🍕','🍔','🍟','🍣','🍩','🍪','🍫','☕','🍺','🍷','🍎','🍌','🍓','🍉','🍇','🥑','🥕','🌽','🍞','🧀','🍗','🍖','🍤','🍰','🎂','🍿','🥤','🧃'] },
  { id: 'activities', icon: 'gamepad', emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🥊','🎯','🎲','🎮','🕹️','🎸','🎧','🎤','🎬','🎨','🎭','🎪','🎉','🎊','🎁','🏆','🥇','🥈','🥉'] },
  { id: 'objects', icon: 'box-archive', emojis: ['💻','📱','🖥️','📷','🛒','🔑','💡','📌','📎','✏️','📝','🔔','🔒','🔓','⚙️','🛠️','🔧','🔨','🧰','📦','📚','📖','🖊️','📊','📈','📉','🗂️','🗃️'] },
  { id: 'symbols', icon: 'star', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💯','✅','❌','⚠️','💥','💢','💤','💬','💭','🔗','➡️','⬅️','⬆️','⬇️','🔴','🟠','🟡','🟢','🔵'] },
  { id: 'flags', icon: 'globe', emojis: ['🏳️','🏴','🏁','🚩','🇻🇪','🇺🇸','🇪🇸','🇲🇽','🇦🇷','🇨🇴','🇧🇷','🇨🇱','🇵🇪','🇪🇨','🇺🇾','🇵🇾','🇧🇴','🇩🇴','🇵🇦','🇨🇷','🇬🇹','🇭🇳','🇸🇻','🇳🇮','🇨🇺','🇵🇷','🇫🇷','🇩🇪'] },
] as const;

const EmojiFaceIcon = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" />
    <circle cx="9" cy="9.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9.5" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);

const VARIABLE_MEANINGS: Record<string, string> = {
  '{user}': 'Usuario que se une o interactúa',
  '{guild}': 'Nombre del servidor',
  '{members}': 'Cantidad de miembros',
  '{level}': 'Nivel alcanzado',
  '{count}': 'Cantidad total',
  '{inviter}': 'Usuario que invitó',
  '{account}': 'Cuenta de la red social',
  '{platform}': 'Plataforma de la red',
  '{title}': 'Título del contenido',
  '{url}': 'Enlace del contenido',
  '{author}': 'Autor del contenido',
  '{channel}': 'Canal de Discord',
};

const ROLE_COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee'];
const CHANNEL_COLORS = ['#38bdf8', '#4ade80', '#facc15', '#fb923c', '#c084fc', '#f472b6'];

const btn =
  'inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2 text-[11px] font-black text-white/75 transition hover:border-neon-blue/60 hover:text-white';

const inputCls =
  'w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-neon-blue placeholder:text-white/25';

export default function DiscordMarkdownField({
  label,
  hint,
  icon,
  value,
  onChange,
  labels,
  variables = ['{user}', '{guild}', '{members}'],
  emojis = [],
  roles = [],
  channels = [],
  maxLength,
  rows = 4,
}: Props) {
  const [preview, setPreview] = useState(false);
  const [menu, setMenu] = useState<'emoji' | 'role' | 'channel' | null>(null);
  const [emojiTab, setEmojiTab] = useState<'server' | 'discord'>('server');
  const [emojiCategory, setEmojiCategory] = useState('all');
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

  const popover = 'absolute bottom-full right-0 z-50 mb-2 w-80 overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f1a]/98 shadow-2xl';

  return (
    <div className="block">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
          {icon && <Icon name={icon} size={13} className="text-neon-blue" />}
          {label}
        </span>
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
            rows={rows}
            maxLength={maxLength}
            className={inputCls}
            value={value}
            placeholder={hint ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>

      <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-2">
        <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">
          <Icon name="ri-braces" size={10} /> {labels.vars}
        </p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {variables.map((v) => (
            <li key={v} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
              <button
                type="button"
                onClick={() => wrap(v, '')}
                className="font-mono text-[10px] font-bold text-neon-blue transition hover:text-white"
              >
                {v}
              </button>
              <span className="min-w-0 flex-1 truncate text-[9px] text-white/35">{VARIABLE_MEANINGS[v] ?? labels.vars}</span>
              <button
                type="button"
                title={labels.vars}
                onClick={() => void navigator.clipboard?.writeText(v)}
                className="rounded p-0.5 text-white/35 transition hover:text-neon-blue"
              >
                <Icon name="copy" size={10} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {(emojis.length > 0 || roles.length > 0 || channels.length > 0) && (
        <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
          {emojis.length > 0 && (
            <button type="button" onClick={() => toggleMenu('emoji')} className={btn} title={labels.emoji}>
              <EmojiFaceIcon />
            </button>
          )}
          {roles.length > 0 && (
            <button type="button" onClick={() => toggleMenu('role')} className={btn} title={labels.role}>@</button>
          )}
          {channels.length > 0 && (
            <button type="button" onClick={() => toggleMenu('channel')} className={btn} title={labels.channel}>#</button>
          )}

          {menu === 'emoji' && (
            <div className={popover}>
              <div className="flex items-center gap-1 border-b border-white/10 p-1.5">
                <button
                  type="button"
                  onClick={() => setEmojiTab('server')}
                  title={labels.serverEmojis}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${emojiTab === 'server' ? 'bg-neon-blue/15 text-neon-blue' : 'text-white/40 hover:text-white'}`}
                >
                  <Icon name="server" size={13} />
                </button>
                <span className="mx-1 h-4 w-px bg-white/15" />
                {EMOJI_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setEmojiTab('discord');
                      setEmojiCategory(category.id);
                    }}
                    title={category.id}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${emojiTab === 'discord' && emojiCategory === category.id ? 'bg-neon-blue/15 text-neon-blue' : 'text-white/40 hover:text-white'}`}
                  >
                    <Icon name={category.icon} size={13} />
                  </button>
                ))}
              </div>
              <div className="p-2">
                {emojiTab === 'server' && (
                  <label className="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                    <Icon name="search" size={11} className="shrink-0 text-white/35" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={labels.search}
                      className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/25"
                    />
                  </label>
                )}
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
                    {(EMOJI_CATEGORIES.find((category) => category.id === emojiCategory)?.emojis ?? []).map((emoji) => (
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
