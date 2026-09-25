import React from 'react';

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const CiscoIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a15 15 0 0 1 0 18" />
    <path d="M12 3a15 15 0 0 0 0 18" />
    <path d="M3 12h18" />
  </svg>
);

export const MicrosoftIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
  </svg>
);

export const IbmIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 9.5l7 3.5v6.5l-7-3.5V9.5zm9 10v-6.5l7-3.5v6.5l-7 3.5z"/>
  </svg>
);

export const HpIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M8 9l4-3 4 3M8 15l4 3 4-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const SimpleLearnIcon = ({ className, style }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
