'use client';

import { useRef, useState } from 'react';
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

/**
 * Render mínimo del Markdown de Discord (sobre texto YA escapado):
 * **negrita**, *itálica*, __subrayado__, ~~tachado~~, ||spoiler|| y `código`.
 */
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
  out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  out = out.replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, '$1<em>$2</em>');
  return out.replace(/\n/g, '<br/>');
}

const btn =
  'inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2 text-[11px] font-black text-white/75 transition hover:border-neon-blue/60 hover:text-white';

const inputCls =
  'w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-neon-blue';

/**
 * Campo de mensaje con formato Markdown de Discord: barra de estilos,
 * variables del bot ({user} {guild} {members}) y vista previa en vivo.
 */
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

  return (
    <div className="block">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white/85">{label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => wrap('**')} className={btn} title={labels.bold}>
            B
          </button>
          <button type="button" onClick={() => wrap('*')} className={`${btn} italic`} title={labels.italic}>
            I
          </button>
          <button type="button" onClick={() => wrap('__')} className={`${btn} underline`} title={labels.underline}>
            U
          </button>
          <button type="button" onClick={() => wrap('~~')} className={btn} title={labels.spoiler}>
            S
          </button>
          <button type="button" onClick={() => wrap('`')} className={`${btn} font-mono`} title={labels.code}>
            {'</>'}
          </button>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={`${btn} ${preview ? 'border-neon-blue/60 text-neon-blue' : ''}`}
          >
            {preview ? labels.edit : labels.preview}
          </button>
        </div>
      </div>
      {preview ? (
        <div
          className="min-h-[72px] w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm leading-relaxed text-white"
          dangerouslySetInnerHTML={{ __html: renderDiscordMarkdown(value) }}
        />
      ) : (
        <textarea
          ref={ref}
          rows={3}
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {hint && <span className="text-xs text-white/45">{hint}</span>}
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
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {emojis.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) wrap(e.target.value, '');
              }}
              className="max-w-40 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-[10px] text-white/70"
            >
              <option value="">{labels.emoji}</option>
              {emojis.map((e) => (
                <option key={e.id} value={`<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`}>
                  :{e.name}:
                </option>
              ))}
            </select>
          )}
          {roles.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) wrap(`<@&${e.target.value}>`, '');
              }}
              className="max-w-40 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-[10px] text-white/70"
            >
              <option value="">Rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
          {channels.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) wrap(`<#${e.target.value}>`, '');
              }}
              className="max-w-40 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-[10px] text-white/70"
            >
              <option value="">Canal</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
