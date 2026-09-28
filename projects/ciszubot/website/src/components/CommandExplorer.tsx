'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon, Modal } from '@ciszu/ui';
import {
  COMMANDS,
  CATEGORIES,
  CATEGORY_ICONS,
  commandAccent,
  categoryColor,
  commandRef,
  relatedCommands,
  usageExample,
  type CommandInfo,
  type CommandCategory,
} from '@/data/commands';
import type { Dict } from '@/lib/i18n';

interface CommandExplorerProps {
  dict: Dict;
  prefix: string;
}

/**
 * Explorador de comandos de CiszuBot.
 *
 * Cada comando tiene su PROPIA identidad de color, se agrupa por categoría y
 * cada tarjeta abre un subpanel con la sintaxis correcta, un ejemplo, los alias
 * y los comandos relacionados (mismo patrón que los certificados de Ciszuko
 * Antony).
 */
export default function CommandExplorer({ dict, prefix }: CommandExplorerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<CommandInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = COMMANDS.filter((cmd: CommandInfo) => {
    const matchesCat = category === 'all' || cmd.category === category;
    const matchesQuery =
      !q ||
      cmd.name.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    icon: CATEGORY_ICONS[cat],
    color: categoryColor(cat),
    commands: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.commands.length > 0);

  const catLabel = (cat: string) =>
    dict.commandsSection.categories[cat as CommandCategory] ?? cat;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div>
      {/* Buscador */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-faint">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.commandsPage.search}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-ink placeholder:text-faint focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
          />
        </div>
      </div>

      {/* Filtros por categoría, cada uno con su color */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setCategory('all')}
          style={
            category === 'all'
              ? { borderColor: 'rgb(96 165 250 / 0.5)', background: 'rgb(96 165 250 / 0.14)', color: '#60a5fa' }
              : undefined
          }
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            category === 'all'
              ? ''
              : 'border-border text-muted hover:text-ink hover:border-brand-400/40'
          }`}
        >
          {dict.commandsPage.all}
        </button>
        {CATEGORIES.map((cat) => {
          const color = categoryColor(cat);
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={active ? { borderColor: `${color}80`, background: `${color}22`, color } : undefined}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                active ? '' : 'border-border text-muted hover:text-ink hover:border-brand-400/40'
              }`}
            >
              <Icon name={CATEGORY_ICONS[cat]} size={14} />
              {catLabel(cat)}
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Icon name="search" size={32} className="mx-auto mb-4 text-faint" />
          {dict.commandsPage.noResults.replace('{q}', query)}
        </div>
      ) : (
        grouped.map(({ category: cat, icon, color, commands }) => (
          <div key={cat} className="mb-12">
            <h3 className="font-semibold uppercase tracking-widest text-sm mb-4 flex items-center gap-3 text-ink">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border"
                style={{ background: `${color}1f`, borderColor: `${color}55`, color }}
              >
                <Icon name={icon} size={16} />
              </span>
              {catLabel(cat)}
              <span className="w-px h-4 bg-border" />
              <span className="text-faint text-xs">{commands.length}</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commands.map((cmd, index) => {
                const accent = commandAccent(cmd);
                return (
                  <motion.button
                    key={cmd.name}
                    type="button"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.28, delay: Math.min(index * 0.02, 0.25) }}
                    onClick={() => setSelected(cmd)}
                    style={{ borderColor: `${accent}44` }}
                    className="group relative text-left soft-card rounded-2xl p-5 border hover:-translate-y-1 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] transition-all cursor-pointer overflow-hidden"
                  >
                    <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <code
                        className="text-sm font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ color: accent, background: `${accent}1a`, borderColor: `${accent}55` }}
                      >
                        {prefix}
                        {cmd.name}
                      </code>
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ background: `${accent}1a`, color: accent }}
                      >
                        <Icon name={cmd.icon} style={cmd.icon === 'server' ? 'filled' : 'outline'} size={16} />
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-3 line-clamp-2">{cmd.description}</p>
                    <p className="text-xs text-faint font-medium">
                      {dict.commandsSection.usage}:{' '}
                      <code className="text-ink bg-card border border-border px-1.5 py-0.5 rounded">{cmd.usage}</code>
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border"
                        style={{ color, background: `${color}14`, borderColor: `${color}55` }}
                      >
                        <Icon name={icon} size={11} />
                        {catLabel(cmd.category)}
                      </span>
                      <span className="font-mono text-[10px] text-faint bg-card border border-border rounded-md px-1.5 py-0.5">
                        {commandRef(cmd)}
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-faint opacity-0 group-hover:opacity-100 transition-opacity">
                        {dict.commandsPage.detailCta} →
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Subpanel de detalle */}
      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${prefix}${selected.name}` : ''}
        description={selected ? `${catLabel(selected.category)} · ${commandRef(selected)}` : undefined}
        size="lg"
        className="max-h-[88vh] overflow-y-auto"
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{
                  color: categoryColor(selected.category),
                  background: `${categoryColor(selected.category)}1a`,
                  borderColor: `${categoryColor(selected.category)}55`,
                }}
              >
                <Icon name={CATEGORY_ICONS[selected.category]} size={12} />
                {catLabel(selected.category)}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{
                  color: commandAccent(selected),
                  background: `${commandAccent(selected)}1a`,
                  borderColor: `${commandAccent(selected)}55`,
                }}
              >
                <Icon name={selected.icon} style={selected.icon === 'server' ? 'filled' : 'outline'} size={12} />
                {dict.commandsSection.usage}
              </span>
              <span className="font-mono text-[10px] text-faint bg-card border border-border rounded-md px-2 py-1">
                {commandRef(selected)}
              </span>
            </div>

            <p className="text-sm text-muted leading-relaxed">{selected.description}</p>

            {/* Sintaxis correcta */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-faint mb-2">
                {dict.commandsPage.syntax}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-semibold text-ink break-all">{selected.usage}</code>
                <button
                  type="button"
                  onClick={() => copy(selected.usage, 'usage')}
                  className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-border text-muted hover:text-ink hover:border-brand-400/40 transition-all"
                >
                  <Icon name="copy" size={12} />
                  {copied === 'usage' ? dict.commandsPage.copied : dict.commandsPage.copy}
                </button>
              </div>
              <p className="text-[11px] text-faint mt-3 leading-relaxed">{dict.commandsPage.syntaxLegend}</p>
              <div className="mt-3 rounded-lg bg-surface border border-border p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-faint mb-1">
                  {dict.commandsPage.example}
                </p>
                <code className="text-sm text-ink break-all">{usageExample(selected.usage)}</code>
              </div>
            </div>

            {/* Alias */}
            {selected.aliases.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-faint">
                    {dict.commandsSection.aliases} ({selected.aliases.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(selected.aliases.join(', '), 'aliases')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-border text-muted hover:text-ink hover:border-brand-400/40 transition-all"
                  >
                    <Icon name="copy" size={12} />
                    {copied === 'aliases' ? dict.commandsPage.copied : dict.commandsPage.copy}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.aliases.map((a) => (
                    <code key={a} className="text-xs text-muted bg-card border border-border px-2 py-0.5 rounded-md">
                      {prefix}
                      {a}
                    </code>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-[11px] text-faint">
              {dict.commandsPage.slashLabel}:{' '}
              <code className="text-ink bg-card border border-border px-1.5 py-0.5 rounded">/{selected.name}</code>
            </p>

            {/* Relacionados */}
            {(() => {
              const related = relatedCommands(selected, 4);
              if (related.length === 0) return null;
              return (
                <div className="border-t border-border pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-faint mb-3">
                    {dict.commandsPage.related}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {related.map((rel) => {
                      const relColor = commandAccent(rel);
                      return (
                        <button
                          key={rel.name}
                          type="button"
                          onClick={() => setSelected(rel)}
                          style={{ borderColor: `${relColor}55` }}
                          className="text-left px-3 py-2 rounded-xl border bg-card hover:-translate-y-0.5 transition-all"
                        >
                          <span className="block text-xs font-bold" style={{ color: relColor }}>
                            {prefix}
                            {rel.name}
                          </span>
                          <span className="block text-[10px] text-faint mt-0.5 max-w-[200px] truncate">
                            {rel.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
