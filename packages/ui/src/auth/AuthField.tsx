'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export interface AuthFieldProps {
  label: string;
  name: string;
  icon?: ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  isOptional?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error?: string;
  requirements?: string[];
  inputClassName?: string;
  enableAutocomplete?: boolean; // permite autocompletado de gestores (por defecto true)
  allowPaste?: boolean; // false bloquea pegado (contraseñas); resto true
}

// Campo de auth CISZU ID (LOGIN_REGISTER_PROTOCOLS §7): placeholder interno,
// marcado de requerido/opcional, botón de requisitos por campo, contador de
// caracteres y error alineado a la izquierda (no centrado).
export function AuthField({
  label,
  name,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  isOptional = false,
  maxLength,
  autoComplete,
  error,
  requirements,
  inputClassName = '',
  enableAutocomplete = true,
  allowPaste = true,
}: AuthFieldProps) {
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <div className="space-y-1.5 relative">
      <div className="flex items-center justify-between ml-1">
        <div className="flex items-center gap-2">
          {icon && (
            <span className={required ? 'w-3 h-3 text-red-500 flex items-center justify-center' : 'w-3 h-3 text-white/60 flex items-center justify-center'}>
              {icon}
            </span>
          )}
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {label} {required && <span className="text-red-500">*</span>}
            {isOptional && <span className="text-gray-600 text-[8px] ml-1">(Opcional)</span>}
          </label>
          {requirements && requirements.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRequirements((v) => !v)}
              aria-label={`Requisitos de ${label}`}
              title="Ver requisitos"
              className={`w-4 h-4 rounded-full border text-[9px] font-black leading-none flex items-center justify-center transition-all ${
                showRequirements
                  ? 'bg-cyan-500 border-cyan-500 text-black'
                  : 'border-white/25 text-white/50 hover:text-white hover:border-white/60'
              }`}
            >
              ?
            </button>
          )}
        </div>
        {maxLength && (
          <span className={`text-[9px] font-bold ${value.length >= maxLength ? 'text-red-400' : 'text-gray-600'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete={enableAutocomplete ? autoComplete : 'off'}
        onPaste={allowPaste ? undefined : (e) => e.preventDefault()}
        aria-invalid={Boolean(error)}
        className={`w-full bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-5 py-4 text-white font-header font-bold placeholder:text-gray-700 focus:border-cyan-400/60 transition-all outline-none [color-scheme:dark] ${inputClassName}`}
      />

      {showRequirements && requirements && requirements.length > 0 && (
        <div className="mt-1.5 ml-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2">
          {requirements.map((r) => (
            <div key={r} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-[10px] font-bold mt-1 ml-2">{error}</p>}
    </div>
  );
}

export default AuthField;