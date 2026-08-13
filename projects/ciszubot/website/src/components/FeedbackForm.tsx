'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Icon } from '@ciszu/ui';
import { FEEDBACK_EMAIL } from '@/lib/i18n';

interface FeedbackTexts {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  messageRequired: string;
  emailInvalid: string;
  submit: string;
  submitted: string;
}

interface FeedbackFormProps {
  t: FeedbackTexts;
}

export default function FeedbackForm({ t }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ message?: string; email?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { message?: string; email?: string } = {};
    if (!message.trim()) nextErrors.message = t.messageRequired;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t.emailInvalid;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const subject = encodeURIComponent('Feedback CiszuBot: ' + (name.trim() || 'sin nombre'));
    const body = encodeURIComponent(
      `Nombre: ${name.trim() || '(sin nombre)'}\nEmail: ${email.trim() || '(sin email)'}\n\n${message.trim()}`
    );
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const openSentryReport = async () => {
    try {
      const fb = Sentry.getFeedback();
      if (fb) {
        const form = await fb.createForm();
        form.open();
      }
    } catch {
      /* feedback no disponible */
    }
  };

  if (submitted) {
    return (
      <div className="soft-card rounded-2xl p-8 hover-card text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success/12 text-success mb-4">
          <Icon name="check" size={28} />
        </span>
        <p className="font-bold text-lg text-ink mb-2">{t.submitted}</p>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl bg-card border px-4 py-3 text-sm text-ink placeholder:text-faint transition-colors outline-none';
  const labelCls = 'block text-sm font-semibold text-ink mb-1.5';

  return (
    <div className="soft-card rounded-2xl overflow-hidden">
      {/* Barra superior de la sección */}
      <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
      <form onSubmit={handleSubmit} noValidate className="p-7 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="feedback-name" className={labelCls}>
              {t.name}
            </label>
            <input
              id="feedback-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className={`${inputCls} border-border focus:border-neon-blue/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.2)]`}
            />
          </div>
          <div>
            <label htmlFor="feedback-email" className={labelCls}>
              {t.email}
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className={`${inputCls} border-border focus:border-neon-blue/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.2)] ${
                errors.email ? 'border-danger/60' : ''
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="feedback-message" className={labelCls}>
            {t.message} <span className="text-danger">*</span>
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.messagePlaceholder}
            rows={6}
            className={`${inputCls} resize-y border-border focus:border-neon-blue/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.2)] ${
              errors.message ? 'border-danger/60' : ''
            }`}
          />
          {errors.message && <p className="mt-1 text-xs text-danger">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white shadow-[0_8px_22px_-8px_rgba(0,212,255,0.7)] transition-all hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.9)] active:scale-95"
        >
          <Icon name="mail" size={16} />
          {t.submit}
        </button>
      </form>

      <div className="border-t border-border px-7 py-4 flex items-center gap-2">
        <Icon name="mail" size={14} className="text-faint" />
        <span className="text-xs text-muted">mailto:{FEEDBACK_EMAIL}</span>
      </div>
    </div>
  );
}

/** Botón que abre el widget de reporte de Sentry (usado en la página de feedback). */
export function OpenReportButton({
  dict,
}: {
  dict: {
    openReport: string;
    openReportDesc: string;
    noSentry: string;
  };
}) {
  const [unavailable, setUnavailable] = useState(false);

  const handleClick = async () => {
    try {
      const fb = Sentry.getFeedback();
      if (fb) {
        const form = await fb.createForm();
        form.open();
        return;
      }
      setUnavailable(true);
    } catch {
      setUnavailable(true);
    }
  };

  return (
    <div>
      <p className="text-sm text-muted mb-4">{dict.openReportDesc}</p>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-neon-pink/50 text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,51,204,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,51,204,0.4)] active:scale-95"
      >
        <Icon name="warning" size={16} />
        {dict.openReport}
      </button>
      {unavailable && <p className="mt-3 text-xs text-warn">{dict.noSentry}</p>}
    </div>
  );
}