'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@ciszu/ui';

interface Order {
  id: string;
  status: string;
  product_type: string;
  product_id: string;
  points_total: number;
  amount_cents: number;
  currency: string;
  created_at: string;
  fulfilled_at: string | null;
}

interface RefundRequest {
  id: string;
  order_id: string;
  amount_cents: number;
  currency: string;
  reason: string;
  status: string;
  admin_note: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  points_amount: number;
  method: string;
  destination: string;
  status: string;
  admin_note: string;
  created_at: string;
}

interface LedgerRow {
  id: number;
  delta: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(input, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function money(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  fulfilled: 'Completado',
  failed: 'Fallido',
  expired: 'Expirado',
  refunded: 'Reembolsado',
  review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export default function BillingPage() {
  const { user, isHydrated } = useAppStore();
  const { toast } = useToast();
  usePageTitle('BILLING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [promo, setPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('100');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'paypal'>('paypal');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [orderRes, withdrawRes, economyRes] = await Promise.all([
        apiFetch('/api/payments/orders'),
        apiFetch('/api/economy/withdraw'),
        apiFetch('/api/economy/me'),
      ]);
      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setRefunds(Array.isArray(data.refunds) ? data.refunds : []);
      }
      if (withdrawRes.ok) {
        const data = await withdrawRes.json();
        setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
      }
      if (economyRes.ok) {
        const data = await economyRes.json();
        setPoints(Number(data.wallet?.points ?? 0));
        setLedger(Array.isArray(data.ledger) ? data.ledger : []);
      }
    } catch {
      toast('No se pudo cargar la facturación.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const refundedOrders = useMemo(() => new Set(refunds.map((item) => item.order_id)), [refunds]);

  async function redeemPromo() {
    if (!promo.trim() || busy) return;
    setBusy('promo');
    setPromoMessage('');
    try {
      const response = await apiFetch('/api/economy/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'promo_failed');
      setPoints(Number(data.balance ?? points));
      setPromo('');
      setPromoMessage(`Código aplicado: +${data.credited} MZP.`);
      toast(`Código aplicado: +${data.credited} MZP`, 'success');
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'promo_failed';
      setPromoMessage(message === 'promo_already_used' ? 'Ya usaste este código.' : message);
    } finally {
      setBusy('');
    }
  }

  async function requestRefund(order: Order) {
    if (busy || refundedOrders.has(order.id)) return;
    const reason = window.prompt('Motivo del reembolso (mínimo 5 caracteres):');
    if (!reason || reason.trim().length < 5) return;
    setBusy(`refund:${order.id}`);
    try {
      const response = await apiFetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id, reason: reason.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'refund_failed');
      toast('Solicitud de reembolso enviada. El equipo la revisará.', 'success');
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'No se pudo solicitar el reembolso.', 'error');
    } finally {
      setBusy('');
    }
  }

  async function requestWithdrawal() {
    if (busy) return;
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < 100) {
      setWithdrawMessage('El mínimo para retirar es 100 MZP.');
      return;
    }
    if (withdrawDestination.trim().length < 4) {
      setWithdrawMessage('Escribe la cuenta o correo de destino.');
      return;
    }
    setBusy('withdraw');
    setWithdrawMessage('');
    try {
      const response = await apiFetch('/api/economy/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: amount,
          method: withdrawMethod,
          destination: withdrawDestination.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'withdrawal_failed');
      setWithdrawDestination('');
      setWithdrawMessage('Solicitud de retiro enviada. Queda pendiente de aprobación.');
      toast('Solicitud de retiro enviada.', 'success');
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'withdrawal_failed';
      setWithdrawMessage(message === 'insufficient_points' ? 'No tienes suficientes MZP.' : message);
    } finally {
      setBusy('');
    }
  }

  if (!isHydrated || loading) {
    return <MainLayout><div className="mx-auto max-w-4xl px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Cargando facturación…</div></MainLayout>;
  }

