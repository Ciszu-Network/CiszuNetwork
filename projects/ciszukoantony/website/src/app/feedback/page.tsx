'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';
import { attachFeedback } from '@/lib/feedback';
import { FabRestore } from '@ciszu/ui';

const FEEDBACK_EMAIL = 'fplayersoffcial@gmail.com';

export default function FeedbackPage() {
  usePageTitle('FEEDBACK');

  const reportBtnRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [reportUnavailable, setReportUnavailable] = useState(false);

  useEffect(() => {
    return attachFeedback(reportBtnRef.current, () => setReportUnavailable(true));
  }, []);

  const validate = (): boolean => {
    const next: { email?: string; message?: string } = {};
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Por favor introduce un email válido (o deja el campo vacío).';
    }
    if (!form.message.trim()) {
      next.message = 'El mensaje es obligatorio.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = name ? `Feedback — ${name}` : 'Feedback';
    const body = [
      form.message.trim(),
      '',
      '—',
      `Nombre: ${name || 'No especificado'}`,
      `Email: ${email || 'No especificado'}`,
      `Página: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].join('\n');
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-neon-blue outline-none text-white placeholder:text-gray-600 text-sm font-header font-bold transition-all';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Feedback
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Help us improve Ciszuko Network</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-white/5 border border-white/10 mb-10"
        >
          <h2 className="text-2xl font-header font-bold text-white mb-3 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {sent ? '¡Gracias por tu feedback!' : 'Envía tu feedback'}
          </h2>
          {sent ? (
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                Se abrió tu programa de correo con el mensaje preparado. Si no se abrió,
                puedes escribirnos directamente a{' '}
                <a href={`mailto:${FEEDBACK_EMAIL}`} className="text-brand font-bold hover:text-brand-200 transition-colors">
                  {FEEDBACK_EMAIL}
                </a>
                .
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', message: '' });
                  setErrors({});
                }}
                className="px-6 py-2.5 rounded-xl bg-neon-blue/20 border border-neon-blue/40 text-neon-blue font-header font-bold text-sm hover:bg-neon-blue hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fb-name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Nombre <span className="text-gray-600 normal-case">(opcional)</span>
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Tu nombre"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="fb-email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Email <span className="text-gray-600 normal-case">(opcional)</span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="tucorreo@ejemplo.com"
                    className={inputCls}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400 font-bold">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="fb-message" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Mensaje <span className="text-brand">*</span>
                </label>
                <textarea
                  id="fb-message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Cuéntanos qué ocurrió, qué te gustaría ver o cualquier sugerencia…"
                  className={`${inputCls} resize-y`}
                />
                {errors.message && <p className="mt-1.5 text-xs text-red-400 font-bold">{errors.message}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white font-header font-bold text-sm shadow-[0_0_25px_rgba(61,106,223,0.4)] hover:shadow-[0_0_35px_rgba(61,106,223,0.6)] transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  Enviar feedback
                </button>
                <span className="text-xs text-gray-600">Se abrirá tu cliente de correo para el envío.</span>
              </div>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h2 className="text-lg font-header font-bold text-white mb-2 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Reportar un problema
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            ¿Encontraste un error técnico o algo no funciona como debería? Puedes abrir el
            reporte directo de Sentry (incluye detalles del navegador y pantalla).
          </p>
          <button
            ref={reportBtnRef}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/40 text-neon-pink font-header font-bold text-sm hover:bg-neon-pink/20 hover:border-neon-pink hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Abrir el reporte de problemas
          </button>
          {reportUnavailable && (
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              El reporte directo no está disponible ahora (Sentry no está configurado en esta
              compilación). Usa el formulario de arriba o escríbenos a{' '}
              <a href={`mailto:${FEEDBACK_EMAIL}`} className="text-brand font-bold hover:text-brand-200 transition-colors">
                {FEEDBACK_EMAIL}
              </a>
              .
            </p>
          )}
          <div className="mt-6 pt-6 border-t border-white/5">
            <Link href="/descargas" className="text-sm text-brand hover:text-brand-200 transition-colors">
              Ver cómo instalar Ciszuko Antony como app (PDWA) →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-white font-header font-bold text-sm mb-1">¿Cerraste el botón flotante?</p>
            <p className="text-gray-500 text-xs">Los botones de instalación y feedback de abajo a la izquierda se pueden volver a mostrar cuando quieras.</p>
          </div>
          <FabRestore accent="#a78bfa" keys={['ciszu-feedback-dismissed']} />
        </motion.div>
      </div>
    </div>
  );
}