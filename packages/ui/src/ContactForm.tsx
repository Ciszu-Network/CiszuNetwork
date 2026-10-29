'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export interface ContactFormProps {
  site: string;
  endpoint?: string;
  lang?: 'es' | 'en';
  className?: string;
}

const COPY = {
  es: {
    title: 'Envíanos un mensaje',
    hint: 'Respondemos al email que indiques. No compartimos tus datos.',
    name: 'Nombre',
    email: 'Email',
    subject: 'Asunto',
    message: 'Mensaje',
    send: 'Enviar mensaje',
    sending: 'Enviando…',
    ok: 'Mensaje recibido. Te responderemos pronto.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
    privacy: 'Al enviar aceptas nuestra política de privacidad.',
  },
  en: {
    title: 'Send us a message',
    hint: 'We reply to the email you provide. We do not share your data.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    ok: 'Message received. We will reply soon.',
    error: 'Could not send the message. Try again.',
    privacy: 'By sending you accept our privacy policy.',
  },
};

export function ContactForm({ site, endpoint = '/api/contact', lang = 'es', className = '' }: ContactFormProps) {
  const t = COPY[lang];
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus('idle');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !json.ok) {
        setStatus('error');
        return;
      }
      setStatus('ok');
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className={'rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 ' + className}>
      <h2 className="font-header text-2xl font-black uppercase tracking-tight text-white">{t.title}</h2>
      <p className="mt-1 text-sm text-white/50">{site} · {t.hint}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-[10px] font-black uppercase tracking-widest text-white/45">
          {t.name}
          <input required minLength={2} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-blue" />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-widest text-white/45">
          {t.email}
          <input required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-blue" />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-widest text-white/45 sm:col-span-2">
          {t.subject}
          <input required minLength={3} maxLength={160} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-blue" />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-widest text-white/45 sm:col-span-2">
          {t.message}
          <textarea required minLength={10} maxLength={5000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-neon-blue" />
        </label>
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] text-white/35">{t.privacy}</p>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 font-header text-[10px] font-black uppercase tracking-widest text-white transition hover:scale-[1.02] disabled:opacity-50">
          <Icon name="mail" size={14} /> {busy ? t.sending : t.send}
        </button>
      </div>
      {status !== 'idle' && (
        <p className={'mt-3 text-xs font-bold ' + (status === 'ok' ? 'text-emerald-300' : 'text-rose-300')}>
          {status === 'ok' ? t.ok : t.error}
        </p>
      )}
    </form>
  );
}

export default ContactForm;