  if (!user) {
    return <MainLayout><div className="mx-auto max-w-4xl px-6 py-20 text-center text-white/60">Inicia sesión para ver tu facturación.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-24 pt-10">
        <header className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-neon-cyan">MUZICMANIA · CUENTA</p>
          <h1 className="font-header text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">Facturación</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-white/40">Historial de compras, códigos promocionales, reembolsos y solicitudes de retiro. Los retiros quedan en revisión manual antes de cualquier pago.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Saldo actual</p>
            <p className="mt-2 font-header text-3xl font-black text-white">{points.toLocaleString()} <span className="text-neon-cyan">MZP</span></p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Compras realizadas</p>
            <p className="mt-2 font-header text-3xl font-black text-white">{orders.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Retiros pendientes</p>
            <p className="mt-2 font-header text-3xl font-black text-white">{withdrawals.filter((item) => item.status === 'pending').length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-neon-purple/25 bg-neon-purple/[0.06] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-neon-purple">Canjear código</p>
              <p className="mt-1 text-[10px] text-white/40">Códigos de puntos, evento o regalo. Un código puede tener límites de uso.</p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input value={promo} onChange={(event) => setPromo(event.target.value.toUpperCase())} maxLength={40} placeholder="MZ-XXXXXX" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20" />
              <button type="button" onClick={() => void redeemPromo()} disabled={busy !== '' || promo.trim().length < 3} className="rounded-xl bg-neon-purple px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-40">Canjear</button>
            </div>
          </div>
          {promoMessage && <p className="mt-3 text-[10px] text-white/55">{promoMessage}</p>}
        </section>

        <section className="space-y-3">
          <h2 className="font-header text-xl font-black uppercase tracking-tight text-white">Historial de compras</h2>
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-[10px] uppercase tracking-widest text-white/30">Aún no hay compras.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => {
                const refund = refunds.find((item) => item.order_id === order.id);
                return (
                  <article key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{order.points_total.toLocaleString()} MZP · {money(order.amount_cents, order.currency)}</p>
                      <p className="mt-1 text-[9px] text-white/35">{dateLabel(order.created_at)} · {order.id.slice(0, 8)} · {STATUS_LABEL[order.status] ?? order.status}</p>
                      {refund && <p className="mt-1 text-[9px] text-amber-300">Reembolso: {STATUS_LABEL[refund.status] ?? refund.status}</p>}
                    </div>
                    {['fulfilled', 'paid'].includes(order.status) && !refund && (
                      <button type="button" onClick={() => void requestRefund(order)} disabled={busy !== ''} className="rounded-xl border border-amber-300/30 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-amber-200 disabled:opacity-40">Solicitar reembolso</button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-header text-xl font-black uppercase tracking-tight text-white">Solicitar retiro</h2>
          <p className="mt-1 text-[10px] text-white/40">Mínimo 100 MZP. Se descuentan al enviar la solicitud y el pago queda sujeto a revisión manual y disponibilidad de payout.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} type="number" min="100" placeholder="MZP" className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none" />
            <select value={withdrawMethod} onChange={(event) => setWithdrawMethod(event.target.value as 'bank' | 'paypal')} className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none">
              <option value="paypal">PayPal</option>
              <option value="bank">Cuenta bancaria</option>
            </select>
            <input value={withdrawDestination} onChange={(event) => setWithdrawDestination(event.target.value)} maxLength={200} placeholder="Correo PayPal o cuenta bancaria" className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none md:col-span-2" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={() => void requestWithdrawal()} disabled={busy !== ''} className="rounded-xl bg-neon-cyan px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black disabled:opacity-40">Enviar solicitud</button>
            {withdrawMessage && <span className="text-[10px] text-white/55">{withdrawMessage}</span>}
          </div>
          {withdrawals.length > 0 && (
            <div className="mt-4 space-y-2">
              {withdrawals.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/25 p-3 text-[9px]">
                  <span className="font-black uppercase tracking-widest text-white/70">{item.points_amount.toLocaleString()} MZP · {item.method}</span>
                  <span className="text-white/35">{dateLabel(item.created_at)} · {STATUS_LABEL[item.status] ?? item.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-header text-xl font-black uppercase tracking-tight text-white">Movimientos de puntos</h2>
          {ledger.length === 0 ? <p className="text-[10px] text-white/30">Sin movimientos.</p> : ledger.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 px-3 py-2 text-[10px]">
              <span className="uppercase tracking-widest text-white/45">{row.reason}</span>
              <span className={row.delta >= 0 ? 'font-black text-emerald-300' : 'font-black text-red-300'}>{row.delta >= 0 ? '+' : ''}{row.delta} MZP</span>
              <span className="ml-auto text-white/25">{dateLabel(row.created_at)}</span>
            </div>
          ))}
        </section>
      </main>
    </MainLayout>
  );
}
