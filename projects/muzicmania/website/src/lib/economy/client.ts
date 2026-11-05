import { supabase } from '@/config/supabase';
import type { EconomySnapshot, PointPackage, ShopItem } from './types';

async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(input, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

export async function fetchEconomy(): Promise<EconomySnapshot> {
  const response = await apiFetch('/api/economy/me', { cache: 'no-store' });
  if (!response.ok) throw new Error('economy_load_failed');
  return response.json();
}

export async function fetchShopItems(): Promise<{ items: ShopItem[] }> {
  const response = await apiFetch('/api/shop/items', { cache: 'no-store' });
  if (!response.ok) throw new Error('shop_load_failed');
  return response.json();
}

export async function fetchPackages(): Promise<{ packages: PointPackage[]; flags: EconomySnapshot['flags'] }> {
  const response = await fetch('/api/shop/packages', { cache: 'no-store' });
  if (!response.ok) throw new Error('packages_load_failed');
  return response.json();
}

export async function purchaseItem(itemId: string) {
  const response = await apiFetch('/api/shop/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'purchase_failed');
  return data as { points: number };
}

export async function equipItem(itemId: string) {
  const response = await apiFetch('/api/shop/equip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId }),
  });
  if (!response.ok) throw new Error('equip_failed');
}

export async function createInvoice(packageId: string) {
  const response = await apiFetch('/api/payments/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_id: packageId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'invoice_failed');
  return data as { order_id: string; checkout_url: string };
}

export async function fetchOrder(id: string) {
  const response = await apiFetch(`/api/payments/order/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('order_load_failed');
  return response.json();
}

export async function declareAdult(birthDate: string, termsVersion: string) {
  const response = await apiFetch('/api/economy/adult', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birth_date: birthDate, terms_version: termsVersion }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'adult_failed');
  return data as { adult: boolean };
}
