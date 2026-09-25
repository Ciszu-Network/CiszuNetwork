'use client';

import { useState } from 'react';
import { Icon } from '@ciszu/ui';
import type { SwatchGroup } from './content';

interface BrandSwatchesProps {
  groups: SwatchGroup[];
  labels: {
    copy: string;
    copied: string;
  };
}

function SwatchCard({
  token,
  hex,
  note,
  copyLabel,
  copiedLabel,
}: {
  token: string;
  hex: string;
  note: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${copyLabel}: ${token} ${hex}`}
      title={copied ? copiedLabel : copyLabel}
      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40 hover:shadow-[0_0_18px_rgba(0,212,255,0.15)] active:scale-[0.98] cursor-pointer"
    >
      <span
        className="h-12 w-12 shrink-0 rounded-xl border border-border"
        style={{ backgroundColor: hex }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-header text-sm font-bold text-ink">{token}</span>
        <span className="block truncate font-mono text-xs text-muted">{hex}</span>
        {note ? <span className="block truncate text-[10px] text-faint">{note}</span> : null}
      </span>
      <span className={`shrink-0 transition-colors ${copied ? 'text-green-400' : 'text-faint group-hover:text-neon-blue'}`}>
        <Icon name={copied ? 'check' : 'copy'} size={16} />
      </span>
    </button>
  );
}

export default function BrandSwatches({ groups, labels }: BrandSwatchesProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="font-header text-sm font-black uppercase tracking-[0.2em] text-ink">
            {group.title}
          </h3>
          <p className="mb-4 mt-1 text-xs text-muted">{group.body}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.swatches.map((swatch) => (
              <SwatchCard
                key={`${group.title}-${swatch.token}-${swatch.hex}`}
                token={swatch.token}
                hex={swatch.hex}
                note={swatch.note}
                copyLabel={labels.copy}
                copiedLabel={labels.copied}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
