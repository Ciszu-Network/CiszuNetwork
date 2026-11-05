'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatMzP } from '@/lib/economy/format';
import { createInvoice, equipItem, fetchEconomy, fetchPackages, fetchShopItems, purchaseItem } from '@/lib/economy/client';
import type { EconomySnapshot, PointPackage, ShopItem } from '@/lib/economy/types';
import { AgeGateModal } from './AgeGateModal';
import { WalletChip } from './WalletChip';

type Tab = 'packages' | 'cosmetics' | 'inventory';

export default function StorePanel({ userId, onBack, onEquipArrow }: { userId: string | null; onBack: () => void; onEquipArrow: (assetKey: string) => void }) {
  const [tab, setTab] = useState<Tab>('packages');
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null);
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [flags, setFlags] = useState<EconomySnapshot['flags']>({ crypto: false, card: false, paypal: false });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
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

  const buyPackage = async (pkg: PointPackage) => {
    setPendingPackage(pkg.id);
    setBusy(pkg.id);
    setError('');
    try {
      const invoice = await createInvoice(pkg.id);
      window.location.href = invoice.checkout_url;
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'adult_required') { setAgeOpen(true); return; }
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar el pago.');
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
      {tab === 'packages' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{packages.map((pkg) => <button key={pkg.id} type="button" disabled={!flags.crypto || busy === pkg.id} onClick={() => void buyPackage(pkg)} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left disabled:opacity-50"><p className="text-[8px] font-black uppercase tracking-widest text-yellow-300">{pkg.badge ?? 'MZP'}</p><p className="mt-1 font-header text-xl font-black text-white">{formatMzP(pkg.points_base + pkg.bonus_points)}</p><p className="text-[10px] text-white/40">${(pkg.price_cents / 100).toFixed(2)} USD</p>{!flags.crypto && <p className="mt-2 text-[8px] uppercase tracking-widest text-white/30">Cripto desactivado</p>}</button>)}</div>}
      {tab === 'packages' && <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest"><span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-emerald-300">Cripto disponible</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">Tarjeta próximamente</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">PayPal próximamente</span></div>}
      {tab === 'cosmetics' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4"><p className="font-header text-lg font-black text-white">{item.name}</p><p className="mt-1 text-[10px] text-white/40">{item.description}</p><p className="mt-2 text-[10px] font-black text-yellow-300">{formatMzP(item.price_points)}</p><button type="button" disabled={busy === item.id || item.owned} onClick={() => item.owned ? void equip(item) : void buyItem(item)} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50">{item.owned ? (item.equippedSlot ? 'Equipado' : 'Equipar') : 'Comprar'}</button></div>)}</div>}
      {tab === 'inventory' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.filter((item) => item.owned).map((item) => <button key={item.id} type="button" onClick={() => void equip(item)} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-left"><p className="font-header text-lg font-black text-white">{item.name}</p><p className="text-[9px] uppercase tracking-widest text-emerald-300">{item.equippedSlot ?? 'Equipar'}</p></button>)}{items.every((item) => !item.owned) && <p className="text-[10px] uppercase tracking-widest text-white/30">Sin ítems todavía.</p>}</div>}
    </div>
  );
}
