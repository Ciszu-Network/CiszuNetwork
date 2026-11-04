export type DebugSite = 'ciszu' | 'ciszukoantony' | 'muzicmania' | 'ciszubot';
export type DebugFeature = 'placeholders' | 'simulatedAnalytics' | 'officialEditor' | 'cheats';
export type DebugRole = 'owner' | 'admin' | 'beta';

export interface DebugStaff {
  staffId: string;
  name: string;
  role: DebugRole;
  nivel: number;
}

export interface DebugAccountLink {
  site: DebugSite;
  username: string | null;
  displayName: string | null;
  linked: boolean;
  siteUserId?: string | null;
}

export interface DebugPlaceholder {
  id: string;
  name: string;
  username: string;
  tag: 'BOT' | 'TEST';
  score: number;
  balance: number;
  bank: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DebugStatus {
  authorized: boolean;
  reason?: 'unauthenticated' | 'not_staff' | 'not_whitelisted' | 'elevation_required' | 'disabled';
  staff: DebugStaff | null;
  features: Record<DebugFeature, boolean>;
  links: DebugAccountLink[];
  expiresAt?: string | null;
}

export const EMPTY_DEBUG_FEATURES: Record<DebugFeature, boolean> = {
  placeholders: false,
  simulatedAnalytics: false,
  officialEditor: false,
  cheats: false,
};
