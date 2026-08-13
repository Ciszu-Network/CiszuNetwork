'use client';

import { useState } from 'react';
import { ArrowRight, Bug } from 'lucide-react';
import { openSentryFeedback } from '@/lib/sentry';
import { CISZU_NETWORK } from '@/config/site';

interface FeedbackFormProps {
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeedbackForm({ email }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanFrom = from.trim();
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError('El mensaje no puede estar vacío.');
      return;
    }
    if (cleanFrom && !EMAIL_RE.test(cleanFrom)) {
      setError('Introduce un email válido o deja el campo vacío.');
      return;
    }

    setError(null);

    const subject = encodeURIComponent(`[Feedback] ${CISZU_NETWORK.name} — ${cleanName || 'Anónimo'}`);
    const body = encodeURIComponent(
      [
        `Nombre: ${cleanName || 'Anónimo'}`,
        cleanFrom ? `Email: ${cleanFrom}` : '',
        '',
        `Mensaje:`,
        cleanMessage,
      ]
        .filter((l) => l !== '')
        .join('\n')
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const reportIssue = () => {
    void openSentryFeedback();
  };

  const inputCls =
    'w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-brand-light rounded-xl text-white placeholder:text-gray-600 outline-none text-sm transition-all font-header font-bold';

  return (
    <div className="space-y-6">
      <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/10 to-transparent border border-brand/30">
        {sent && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-brand/20 text-brand-light text-sm font-header font-bold">
            Se abrió tu cliente de correo. Si no se abrió, envíanos un mensaje directo a{' '}
            <a href={`mailto:${email}`} className="underline underline-offset-2 hover:text-white">
              {email}
            </a>
            .
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Opcional"
                className={inputCls}
                maxLength={80}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Opcional — para responderte"
                className={inputCls}
                maxLength={120}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
              Mensaje <span className="text-brand-light">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos qué opinas, qué falla o qué te gustaría ver…"
              rows={6}
              required
              className={inputCls + ' resize-y'}
              maxLength={4000}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(35,63,146,0.3)]"
            >
              Enviar Feedback <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={reportIssue}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/10 hover:scale-105 transition-all text-sm uppercase tracking-widest"
            >
              Reportar un problema <Bug className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            El formulario abre tu cliente de correo con el mensaje listo hacia {email}.
            &nbsp;El botón &ldquo;Reportar un problema&rdquo; abre el widget seguro de{' '}
            {CISZU_NETWORK.name} (Sentry) para errores técnicos.
          </p>
        </form>
      </div>
    </div>
  );
}