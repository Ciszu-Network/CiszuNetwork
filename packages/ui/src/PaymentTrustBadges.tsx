import Link from 'next/link';
import { Icon } from './Icon';

type PaymentTrustLang = 'es' | 'en';

export interface PaymentTrustBadgesProps {
  lang?: PaymentTrustLang;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

const COPY = {
  es: {
    title: 'Pagos y confianza',
    subtitle:
      'Cobros procesados por proveedores externos. No almacenamos datos de tarjeta; cada marca enlaza a su política legal.',
    secure: 'Cifrado TLS',
    pci: 'PCI DSS',
    bank: 'Transferencia bancaria',
  },
  en: {
    title: 'Payments and trust',
    subtitle:
      'Charges are processed by external providers. We do not store card data; every brand links to its legal policy.',
    secure: 'TLS encryption',
    pci: 'PCI DSS',
    bank: 'Bank transfer',
  },
} as const;

const PROVIDERS = [
  {
    name: 'Stripe',
    href: 'https://stripe.com/legal',
    color: '#635BFF',
    mark: <span className="font-header text-[15px] font-black lowercase tracking-[-0.04em]">stripe</span>,
  },
  {
    name: 'PayPal',
    href: 'https://www.paypal.com/legalhub/home',
    color: '#0070E0',
    mark: (
      <span className="flex items-center gap-1.5">
        <Icon name="paypal" style="brand" size={18} />
        <span className="font-header text-[12px] font-black">PayPal</span>
      </span>
    ),
  },
  {
    name: 'Payoneer',
    href: 'https://www.payoneer.com/legal/',
    color: '#FF4800',
    mark: <span className="font-header text-[13px] font-black tracking-tight">Payoneer</span>,
  },
  {
    name: 'Mercado Pago',
    href: 'https://www.mercadopago.com/legal',
    color: '#009EE3',
    mark: (
      <span className="font-header text-[12px] font-black tracking-tight">
        Mercado <span className="text-[#FFE600]">Pago</span>
      </span>
    ),
  },
  {
    name: 'NOWPayments',
    href: 'https://nowpayments.io/terms',
    color: '#7C3AED',
    mark: (
      <span className="flex items-center gap-1.5">
        <Icon name="nowpayments" style="brand" size={18} />
        <span className="font-header text-[11px] font-black">NOWPayments</span>
      </span>
    ),
  },
  {
    name: 'Visa',
    href: 'https://usa.visa.com/legal.html',
    color: '#1A1F71',
    mark: <span className="font-header text-[14px] font-black italic tracking-[-0.08em]">VISA</span>,
  },
  {
    name: 'Mastercard',
    href: 'https://www.mastercard.com/global/en/legal.html',
    color: '#EB001B',
    mark: <span className="font-header text-[12px] font-black tracking-tight">Mastercard</span>,
  },
] as const;

export function PaymentTrustBadges({
  lang = 'es',
  className = '',
  showHeader = true,
  compact = false,
}: PaymentTrustBadgesProps) {
  const t = COPY[lang];
  const badges = PROVIDERS.map((provider) => (
    <a
      key={provider.name}
      href={provider.href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${provider.name} — legal`}
      aria-label={`${provider.name} legal`}
      className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface/70 px-3 py-2 text-ink transition hover:border-neon-blue/40 hover:bg-surface"
      style={{ color: provider.color }}
    >
      {provider.mark}
    </a>
  ));

  return (
    <section className={className}>
      {showHeader && (
        <header className={compact ? 'mb-3' : 'mb-4'}>
          <h2 className="font-header text-[11px] font-black uppercase tracking-[0.3em] text-ink">{t.title}</h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">{t.subtitle}</p>
        </header>
      )}
      <div className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
        {badges}
        <Link
          href="/terms"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 text-xs font-bold text-muted transition hover:border-neon-blue/40 hover:text-ink"
        >
          <Icon name="shield" size={15} className="text-emerald-400" />
          {t.secure} · {t.pci}
        </Link>
      </div>
      <p className="mt-3 text-[10px] text-muted">
        <Icon name="credit-card" size={12} className="mr-1 inline-block align-[-2px]" />
        {t.bank}
      </p>
    </section>
  );
}

export default PaymentTrustBadges;
