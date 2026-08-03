'use client';

import { useState } from 'react';
import { Icon } from '@ciszu/ui';
import { COMMANDS, CATEGORIES, CATEGORY_ICONS, type CommandInfo } from '@/data/commands';
import type { Dict } from '@/lib/i18n';

interface CommandExplorerProps {
  dict: Dict;
  prefix: string;
}

export default function CommandExplorer({ dict, prefix }: CommandExplorerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

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
    commands: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.commands.length > 0);

  return (
    <div>
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

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            category === 'all'
              ? 'bg-brand-400/15 border-brand-400/40 text-brand-600 dark:text-brand-300'
              : 'border-border text-muted hover:text-ink hover:border-brand-400/40'
          }`}
        >
          {dict.commandsPage.all}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === cat
                ? 'bg-violet-400/15 border-violet-400/40 text-violet-500 dark:text-violet-300'
                : 'border-border text-muted hover:text-ink hover:border-violet-400/40'
            }`}
          >
            <Icon name={CATEGORY_ICONS[cat]} size={14} />
            {dict.commandsSection.categories[cat]}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Icon name="search" size={32} className="mx-auto mb-4 text-faint" />
          {dict.commandsPage.noResults.replace('{q}', query)}
        </div>
      ) : (
        grouped.map(({ category: cat, icon, commands }) => (
          <div key={cat} className="mb-10">
            <h3 className="font-semibold uppercase tracking-widest text-sm mb-4 flex items-center gap-3 text-ink">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-400/12 text-brand-600 dark:text-brand-300">
                <Icon name={icon} size={16} />
              </span>
              {dict.commandsSection.categories[cat]}
              <span className="w-px h-4 bg-border" />
              <span className="text-faint text-xs">{commands.length}</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commands.map((cmd) => (
                <div key={cmd.name} className="soft-card rounded-2xl p-5 hover-card">
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-sm font-semibold text-brand-600 dark:text-brand-300 bg-brand-400/10 px-2.5 py-1 rounded-lg border border-brand-400/25">
                      {prefix}{cmd.name}
                    </code>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-400/12 text-violet-500 dark:text-violet-300">
                      <Icon name={cmd.icon} style={cmd.icon === 'server' ? 'filled' : 'outline'} size={16} />
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">{cmd.description}</p>
                  <p className="text-xs text-faint font-medium">
                    {dict.commandsSection.usage}: <code className="text-ink bg-card border border-border px-1.5 py-0.5 rounded">{cmd.usage}</code>
                  </p>
                  {cmd.aliases.length > 0 && (
                    <p className="text-xs text-faint mt-2">
                      {dict.commandsSection.aliases}: {cmd.aliases.slice(0, 4).map((a) => (
                        <code key={a} className="bg-card border border-border px-1 py-0.5 rounded mr-1">{a}</code>
                      ))}
                      {cmd.aliases.length > 4 && <span className="text-faint/60">+{cmd.aliases.length - 4}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
