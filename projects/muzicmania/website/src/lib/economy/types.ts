export interface PointPackage {
  id: string;
  slug: string;
  name: string;
  points_base: number;
  bonus_points: number;
  price_cents: number;
  currency: string;
  badge: string | null;
}

export interface ShopItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'arrow_skin' | 'particle_skin' | 'profile_banner' | 'title' | 'bundle';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price_points: number;
  asset_key: string;
  owned: boolean;
  equippedSlot: string | null;
}

export interface EconomySnapshot {
  wallet: { points: number; lifetime_earned: number; lifetime_spent: number };
  inventory: unknown[];
  packages: PointPackage[];
  ledger: unknown[];
  flags: { crypto: boolean; card: boolean; paypal: boolean };
  adult: { birthDate: string | null; isAdult: boolean; emailVerified: boolean; termsVersion: string | null; termsAccepted: boolean };
}
