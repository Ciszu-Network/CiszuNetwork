// Política de contraseña oficial CISZU ID (ver LOGIN_REGISTER_PROTOCOLS §8).
// Barra de 5 segmentos: 8+ chars, 12+ chars, mayúscula, minúscula, número+símbolo.
// Nivel mínimo aceptable para CISZU ID: "Media" (3/5).

export interface PasswordCriteria {
  code: 'length8' | 'length12' | 'upper' | 'lower' | 'symbol';
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0-5 segmentos cumplidos
  level: 'empty' | 'very-weak' | 'weak' | 'medium' | 'strong';
  label: string;
  barColor: string;
  textColor: string;
  acceptableMinimumMet: boolean; // score >= 3
  criteria: PasswordCriteria[];
}

export const MIN_ACCEPTABLE_SCORE = 3;
export const MAX_SCORE = 5;

export function evaluatePassword(pass: string): PasswordStrengthResult {
  if (!pass) {
    return {
      score: 0,
      level: 'empty',
      label: '',
      barColor: 'bg-gray-700',
      textColor: 'text-gray-500',
      acceptableMinimumMet: false,
      criteria: buildCriteria(pass),
    };
  }

  const criteria = buildCriteria(pass);
  const score = criteria.filter((c) => c.met).length;

  let level: PasswordStrengthResult['level'] = 'very-weak';
  let label = 'Muy Débil';
  let barColor = 'bg-red-500';
  let textColor = 'text-red-400';

  if (score >= 4) {
    level = 'strong';
    label = 'Fuerte';
    barColor = 'bg-neon-cyan';
    textColor = 'text-neon-cyan';
  } else if (score === 3) {
    level = 'medium';
    label = 'Media';
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  } else if (score >= 1) {
    level = 'weak';
    label = 'Débil';
    barColor = 'bg-red-400';
    textColor = 'text-red-400';
  }

  return {
    score,
    level,
    label,
    barColor,
    textColor,
    acceptableMinimumMet: score >= MIN_ACCEPTABLE_SCORE,
    criteria,
  };
}

function buildCriteria(pass: string): PasswordCriteria[] {
  return [
    { code: 'length8', label: 'Mínimo 8 caracteres', met: pass.length >= 8 },
    { code: 'length12', label: 'Mínimo 12 caracteres', met: pass.length >= 12 },
    { code: 'upper', label: 'Al menos 1 mayúscula', met: /[A-Z]/.test(pass) },
    { code: 'lower', label: 'Al menos 1 minúscula', met: /[a-z]/.test(pass) },
    { code: 'symbol', label: 'Al menos 1 número y 1 símbolo', met: /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass) },
  ];
}

export function passwordMeetsMinimum(pass: string): boolean {
  return evaluatePassword(pass).acceptableMinimumMet;
}