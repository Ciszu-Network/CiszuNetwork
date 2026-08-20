'use client';

import { Fragment } from 'react';
import {
  MAX_SCORE,
  evaluatePassword,
  MIN_ACCEPTABLE_SCORE,
} from './passwordPolicy';

export interface PasswordStrengthBarProps {
  password: string;
}

// Barra de seguridad CISZU ID (LOGIN_REGISTER_PROTOCOLS §8): 5 segmentos,
// colores por nivel, mínimo aceptable "Media" (3/5). Muestra criterios en detalle.
export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const result = evaluatePassword(password);

  if (result.level === 'empty') return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
        {Array.from({ length: MAX_SCORE }, (_, i) => (
          <div
            key={i}
            className={`h-full flex-1 transition-all duration-500 ${
              result.score >= i + 1 ? result.barColor : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
        <span className="text-gray-500">Seguridad:</span>
        <span className={result.textColor}>
          {result.label}
          {!result.acceptableMinimumMet && ' — mínimo exigido'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {result.criteria.map((c) => (
          <div
            key={c.code}
            className={`flex items-center gap-1.5 text-[9px] font-bold ${
              c.met ? 'text-emerald-400' : 'text-gray-600'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={3}>
              {c.met ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <path d="M6 6l12 12M18 6L6 18" />
              )}
            </svg>
            {c.label}
          </div>
        ))}
      </div>
      {!result.acceptableMinimumMet && (
        <p className="text-[9px] text-yellow-500/80 font-bold">
          CISZU ID exige al menos {MIN_ACCEPTABLE_SCORE} de {MAX_SCORE} criterios (nivel
          Media).
        </p>
      )}
    </div>
  );
}

export default PasswordStrengthBar;
export { MIN_ACCEPTABLE_SCORE, MAX_SCORE, evaluatePassword };