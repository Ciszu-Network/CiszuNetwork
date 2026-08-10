/**
 * Métodos de donación/apoyo de Ciszu Network.
 *
 * ⚠️ Las direcciones de wallet se cargan DESDE EL ENTORNO (vault services/supabase/.env),
 *    NUNCA hardcodeadas en el repo. Sin dirección configurada, el método se omite.
 *
 * Env vars esperadas en el vault:
 *   DONATE_USDT_TRC20   dirección TRON (USDT-TRC20, comisiones bajas, recomendada para VE)
 *   DONATE_USDT_ERC20   dirección Ethereum (USDT-ERC20)
 *   DONATE_BTC          dirección Bitcoin
 *   DONATE_ETH          dirección Ethereum (nativa)
 *   DONATE_PAYPAL       email/link de PayPal (cuando exista, paypal.me/ciszukoantony)
 *   DONATE_ZINLI        tag/código Zinli (rieles VE)
 *   DONATE_PAYONEER     email Payoneer (cuando exista)
 */

export interface DonationMethod {
  id: string;
  label: string;
  /** URL a la que se enlaza (paypal.me, binance pay, etc.) */
  url?: string;
  /** Dirección/código crudo (se construye la URL al renderizar). */
  address?: string;
  network?: string;
  enabled: boolean;
  /** Visible a partir de los 18 años (requiere KYC/edad legal). */
  requiresAdult?: boolean;
}

function fromEnv(envKey: string): string | undefined {
  return process.env[envKey]?.trim() || undefined;
}

export function getDonationMethods(): DonationMethod[] {
  const methods: DonationMethod[] = [
    {
      id: 'usdt-trc20',
      label: 'USDT (TRC-20)',
      network: 'TRON',
      address: fromEnv('DONATE_USDT_TRC20'),
      enabled: Boolean(fromEnv('DONATE_USDT_TRC20')),
    },
    {
      id: 'usdt-erc20',
      label: 'USDT (ERC-20)',
      network: 'Ethereum',
      address: fromEnv('DONATE_USDT_ERC20'),
      enabled: Boolean(fromEnv('DONATE_USDT_ERC20')),
    },
    {
      id: 'btc',
      label: 'Bitcoin',
      network: 'BTC',
      address: fromEnv('DONATE_BTC'),
      enabled: Boolean(fromEnv('DONATE_BTC')),
    },
    {
      id: 'eth',
      label: 'Ethereum',
      network: 'ETH',
      address: fromEnv('DONATE_ETH'),
      enabled: Boolean(fromEnv('DONATE_ETH')),
    },
    {
      id: 'paypal',
      label: 'PayPal',
      url: fromEnv('DONATE_PAYPAL'),
      enabled: Boolean(fromEnv('DONATE_PAYPAL')),
      requiresAdult: true,
    },
    {
      id: 'zinli',
      label: 'Zinli',
      url: fromEnv('DONATE_ZINLI'),
      enabled: Boolean(fromEnv('DONATE_ZINLI')),
    },
    {
      id: 'payoneer',
      label: 'Payoneer',
      url: fromEnv('DONATE_PAYONEER'),
      enabled: Boolean(fromEnv('DONATE_PAYONEER')),
      requiresAdult: true,
    },
  ];
  return methods;
}
