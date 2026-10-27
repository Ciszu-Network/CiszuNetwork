'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
const CURRENCIES = [
  { code: 'USD', label: 'Dólar estadounidense' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'Libra esterlina' },
  { code: 'VES', label: 'Bolívar venezolano' },
  { code: 'MXN', label: 'Peso mexicano' },
  { code: 'COP', label: 'Peso colombiano' },
  { code: 'ARS', label: 'Peso argentino' },
  { code: 'BRL', label: 'Real brasileño' },
] as const;
type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const formatMoney = (amount: number, currency: CurrencyCode) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);

export interface BillingPanelProps {
  site: string;
  siteName: string;
  lang?: 'es' | 'en';
  premiumHref?: string;
  planName?: string;
  remaining?: number;
}

const COPY = {
  es: {
    title: 'Facturación y pagos',
    subtitle: 'Plan actual, métodos de pago, conexiones e historial de transacciones.',
    currentPlan: 'Plan actual',
    remaining: 'Premium restantes',
    beta: 'Beta trial',
    upgrade: 'Ver planes',
    currency: 'Divisa de visualización',
    methods: 'Métodos de pago',
    methodsEmpty: 'Aún no hay tarjetas vinculadas.',
    connections: 'Conexiones',
    connectionsEmpty: 'Sin conexiones de pago.',
    history: 'Historial de transacciones',
    historyEmpty: 'Todavía no hay pagos registrados.',
    profile: 'Datos de facturación',
    name: 'Nombre fiscal',
    email: 'Email',
    tax: 'ID fiscal',
    save: 'Guardar',
    locked: 'Disponible al salir de beta',
    refund: 'No existe un sistema de reembolsos. Los pagos son definitivos.',
    secure: 'Pagos cifrados y procesados por proveedores externos.',
    date: 'Fecha',
    concept: 'Concepto',
    amount: 'Importe',
    status: 'Estado',
    noData: 'Sin datos',
  },
  en: {
    title: 'Billing and payments',
    subtitle: 'Current plan, payment methods, connections and transaction history.',
    currentPlan: 'Current plan',
    remaining: 'Premium slots left',
    beta: 'Beta trial',
    upgrade: 'View plans',
    currency: 'Display currency',
    methods: 'Payment methods',
    methodsEmpty: 'No linked cards yet.',
    connections: 'Connections',
    connectionsEmpty: 'No payment connections.',
    history: 'Transaction history',
    historyEmpty: 'No payments recorded yet.',
    profile: 'Billing details',
    name: 'Legal name',
    email: 'Email',
    tax: 'Tax ID',
    save: 'Save',
    locked: 'Available after beta',
    refund: 'There is no refund system. Payments are final.',
    secure: 'Payments are encrypted and processed by external providers.',
    date: 'Date',
    concept: 'Concept',
    amount: 'Amount',
    status: 'Status',
    noData: 'No data',
  },
};

export function BillingPanel({
  site,
  siteName,
  lang = 'es',
  premiumHref = '/premium',
  planName,
  remaining = 0,
}: BillingPanelProps) {
  const t = COPY[lang];
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  return (
    <section className="space-y-5">
      <header>
        <h2 className="font-header text-xl font-black uppercase tracking-widest text-ink">{t.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t.currentPlan}</p>
          <p className="mt-2 font-header text-2xl font-black text-ink">{planName ?? t.beta}</p>
          <p className="mt-1 text-xs text-muted">{siteName} · {site}</p>
          <p className="mt-4 text-sm font-bold text-ink">{remaining} {t.remaining}</p>
          <Link
            href={premiumHref}
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-4 py-2.5 font-header text-[10px] font-black uppercase tracking-widest text-white"
          >
            {t.upgrade}
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t.currency}</p>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
          >
            {CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} · {item.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-xs text-muted">
            {formatMoney(0, currency)} · {t.secure}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">{t.methods}</h3>
          <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
            <Icon name="credit-card" size={20} className="mx-auto mb-2 opacity-40" />
            {t.methodsEmpty}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">{t.connections}</h3>
          <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
            <Icon name="link" size={20} className="mx-auto mb-2 opacity-40" />
            {t.connectionsEmpty}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">{t.history}</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted">
                <th className="py-2 pr-3">{t.date}</th>
                <th className="py-2 pr-3">{t.concept}</th>
                <th className="py-2 pr-3">{t.amount}</th>
                <th className="py-2">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-6 text-center text-muted" colSpan={4}>{t.historyEmpty}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">{t.profile}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted">
            {t.name}
            <input disabled className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink opacity-60" />
          </label>
          <label className="block text-xs text-muted">
            {t.email}
            <input disabled className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink opacity-60" />
          </label>
          <label className="block text-xs text-muted sm:col-span-2">
            {t.tax}
            <input disabled className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink opacity-60" />
          </label>
        </div>
        <button
          type="button"
          disabled
          className="mt-4 rounded-xl border border-border px-4 py-2.5 font-header text-[10px] font-black uppercase tracking-widest text-muted opacity-50"
        >
          {t.locked}
        </button>
      </div>

      <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-200">
        {t.refund}
      </p>
    </section>
  );
}

export default BillingPanel;
