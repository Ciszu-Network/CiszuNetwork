'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatMzP } from '@/lib/economy/format';
import { createInvoice, equipItem, fetchEconomy, fetchOrder, fetchPackages, fetchShopItems, purchaseItem } from '@/lib/economy/client';
import type { EconomySnapshot, PointPackage, ShopItem } from '@/lib/economy/types';
import { AgeGateModal } from './AgeGateModal';
import { WalletChip } from './WalletChip';

type Tab = 'packages' | 'cosmetics' | 'inventory';

const TERMINAL_ORDER_STATUSES = new Set(['fulfilled', 'failed', 'expired', 'refunded']);

function invoiceIdempotencyStorageKey(userId: string, packageId: string) {
  return `mz:invoice:${userId}:${packageId}`;
}

function getInvoiceIdempotencyKey(userId: string, packageId: string) {
  const storageKey = invoiceIdempotencyStorageKey(userId, packageId);
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = globalThis.crypto.randomUUID();
  window.sessionStorage.setItem(storageKey, generated);
  return generated;
}

function clearInvoiceIdempotencyKeys(userId: string) {
  const prefix = `mz:invoice:${userId}:`;
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key && key.startsWith(prefix)) window.sessionStorage.removeItem(key);
  }
}

export default function StorePanel({ userId, onBack, onEquipArrow }: { userId: string | null; onBack: () => void; onEquipArrow: (assetKey: string) => void }) {
  const [tab, setTab] = useState<Tab>('packages');
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null);
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [flags, setFlags] = useState<EconomySnapshot['flags']>({ crypto: false, card: false, paypal: false });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [ageOpen, setAgeOpen] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const [economy, catalog, packageData] = await Promise.all([fetchEconomy(), fetchShopItems(), fetchPackages()]);
    setSnapshot(economy);
    setItems(catalog.items);
    setPackages(packageData.packages);
    setFlags(packageData.flags);
  }, [userId]);

  useEffect(() => { void load().catch(() => setError('No se pudo cargar la tienda.')); }, [load]);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderId = params.get('order');
    if (payment === 'cancel') {
      setPaymentStatus('Pago cancelado. No se realizó ningún cargo.');
      return;
    }
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const deadline = Date.now() + 60_000;
    setPaymentStatus('Verificando el estado del pago...');

    const poll = async () => {
      try {
        const data = await fetchOrder(orderId);
        if (cancelled) return;
        const status = data?.order?.status as string | undefined;
        if (status === 'fulfilled') {
          clearInvoiceIdempotencyKeys(userId);
          setPaymentStatus('Pago confirmado. MuziPoints acreditados.');
          await load();
          return;
        }
        if (status === 'failed') {
          setPaymentStatus('El pago falló. No se realizó ningún cargo.');
          return;
        }
        if (status === 'expired') {
          setPaymentStatus('La factura expiró. Intenta de nuevo.');
          return;
        }
        if (status === 'refunded') {
          setPaymentStatus('El pago fue reembolsado.');
          return;
        }
        if (status === 'review') {
          setPaymentStatus('El pago está en revisión. Te avisaremos cuando se confirme.');
          return;
        }
        if (status && TERMINAL_ORDER_STATUSES.has(status)) return;
      } catch {
        if (cancelled) return;
      }
      if (cancelled) return;
      if (Date.now() >= deadline) {
        setPaymentStatus('El pago sigue pendiente. Revisa el estado más tarde.');
        return;
      }
      timer = setTimeout(() => { void poll(); }, 3000);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [load, userId]);

  const buyPackage = async (pkg: PointPackage) => {
    if (!userId) {
      setError('Inicia sesión para comprar MuziPoints.');
      return;
    }
    setPendingPackage(pkg.id);
    setBusy(`invoice:${pkg.id}`);
    setError('');
    setPaymentStatus('');
    try {
      const idempotencyKey = getInvoiceIdempotencyKey(userId, pkg.id);
      const invoice = await createInvoice(pkg.id, idempotencyKey);
      if (!invoice.checkout_url) {
        setError('No se pudo iniciar el pago.');
        return;
      }
      window.location.href = invoice.checkout_url;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'invoice_failed';
      if (message === 'minor' || message === 'adult_required') {
        setAgeOpen(true);
        return;
      }
      if (message === 'email_unverified') {
        setError('Verifica tu email antes de comprar MuziPoints.');
        return;
      }
      if (message === 'terms_required') {
        setError('Debes aceptar los términos de compra 18+ antes de continuar.');
        return;
      }
      if (message === 'birth_date_locked') {
        setError('Tu fecha de nacimiento ya está bloqueada y no coincide.');
        return;
      }
      if (message === 'invoice_pending') {
        setError('Ya existe una factura pendiente para este intento. Revisa el estado antes de reintentar.');
        return;
      }
      setError('No se pudo iniciar el pago.');
    } finally {
      setBusy(null);
    }
  };

  const buyItem = async (item: ShopItem) => {
    setBusy(item.id);
    setError('');
    try {
      await purchaseItem(item.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo comprar.');
    } finally {
      setBusy(null);
    }
  };

  const equip = async (item: ShopItem) => {
    setBusy(item.id);
    try {
      await equipItem(item.id);
      if (item.category === 'arrow_skin') onEquipArrow(item.asset_key);
      await load();
    } catch {
      setError('No se pudo equipar.');
    } finally {
      setBusy(null);
    }
  };

  if (!userId) {
    return <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4"><p className="text-[11px] font-black uppercase tracking-widest text-white/40">Inicia sesión para abrir la tienda.</p><button type="button" onClick={onBack} className="rounded-xl border border-white/15 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/60">Volver</button></div>;
  }

  return (
    <div className="w-full max-w-6xl">
      <AgeGateModal open={ageOpen} onClose={() => setAgeOpen(false)} onDeclared={() => { const pkg = packages.find((entry) => entry.id === pendingPackage); if (pkg) void buyPackage(pkg); }} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/50">Volver</button>
        <WalletChip points={snapshot?.wallet.points ?? 0} />
      </div>
      <div className="mb-3 flex gap-1">
        {(['packages', 'cosmetics', 'inventory'] as Tab[]).map((value) => <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest ${tab === value ? 'bg-yellow-400/15 text-yellow-300' : 'text-white/35'}`}>{value === 'packages' ? 'Paquetes' : value === 'cosmetics' ? 'Cosméticos' : 'Inventario'}</button>)}
      </div>
      {error && <p className="mb-2 text-[10px] text-red-300">{error}</p>}
      {paymentStatus && <p className="mb-2 text-[10px] text-cyan-300">{paymentStatus}</p>}
      {tab === 'packages' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <button key={pkg.id} type="button" disabled={!flags.crypto || busy !== null} onClick={() => void buyPackage(pkg)} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left disabled:opacity-50">
              <p className="text-[8px] font-black uppercase tracking-widest text-yellow-300">{pkg.badge ?? 'MZP'}</p>
              <p className="mt-1 font-header text-xl font-black text-white">{formatMzP(pkg.points_base + pkg.bonus_points)}</p>
              <p className="text-[10px] text-white/40">${(pkg.price_cents / 100).toFixed(2)} USD</p>
              {!flags.crypto && <p className="mt-2 text-[8px] uppercase tracking-widest text-white/30">Cripto desactivado</p>}
            </button>
          ))}
        </div>
      )}
      {tab === 'packages' && (
        <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest">
          <span className={`rounded-full border px-3 py-1 ${flags.crypto ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/30'}`}>{flags.crypto ? 'Cripto disponible' : 'Cripto desactivado'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">Tarjeta próximamente</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">PayPal próximamente</span>
        </div>
      )}
      {tab === 'cosmetics' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="font-header text-lg font-black text-white">{item.name}</p>
              <p className="mt-1 text-[10px] text-white/40">{item.description}</p>
              <p className="mt-2 text-[10px] font-black text-yellow-300">{formatMzP(item.price_points)}</p>
              <button type="button" disabled={busy === item.id} onClick={() => item.owned ? void equip(item) : void buyItem(item)} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50">
                {item.owned ? (item.equippedSlot ? 'EQUIPADO' : 'EQUIPAR') : 'COMPRAR'}
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === 'inventory' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.filter((item) => item.owned).map((item) => (
            <button key={item.id} type="button" onClick={() => void equip(item)} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-left">
              <p className="font-header text-lg font-black text-white">{item.name}</p>
              <p className="text-[9px] uppercase tracking-widest text-emerald-300">{item.equippedSlot ? 'Equipado' : 'Equipar'}</p>
            </button>
          ))}
          {items.every((item) => !item.owned) && <p className="text-[10px] uppercase tracking-widest text-white/30">Sin ítems todavía.</p>}
        </div>
      )}
    </div>
  );
}
