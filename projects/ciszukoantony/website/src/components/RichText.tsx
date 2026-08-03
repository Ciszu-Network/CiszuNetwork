import React from 'react';

export type RichPart = { text: string } | { link: string; href: string };

interface RichTextProps {
  parts: RichPart[];
  className?: string;
  linkClassName?: string;
}

export function RichText({ parts, className, linkClassName = 'text-brand hover:text-brand-200 transition-colors' }: RichTextProps) {
  return (
    <p className={className}>
      {parts.map((part, i) =>
        'link' in part ? (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {part.link}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}
