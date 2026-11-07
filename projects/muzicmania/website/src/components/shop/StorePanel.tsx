'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatMzP } from '@/lib/economy/format';
import { claimDaily, claimTask, createInvoice, equipItem, fetchCreatorCode, fetchDaily, fetchEconomy, fetchOrder, fetchPackages, fetchShopItems, fetchTasks, giftPoints, purchaseItem } from '@/lib/economy/client';
import type { EconomySnapshot, PointPackage, ShopItem } from '@/lib/economy/types';
import { AgeGateModal } from './AgeGateModal';
import { WalletChip } from './WalletChip';

type Tab = 'packages' | 'cosmetics' | 'inventory' | 'missions' | 'gifts' | 'creator';

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

function removeInvoiceIdempotencyKey(userId: string, productId: string | null | undefined) {
  if (!productId) return;
  window.sessionStorage.removeItem(invoiceIdempotencyStorageKey(userId, productId));
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
  const [daily, setDaily] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ xp: number; level: number } | null>(null);
  const [missionBusy, setMissionBusy] = useState<string | null>(null);
  const [creatorCode, setCreatorCode] = useState('');
  const [creatorData, setCreatorData] = useState<any>(null);
  const [giftUser, setGiftUser] = useState('');
  const [giftAmount, setGiftAmount] = useState('10');
  const [giftMessage, setGiftMessage] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;
    const [economy, catalog, packageData, dailyData, taskData] = await Promise.all([fetchEconomy(), fetchShopItems(), fetchPackages(), fetchDaily(), fetchTasks()]);
    setSnapshot(economy);
    setItems(catalog.items);
    setPackages(packageData.packages);
    setFlags(packageData.flags);
    setDaily(dailyData.daily ?? null);
    setTasks(Array.isArray(taskData.tasks) ? taskData.tasks : []);
    setProfile(taskData.profile ?? null);
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
        const productId = data?.order?.product_id as string | undefined;
        if (status === 'fulfilled') {
          if (productId) removeInvoiceIdempotencyKey(userId, productId);
          else clearInvoiceIdempotencyKeys(userId);
          setPaymentStatus('Pago confirmado. MuziPoints acreditados.');
          await load();
          return;
        }
        if (status === 'failed') {
          removeInvoiceIdempotencyKey(userId, productId);
          setPaymentStatus('El pago falló. No se realizó ningún cargo.');
          return;
        }
        if (status === 'expired') {
          removeInvoiceIdempotencyKey(userId, productId);
          setPaymentStatus('La factura expiró. Intenta de nuevo.');
          return;
        }
        if (status === 'refunded') {
          removeInvoiceIdempotencyKey(userId, productId);
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
      const invoice = await createInvoice(pkg.id, idempotencyKey, creatorCode.trim() || undefined);
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
      if (message === 'already_fulfilled') {
        removeInvoiceIdempotencyKey(userId, pkg.id);
        setPaymentStatus('Este pago ya se completó. Los MuziPoints ya están acreditados.');
        await load().catch(() => setError('No se pudo actualizar la tienda.'));
        return;
      }
      if (message === 'invoice_review') {
        setError('La factura anterior está en revisión. No puedes reintentar hasta que se resuelva.');
        return;
      }
      if (message === 'invoice_failed') {
        removeInvoiceIdempotencyKey(userId, pkg.id);
        setError('La factura anterior falló o expiró. Intenta de nuevo.');
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

  const handleDaily = async () => {
    setMissionBusy('daily');
    setError('');
    try {
      await claimDaily();
      await load();
    } catch (cause) {
      setError(cause instanceof Error && cause.message === 'daily_claim_failed' ? 'No se pudo reclamar la recompensa.' : 'No se pudo reclamar la recompensa.');
    } finally {
      setMissionBusy(null);
    }
  };

  const handleTask = async (key: string) => {
    setMissionBusy(key);
    setError('');
    try {
      await claimTask(key);
      await load();
    } catch (cause) {
      setError(cause instanceof Error && cause.message === 'task_incomplete' ? 'La tarea aún no está completa.' : 'No se pudo reclamar la tarea.');
    } finally {
      setMissionBusy(null);
    }
  };

  const handleGift = async () => {
    setMissionBusy('gift');
    setError('');
    try {
      await giftPoints(giftUser, Number(giftAmount), giftMessage);
      setGiftMessage('');
      setGiftUser('');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'gift_failed');
    } finally {
      setMissionBusy(null);
    }
  };

  const handleCreatorCode = async () => {
    setMissionBusy('creator');
    setError('');
    try {
      const data = await fetchCreatorCode();
      setCreatorCode(data.code ?? '');
      setCreatorData(data);
    } catch (cause) {
      setError(cause instanceof Error && cause.message === 'creator_requires_published_level' ? 'Publica al menos un nivel para obtener tu código.' : 'No se pudo obtener el código de creador.');
    } finally {
      setMissionBusy(null);
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
        <div className="flex items-center gap-2">
          {profile && <span className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-neon-purple">NIVEL {profile.level} · {profile.xp} XP</span>}
          <WalletChip points={snapshot?.wallet.points ?? 0} />
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {(['packages', 'cosmetics', 'inventory', 'missions', 'gifts', 'creator'] as Tab[]).map((value) => <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest ${tab === value ? 'bg-yellow-400/15 text-yellow-300' : 'text-white/35'}`}>{value === 'packages' ? 'Paquetes' : value === 'cosmetics' ? 'Cosméticos' : value === 'inventory' ? 'Inventario' : value === 'missions' ? 'Misiones' : value === 'gifts' ? 'Regalos' : 'Creadores'}</button>)}
      </div>
      {error && <p className="mb-2 text-[10px] text-red-300">{error}</p>}
      {paymentStatus && <p className="mb-2 text-[10px] text-cyan-300">{paymentStatus}</p>}
      {tab === 'packages' && (
        <label className="mb-3 block text-[8px] font-black uppercase tracking-widest text-white/35">
          Código de creador (opcional)
          <input value={creatorCode} onChange={(event) => setCreatorCode(event.target.value.toUpperCase())} maxLength={20} placeholder="MZ..." className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/20" />
        </label>
      )}
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
              <button type="button" disabled={busy !== null} onClick={() => item.owned ? void equip(item) : void buyItem(item)} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50">
                {item.owned ? (item.equippedSlot ? 'EQUIPADO' : 'EQUIPAR') : 'COMPRAR'}
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === 'inventory' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.filter((item) => item.owned).map((item) => (
            <button key={item.id} type="button" disabled={busy !== null} onClick={() => void equip(item)} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-left disabled:opacity-50">
              <p className="font-header text-lg font-black text-white">{item.name}</p>
              <p className="text-[9px] uppercase tracking-widest text-emerald-300">{item.equippedSlot ? 'Equipado' : 'Equipar'}</p>
            </button>
          ))}
          {items.every((item) => !item.owned) && <p className="text-[10px] uppercase tracking-widest text-white/30">Sin ítems todavía.</p>}
        </div>
      )}
      {tab === 'missions' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-yellow-300">Recompensa diaria</p>
              <p className="mt-1 font-header text-xl font-black text-white">{daily?.can_claim ? `${daily?.next_points ?? 10} MZP · ${daily?.next_xp ?? 5} XP` : `Racha de ${daily?.streak ?? 0} día(s)`}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/35">{daily?.can_claim ? 'Disponible hoy' : 'Vuelve mañana para continuar la racha'}</p>
            </div>
            <button type="button" disabled={!daily?.can_claim || missionBusy !== null} onClick={() => void handleDaily()} className="rounded-xl bg-yellow-400 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black disabled:opacity-40">{daily?.can_claim ? 'Reclamar' : 'Reclamado'}</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {tasks.map((task) => (
              <div key={task.key} className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-header text-sm font-black text-white">{task.title}</p>
                    <p className="mt-0.5 text-[9px] text-white/35">{task.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-neon-cyan">{task.cadence === 'daily' ? 'DIARIA' : 'SEMANAL'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/35">{task.progress}/{task.target} · {task.points} MZP · {task.xp} XP</p>
                  <button type="button" disabled={!task.complete || task.claimed || missionBusy !== null} onClick={() => void handleTask(task.key)} className="rounded-lg border border-emerald-300/25 bg-emerald-300/5 px-2.5 py-1 text-[7px] font-black uppercase tracking-widest text-emerald-300 disabled:opacity-40">{task.claimed ? 'Reclamada' : task.complete ? 'Reclamar' : 'Pendiente'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'gifts' && (
        <div className="max-w-xl space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[8px] font-black uppercase tracking-widest text-neon-pink">Regalar MuziPoints</p>
          <p className="text-[10px] text-white/35">El emisor y el receptor deben ser mayores de 18 años y tener email verificado.</p>
          <input value={giftUser} onChange={(event) => setGiftUser(event.target.value)} placeholder="Usuario destino" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/20" />
          <input value={giftAmount} onChange={(event) => setGiftAmount(event.target.value)} type="number" min="1" placeholder="MZP" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/20" />
          <input value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} maxLength={200} placeholder="Mensaje opcional" className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white outline-none placeholder:text-white/20" />
          <button type="button" disabled={missionBusy !== null || !giftUser || Number(giftAmount) < 1} onClick={() => void handleGift()} className="rounded-xl bg-neon-pink px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black disabled:opacity-40">Enviar regalo</button>
        </div>
      )}
      {tab === 'creator' && (
        <div className="max-w-xl space-y-3 rounded-2xl border border-neon-purple/25 bg-neon-purple/5 p-4">
          <p className="text-[8px] font-black uppercase tracking-widest text-neon-purple">Programa de creadores</p>
          <p className="text-[10px] text-white/40">Publica al menos un nivel para generar tu código. Tus compradores reciben sus MZP y tú un 5% de los MZP base.</p>
          {creatorCode ? <p className="font-header text-3xl font-black tracking-widest text-white">{creatorCode}</p> : <button type="button" disabled={missionBusy !== null} onClick={() => void handleCreatorCode()} className="rounded-xl border border-neon-purple/40 bg-neon-purple/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neon-purple disabled:opacity-40">Generar mi código</button>}
          {creatorData && <p className="text-[9px] uppercase tracking-widest text-white/35">Donaciones: {creatorData.totals?.donations ?? 0} MZP · Código: {creatorData.totals?.codePoints ?? 0} MZP</p>}
        </div>
      )}
    </div>
  );
}
