export type PremiumPlanId = 'free' | 'beta' | 'gold' | 'diamond' | 'platinum' | 'lifetime';
export type BillingCycle = 'monthly' | 'annual' | 'lifetime';

export interface PremiumPlan {
  id: PremiumPlanId;
  name: string;
  tagline: string;
  audience: string;
  serverLimit: number;
  monthlyUsd: number | null;
  annualUsd: number | null;
  lifetimeUsd: number | null;
  discountPercent: number;
  popular: boolean;
  enterprise: boolean;
  colorFrom: string;
  colorTo: string;
  badge: string;
  features: string[];
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Base estable para siempre',
    audience: 'Comunidades que empiezan',
    serverLimit: 0,
    monthlyUsd: 0,
    annualUsd: 0,
    lifetimeUsd: null,
    discountPercent: 0,
    popular: false,
    enterprise: false,
    colorFrom: '#64748b',
    colorTo: '#94a3b8',
    badge: 'Para siempre',
    features: ['Comandos base', 'Moderación esencial', 'Economía y niveles', 'Sin servidores premium'],
  },
  {
    id: 'beta',
    name: 'Beta Trial',
    tagline: 'Premium dorado temporal',
    audience: 'Todos los usuarios durante la beta',
    serverLimit: 3,
    monthlyUsd: 0,
    annualUsd: 0,
    lifetimeUsd: null,
    discountPercent: 0,
    popular: false,
    enterprise: false,
    colorFrom: '#f59e0b',
    colorTo: '#fbbf24',
    badge: 'Beta',
    features: ['Funciones premium', '3 servidores', 'Sin cobro durante la beta', 'Termina cuando acabe la beta'],
  },
  {
    id: 'gold',
    name: 'Dorado',
    tagline: 'El más rentable',
    audience: 'Servidores pequeños y medianos',
    serverLimit: 3,
    monthlyUsd: 2.99,
    annualUsd: 35.88,
    lifetimeUsd: null,
    discountPercent: 15,
    popular: false,
    enterprise: false,
    colorFrom: '#b45309',
    colorTo: '#fbbf24',
    badge: '15% OFF',
    features: ['3 servidores premium', 'Música y búsqueda', 'Embeds personalizados', 'Drops y comandos ilimitados'],
  },
  {
    id: 'diamond',
    name: 'Diamante',
    tagline: 'El más popular',
    audience: 'Comunidades activas',
    serverLimit: 8,
    monthlyUsd: 9.99,
    annualUsd: 119.88,
    lifetimeUsd: null,
    discountPercent: 20,
    popular: true,
    enterprise: false,
    colorFrom: '#0891b2',
    colorTo: '#67e8f9',
    badge: '20% OFF',
    features: ['8 servidores premium', 'Todo lo de Dorado', 'Prioridad en soporte', 'Analíticas avanzadas'],
  },
  {
    id: 'platinum',
    name: 'Platino',
    tagline: 'El más empresarial',
    audience: 'Redes y organizaciones',
    serverLimit: 20,
    monthlyUsd: 39.99,
    annualUsd: 479.88,
    lifetimeUsd: null,
    discountPercent: 30,
    popular: false,
    enterprise: true,
    colorFrom: '#7c3aed',
    colorTo: '#e879f9',
    badge: '30% OFF',
    features: ['20 servidores premium', 'Todo lo de Diamante', 'Soporte prioritario', 'Condiciones empresariales'],
  },
  {
    id: 'lifetime',
    name: 'Premium de por vida',
    tagline: 'Un solo pago, para siempre',
    audience: 'Quien no quiere suscripción',
    serverLimit: 20,
    monthlyUsd: null,
    annualUsd: null,
    lifetimeUsd: 100,
    discountPercent: 0,
    popular: false,
    enterprise: true,
    colorFrom: '#0f766e',
    colorTo: '#2dd4bf',
    badge: 'Pago único',
    features: ['20 servidores premium', 'Funciones de Platino', 'Sin renovaciones', 'Sin rebajas'],
  },
];

export const PREMIUM_PLAN_MAP = Object.fromEntries(PREMIUM_PLANS.map((plan) => [plan.id, plan])) as Record<
  PremiumPlanId,
  PremiumPlan
>;

export const PAID_PLANS = PREMIUM_PLANS.filter((plan) => plan.id !== 'free' && plan.id !== 'beta' && plan.id !== 'lifetime');
export const SERVER_LIMIT: Record<PremiumPlanId, number> = Object.fromEntries(
  PREMIUM_PLANS.map((plan) => [plan.id, plan.serverLimit]),
) as Record<PremiumPlanId, number>;

export function listPrice(plan: PremiumPlan, cycle: BillingCycle): number | null {
  if (cycle === 'monthly') return plan.monthlyUsd;
  if (cycle === 'annual') return plan.annualUsd;
  return plan.lifetimeUsd;
}

export function discountedPrice(plan: PremiumPlan, cycle: BillingCycle): number | null {
  const price = listPrice(plan, cycle);
  if (price === null) return null;
  if (plan.id === 'lifetime' || plan.id === 'free' || plan.id === 'beta') return price;
  return Math.round(price * (1 - plan.discountPercent / 100) * 100) / 100;
}

export function discountActive(plan: PremiumPlan): boolean {
  return plan.discountPercent > 0 && plan.id !== 'lifetime' && plan.id !== 'free';
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'Dólar estadounidense', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', label: 'Libra esterlina', rate: 0.79 },
  { code: 'VES', symbol: 'Bs.', label: 'Bolívar venezolano', rate: 36.5 },
  { code: 'MXN', symbol: '$', label: 'Peso mexicano', rate: 17.1 },
  { code: 'COP', symbol: '$', label: 'Peso colombiano', rate: 4100 },
  { code: 'ARS', symbol: '$', label: 'Peso argentino', rate: 900 },
  { code: 'BRL', symbol: 'R$', label: 'Real brasileño', rate: 5.4 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export function formatMoney(amountUsd: number, currency: CurrencyCode, rate = 1): string {
  const item = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const value = amountUsd * (rate || item.rate);
  const digits = currency === 'COP' || currency === 'ARS' || currency === 'VES' ? 0 : 2;
  return `${item.symbol}${value.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${currency}`;
}
