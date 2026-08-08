'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { trackBanner, trackCover, trackDisc } from '@/utils/musicAssets';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameEngine, getComboColor, getKpsColor, getMistakesColor, getAccuracyColor, getScoreGradient, GameNote } from '@/hooks/useGameEngine';
import { useAppStore } from '@/store/useAppStore';
import { getLevel, LoadedLevel } from '@/data/levels';
import { TRACKS_DATA, Track } from '@/data/tracks';
import { getSkinList, ArrowSkinColorType } from '@/lib/arrowSkins';
import { getParticleSkinList, ParticleSkinColorType, getParticleSkin } from '@/lib/particleSkins';
import { getGrade, GradeRank } from '@/lib/grades';
import { ArrowSkinId, LevelConfig, LevelEvent } from '@/types/level';
import MainLayout from '@/components/templates/MainLayout';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { extractAccentColor } from '@/lib/colorUtils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/atoms/Button';
import { MusicVisualizer } from '@/components/atoms/MusicVisualizer';
import { VinylDisc } from '@/components/atoms/VinylDisc';
import { supabase } from '@/config/supabase';
import { LANGS } from '@/config/navigation';
import { CHANGELOG_DATA } from '@/data/changelog';
import { TAG_CONFIG as CHANGELOG_TAGS, I as CHANGELOG_I } from '@/config/changelogIcons';
// --- Icons Library ---
const I = {
  play: <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  stop: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  stats: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pause: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  maximize: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>,
  album: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  volume: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  music: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  flame: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  disc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  terminal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  cpu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  filter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  store: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  chevronUp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
   chevronDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
   chevronRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  keyboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>,
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  fileText: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  arrowRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  help: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  discord: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  tiktok: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.53 1.53-.3 2.7-1.67 2.68-3.23.03-4.32.01-8.64.02-12.96z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  arrowLeft: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  circleX: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  sort: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 14v6"/></svg>,
  about: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
   verified: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
   close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
   headphones: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
   radio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>,
   circle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>,
   eyeOff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
   minimize: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>,
   sliders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
   monitor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
   contrast: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20V2z"/></svg>,
   moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
   smartphone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
   sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/><path d="M18 14l1.5 2.5L22 18l-2.5 1.5L18 22l-1.5-2.5L14 18l2.5-1.5L18 14z"/><path d="M6 14l-1.5 2.5L2 18l2.5 1.5L6 22l1.5-2.5L10 18l-2.5-1.5L6 14z"/></svg>,
   palette: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.5 1.5-1.5 0-.4-.15-.75-.4-1.02-.25-.27-.4-.62-.4-1.02 0-.93.62-1.5 1.5-1.5H17c3.31 0 6-2.69 6-6 0-5.5-4.5-10-11-10z"/></svg>,
    accessibility: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><path d="M21 10h-4l-2 12-3-6-3 6-2-12H3"/></svg>,
   check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
   book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
   customize: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
   starOutline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    backpack: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><path d="M8 14h8"/><path d="M8 17h4"/></svg>,
   globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
   forum: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
   contact: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
   mic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
   toggleLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="3"/></svg>,
   toggleRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3"/></svg>,
   activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
   layers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
   grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
   wifi: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>,
   monitorSpeaker: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M17 10l-3 3-3-3"/></svg>,
   bug: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M4 8h16"/><path d="M4 12h16"/><path d="M6 8v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M8 16v2"/><path d="M16 16v2"/></svg>,
   fingerprint: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .13-4.07-.43-6"/></svg>,
   disc3: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 8a4 4 0 0 0-4 4"/><path d="M12 4a8 8 0 0 0-8 8"/></svg>,
   gauge: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/><path d="M18.2 9.2l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06"/><path d="M4.6 19.4l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06"/><path d="M6.2 9.2l-.06-.06a2 2 0 0 0-2.83 2.83l.06.06"/><path d="M12 2v4"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M12 18v4"/></svg>,
    refreshCw: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
   trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
   shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

type PlayPhase = 'loading' | 'welcome' | 'disclaimer' | 'intro' | 'hub' | 'solo' | 'multijugador' | 'tienda' | 'eventos' | 'historia' | 'config' | 'inventario' | 'game' | 'results' | 'gameover';

const formatTime = (time: number) => {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function PlayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTrackParam = searchParams.get('track');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const difficultyRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const albumsRef = useRef<HTMLDivElement | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameFinishedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameActiveRef = useRef(false);
  const titleTrack = TRACKS_DATA[3]; // Cyber Beat - tema principal del menú
  const [hubHoveredMode, setHubHoveredMode] = useState<string | null>(null);
  const [hubError, setHubError] = useState<{title:string,desc:string} | null>(null);
  const [hubSidebarView, setHubSidebarView] = useState<'main' | 'lang'>('main');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [hubSelectedOption, setHubSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<PlayPhase>('welcome');
  const [isMounted, setIsMounted] = useState(false);
  const noteData = useMemo(() => {
    const symbols = ['♪','♫','♩','♬','♭','♮','♯','𝄞','𝄢','𝄐','⏺','▶','◀','▲','▼','◆','●','★','✦','✧'];
    const colors = ['#00d4ff','#bd00ff','#ff0088','#00ffa3'];
    const sizes = [12,16,20,24,28,32,36,40];
    const types: ('up' | 'down' | 'drift' | 'pulse')[] = ['up','up','up','up','down','down','drift','drift','pulse','pulse'];
    const speeds = [6,8,10,12,14,16,18,20,22,25];
    return Array.from({length:100},(_,i)=>({
      left: (i * 3.7 + 0.5) % 100,
      top: (i * 7.3 + 1.2) % 100,
      dur: speeds[i % speeds.length],
      delay: (i * 0.83) % 18,
      size: sizes[i % sizes.length],
      color: colors[i % colors.length],
      symbol: symbols[i % symbols.length],
      opacity: 0.1 + (i % 5) * 0.08,
      type: types[i % types.length],
      rotate: (i * 53) % 360,
    }));
  }, []);
  const { 
    isMusicPlaying, 
    playGlobalMusic, 
    pauseGlobalMusic, 
    audioInfo,
    isAudioInitialized,
    darkMode,
    setDarkMode,
    lang,
    setLang
  } = useAppStore();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [accentColors, setAccentColors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<number | null>(null);
  const [globalRecord, setGlobalRecord] = useState<{ score: number; user: string } | null>(null);
  const { isOnline: isNetworkOnline, checkConnection, startRetry, stopRetry } = useNetworkStatus();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [disconnectRetryCount, setDisconnectRetryCount] = useState(0);
  const disconnectRetryRef = useRef(0);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectMaxRetries = 10;
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const resumeCountdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar récord global de Supabase cuando cambia la canción
  useEffect(() => {
    if (!selectedTrack) return;
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from('scores')
          .select('score, user_id')
          .eq('track_id', selectedTrack.id)
          .order('score', { ascending: false })
          .limit(1);
        const topScore = data?.[0];

        if (topScore) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', topScore.user_id)
            .maybeSingle();
          setGlobalRecord({
            score: topScore.score,
            user: profile?.display_name || profile?.username || 'Leyenda'
          });
        } else {
          setGlobalRecord(null);
        }
      } catch (e) {
        setGlobalRecord(null);
      }
    };
    fetchStats();
  }, [selectedTrack?.id]);
  
  useEffect(() => {
    if (!selectedTrack || accentColors[selectedTrack.id]) return;
        extractAccentColor(trackCover(selectedTrack.id)).then(color => {
      setAccentColors(prev => ({ ...prev, [selectedTrack.id]: color }));
    });
  }, [selectedTrack?.id]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState<'general' | 'audio' | 'controls' | 'visuals' | 'offset' | 'accessibility' | 'debug'>('general');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRedesOpen, setIsRedesOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInventarioOpen, setIsInventarioOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isOtrosOpen, setIsOtrosOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const { musicVol, setMusicVol, sfxVol, setSfxVol, syncGlobalVolume, hitSound, setHitSound } = useAppStore();
  const [inputMode, setInputMode] = useState<'arrows' | 'wasd' | 'custom'>('arrows');
  const [customKeys, setCustomKeys] = useState<[string, string, string, string]>(['KeyA', 'KeyS', 'KeyW', 'KeyD']);
  const [editingKeyIndex, setEditingKeyIndex] = useState<number | null>(null);
  const [showHitZoneVisuals, setShowHitZoneVisuals] = useState(false);
  const [showAlbums, setShowAlbums] = useState(false);
  const [deathCounts, setDeathCounts] = useState<Record<string, number>>({});
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{ score: number; user: string; date: string }[]>([]);
  const [following, setFollowing] = useState<string[]>(() => {
    const saved = localStorage.getItem('play_following');
    return saved ? JSON.parse(saved) : [];
  });
  const [externalLinkUrl, setExternalLinkUrl] = useState<string | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [catMode, setCatMode] = useState(false);


  // Cargar datos reales y estados
  useEffect(() => {
    const savedDeaths = localStorage.getItem('play_deaths');
    if (savedDeaths) setDeathCounts(JSON.parse(savedDeaths));
  }, []);

  // Sincronizar volumen global cuando cambia musicVol
  useEffect(() => {
    syncGlobalVolume();
  }, [musicVol, syncGlobalVolume]);

  // Cargar plays reales desde Supabase
  useEffect(() => {
    const fetchRealPlays = async () => {
      const { data } = await supabase.from('scores').select('track_id');
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((row: { track_id: string }) => {
          counts[row.track_id] = (counts[row.track_id] || 0) + 1;
        });
        setRealPlays(counts);
      }
    };
    fetchRealPlays();
  }, []);

  // Estados de Filtros y Preferencias
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'favorites' | 'recent' | 'recommended' | 'top_likes' | 'most_played' | 'popular_day' | 'popular_week' | 'popular_month' | 'popular_year' | 'playlist'>('all');
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [isAlbumsOpen, setIsAlbumsOpen] = useState(false);
  const [albumSearch, setAlbumSearch] = useState('');
  const [showPopularSub, setShowPopularSub] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTracks, setRecentTracks] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<{ name: string; tracks: string[] }[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('play_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestId, setGuestId] = useState<string>('');
  const { user, showToast } = useAppStore();

  const [searchUser, setSearchUser] = useState('');
  const [searchUserError, setSearchUserError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLastMatchDetail, setShowLastMatchDetail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => { setIsHydrated(true); }, []);
  const [realPlays, setRealPlays] = useState<Record<string, number>>({});
  const ITEMS_PER_PAGE = 50;
  const MAX_VISIBLE_PAGES = 7;

  const [currentLevel, setCurrentLevel] = useState<LoadedLevel | null>(null);
  const [currentArrowSkin, setCurrentArrowSkin] = useState<ArrowSkinId>('default');
  const [currentParticleSkin, setCurrentParticleSkin] = useState<string>('default');
  const [scrollSpeed, setScrollSpeedState] = useState(() => {
    if (typeof window === 'undefined') return 480;
    const saved = localStorage.getItem('display_scroll_speed');
    return saved ? Number(saved) : 480;
  });
  const [audioOffset, setAudioOffsetState] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('display_audio_offset');
    return saved ? Number(saved) : 0;
  });
  const [showEarlyLate, setShowEarlyLateState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('display_show_early_late');
    return saved ? saved === 'true' : true;
  });
  const [showPrecisionMS, setShowPrecisionMSState] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('display_precision_ms');
    return saved ? saved === 'true' : false;
  });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationHits, setCalibrationHits] = useState(0);
  const [calibrationOffsets, setCalibrationOffsets] = useState<number[]>([]);
  const [detectedOffset, setDetectedOffset] = useState<number | null>(null);
  const [audioOutput, setAudioOutput] = useState(() => {
    if (typeof window === 'undefined') return 'stereo';
    const saved = localStorage.getItem('audio_output');
    return saved ? saved : 'stereo';
  });
  const [showAudioDeviceMenu, setShowAudioDeviceMenu] = useState(false);
  const [audioDevice, setAudioDevice] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(() => { if (typeof window !== 'undefined') return Number(localStorage.getItem('audio_mic_vol')) || 80; return 80; });

  const { gameState, startGame, stopGame, togglePause, handleInput, setShowHitZones, setShowEarlyLate: setShowEarlyLateEngine, setMsPrecision, setArrowSkin, setParticleSkin, setScrollSpeed, setAudioOffset } = useGameEngine(
    canvasRef,
    currentLevel?.config ?? null,
    currentLevel?.chart ?? null,
    currentLevel?.events?.events ?? [],
    musicVol / 100
  );

  // Visual & Accessibility settings
  const [audioInputDevice, setAudioInputDevice] = useState<string | null>(() => typeof window !== 'undefined' ? localStorage.getItem('audio_input_device') : null);
  const [audioDeviceList, setAudioDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [inputDeviceList, setInputDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [showAudioDeviceDropdown, setShowAudioDeviceDropdown] = useState(false);
  const [showInputDeviceDropdown, setShowInputDeviceDropdown] = useState(false);
  // hitSound moved to useAppStore
  const [graphicsQuality, setGraphicsQuality] = useState<'very_low' | 'low' | 'medium' | 'high' | 'ultra'>(() => { if (typeof window !== 'undefined') return (localStorage.getItem('graphics_quality') as any) || 'high'; return 'high'; });
  const [disableGlow, setDisableGlow] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('graphics_disable_glow') === 'true'; return false; });
  const [disableBgEffects, setDisableBgEffects] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('graphics_disable_bg') === 'true'; return false; });
  const [disableFloatingIcons, setDisableFloatingIcons] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('graphics_disable_floating') === 'true'; return false; });
  const [showDebug, setShowDebug] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('debug_enabled') === 'true'; return false; });
  const [debugShowFps, setDebugShowFps] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('debug_show_fps') === 'true'; return true; });
  const [debugShowPing, setDebugShowPing] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('debug_show_ping') === 'true'; return true; });
  const [debugShowLatency, setDebugShowLatency] = useState(() => { if (typeof window !== 'undefined') return localStorage.getItem('debug_show_latency') === 'true'; return true; });
  const [debugShowInfoPanel, setDebugShowInfoPanel] = useState(false);
  const [debugFps, setDebugFps] = useState(0);
  const [debugPing, setDebugPing] = useState(0);
  const [debugLatency, setDebugLatency] = useState(0);
  const debugFrameRef = useRef<number>(0);
  const debugFrameCount = useRef(0);
  const debugLastTime = useRef(performance.now());
  const debugPanelRef = useRef<HTMLDivElement | null>(null);
  const [debugPanelPos, setDebugPanelPos] = useState({ x: 20, y: 20 });
  const [draggingDebug, setDraggingDebug] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [graphicsAutoDetecting, setGraphicsAutoDetecting] = useState(false);

  const [colorblindMode, setColorblindMode] = useState(() => {
    if (typeof window === 'undefined') return 'none';
    return localStorage.getItem('display_colorblind_mode') || 'none';
  });
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('display_high_contrast') === 'true';
  });
  const [tactileControls, setTactileControls] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('display_tactile') === 'true';
  });

  const screenFilter = useMemo(() => {
    let filter = '';
    if (colorblindMode === 'protanopia') filter = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27cb%27%3E%3CfeColorMatrix type=%27matrix%27 values=%270.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0%27/%3E%3C/filter%3E%3C/svg%3E#cb")';
    else if (colorblindMode === 'deuteranopia') filter = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27cb%27%3E%3CfeColorMatrix type=%27matrix%27 values=%270.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0%27/%3E%3C/filter%3E%3C/svg%3E#cb")';
    else if (colorblindMode === 'tritanopia') filter = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27cb%27%3E%3CfeColorMatrix type=%27matrix%27 values=%270.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0%27/%3E%3C/filter%3E%3C/svg%3E#cb")';
    else if (colorblindMode === 'achromatopsia') filter = 'grayscale(1)';
    if (highContrast) filter += ' contrast(1.5) brightness(1.1)';
    return filter;
  }, [colorblindMode, highContrast]);

  // Cleanup global music when leaving /play
  useEffect(() => {
    return () => { pauseGlobalMusic(); };
  }, [pauseGlobalMusic]);

  // Inicialización y comprobación del Disclaimer local
  useEffect(() => {
    const savedMode = localStorage.getItem('input_mode');
    if (savedMode) setInputMode(savedMode as 'arrows' | 'wasd' | 'custom');
    const savedCustom = localStorage.getItem('custom_keys');
    if (savedCustom) {
      try { setCustomKeys(JSON.parse(savedCustom)); } catch (e) {}
    }

    const savedFavs = localStorage.getItem('play_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    const savedRecents = localStorage.getItem('play_recent');
    if (savedRecents) setRecentTracks(JSON.parse(savedRecents));
    
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const savedGuest = localStorage.getItem('play_guest_name');
    if (savedGuest) {
      setGuestName(savedGuest);
      setGuestId('@' + savedGuest.toLowerCase());
    } else {
      const randomId = Math.floor(100000 + Math.random() * 900000).toString();
      const name = 'Invitado' + randomId;
      localStorage.setItem('play_guest_name', name);
      setGuestName(name);
      setGuestId('@' + name.toLowerCase());
    }
  }, []);

  // Sincronizar display settings con el engine y persistir
  useEffect(() => { setScrollSpeed(scrollSpeed); localStorage.setItem('display_scroll_speed', String(scrollSpeed)); }, [scrollSpeed, setScrollSpeed]);
  useEffect(() => { setAudioOffset(audioOffset); localStorage.setItem('display_audio_offset', String(audioOffset)); }, [audioOffset, setAudioOffset]);
  useEffect(() => { setShowEarlyLateEngine(showEarlyLate); localStorage.setItem('display_show_early_late', String(showEarlyLate)); }, [showEarlyLate, setShowEarlyLateEngine]);
  useEffect(() => { setMsPrecision(showPrecisionMS); localStorage.setItem('display_precision_ms', String(showPrecisionMS)); }, [showPrecisionMS, setMsPrecision]);
  useEffect(() => { localStorage.setItem('play_playlists', JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem('play_following', JSON.stringify(following)); }, [following]);

  // Reset page to 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, selectedDifficulties, selectedAlbums, searchUser]);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setIsFiltersOpen(false);
        setShowPopularSub(false);
      }
      if (difficultyRef.current && !difficultyRef.current.contains(e.target as Node)) {
        setIsDifficultyOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (albumsRef.current && !albumsRef.current.contains(e.target as Node)) {
        setIsAlbumsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle track selection from URL param (e.g., from library "JUGAR AHORA")
  useEffect(() => {
    const param = searchParams.get('track');
    if (param) {
      const track = TRACKS_DATA.find(t => t.id === param);
      if (track) setSelectedTrack(track);
      setPhase('solo');
    }
  }, []);

  // --- AUDIO INTRO (GLOBAL SYNC) ---
  useEffect(() => {
    if (!isMounted) return;
    
    const introPhases = ['welcome', 'disclaimer', 'intro', 'hub', 'solo', 'multijugador', 'tienda', 'eventos', 'historia', 'config', 'inventario'];
    if (!introPhases.includes(phase)) {
      if (isMusicPlaying) pauseGlobalMusic();
    } else {
      if (!isMusicPlaying) playGlobalMusic();
    }
  }, [phase, isMounted, isMusicPlaying, pauseGlobalMusic, playGlobalMusic]);

  // Reset hub sidebar when leaving hub
  useEffect(() => {
    if (phase !== 'hub') {
      setHubSidebarView('main');
    }
  }, [phase]);

  // Audio device detection
  useEffect(() => {
    const detectDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDeviceList(devices.filter(d => d.kind === 'audiooutput'));
        setInputDeviceList(devices.filter(d => d.kind === 'audioinput'));
      } catch {}
    };
    detectDevices();
    navigator.mediaDevices?.addEventListener('devicechange', detectDevices);
    return () => navigator.mediaDevices?.removeEventListener('devicechange', detectDevices);
  }, []);

  // Debug FPS counter & ping sim
  useEffect(() => {
    if (!showDebug) {
      setDebugFps(0); setDebugPing(0); setDebugLatency(0);
      return;
    }
    let running = true;
    const frame = () => {
      if (!running) return;
      debugFrameCount.current++;
      const now = performance.now();
      if (now - debugLastTime.current >= 1000) {
        setDebugFps(debugFrameCount.current);
        debugFrameCount.current = 0;
        debugLastTime.current = now;
        const ping = Math.round(Math.random() * 20 + 10);
        setDebugPing(ping);
        setDebugLatency(Math.round(ping * 0.8 + Math.random() * 5));
      }
      debugFrameRef.current = requestAnimationFrame(frame);
    };
    debugFrameRef.current = requestAnimationFrame(frame);
    return () => { running = false; cancelAnimationFrame(debugFrameRef.current); };
  }, [showDebug]);

  const toggleFavorite = (id: string) => {
    if (!user) {
      setIsAuthWarningOpen(true);
      return;
    }
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('play_favorites', JSON.stringify(newFavs));
  };

  const toggleLike = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (!user) {
      if (document.fullscreenElement) document.exitFullscreen();
      setIsAuthWarningOpen(true);
      return;
    }
    
    try {
      const { data: existing } = await supabase
        .from('track_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .maybeSingle();

      if (existing) {
        await supabase.from('track_likes').delete().eq('id', existing.id);
        showToast('Like eliminado');
      } else {
        await supabase.from('track_likes').insert({ user_id: user.id, track_id: trackId });
        showToast('¡Track calificado positivamente!');
      }
      
      toggleFavorite(trackId);
    } catch (err) {
      console.error('Error toggling like:', err);
      toggleFavorite(trackId);
      showToast('¡Track calificado! (Local)');
    }
  };

  const handleAcceptDisclaimer = () => {
    playGlobalMusic();
    const hasConfiguredKeys = localStorage.getItem('input_mode');
    const hasSeenIntro = localStorage.getItem('play_intro_seen');

    if (hasConfiguredKeys && hasSeenIntro) {
      setPhase('hub');
    } else {
      setPhase('intro');
    }
  };

  const handleFinishIntro = () => {
    localStorage.setItem('play_intro_seen', 'true');
    setPhase('hub');
  };

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    setPlaylists(prev => [...prev, { name: name.trim(), tracks: [] }]);
    setNewPlaylistName('');
  };
  const deletePlaylist = (name: string) => {
    setPlaylists(prev => prev.filter(p => p.name !== name));
    if (selectedPlaylist === name) setSelectedPlaylist(null);
  };
  const addTrackToPlaylist = (playlistName: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.name === playlistName && !p.tracks.includes(trackId)
        ? { ...p, tracks: [...p.tracks, trackId] }
        : p
    ));
  };
  const removeTrackFromPlaylist = (playlistName: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.name === playlistName ? { ...p, tracks: p.tracks.filter(t => t !== trackId) } : p
    ));
  };
  const toggleTrackInPlaylist = (playlistName: string, trackId: string) => {
    const pl = playlists.find(p => p.name === playlistName);
    if (!pl) return;
    if (pl.tracks.includes(trackId)) removeTrackFromPlaylist(playlistName, trackId);
    else addTrackToPlaylist(playlistName, trackId);
  };

  const saveInputMode = (mode: 'arrows' | 'wasd' | 'custom') => {
    setInputMode(mode);
    localStorage.setItem('input_mode', mode);
  };

  // Listener para capturar y asignar la nueva tecla
  useEffect(() => {
    if (editingKeyIndex === null) return;
    const handleKeyAssign = (e: KeyboardEvent) => {
      e.preventDefault();
      const newKeys = [...customKeys] as [string, string, string, string];
      newKeys[editingKeyIndex] = e.code;
      setCustomKeys(newKeys);
      localStorage.setItem('custom_keys', JSON.stringify(newKeys));
      setEditingKeyIndex(null);
    };
    window.addEventListener('keydown', handleKeyAssign, { once: true });
    return () => window.removeEventListener('keydown', handleKeyAssign);
  }, [editingKeyIndex, customKeys]);

  const [retryKey, setRetryKey] = useState(0);

  const handleStartGame = (trackOverride?: Track | null) => {
    const track = trackOverride || selectedTrack;
    if (!track) return;
    
    // Clear any stale timers from previous games
    if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
    if (gameFinishedTimeoutRef.current) { clearTimeout(gameFinishedTimeoutRef.current); gameFinishedTimeoutRef.current = null; }
    
    stopGame();
    gameActiveRef.current = true;
    setSelectedTrack(track);
    setLoadError(null);
    const level = getLevel(track.id);
    if (!level) {
      setLoadError('No se pudo cargar el nivel. Es posible que los archivos de datos estén corruptos o faltantes.');
      setPhase('game');
      setIsLoading(false);
      return;
    }
    setCurrentLevel(null as any);
    setRetryKey(k => k + 1);
    loadingTimeoutRef.current = setTimeout(() => {
      setCurrentLevel(level);
    }, 50);
    
    const newRecent = [track.id, ...recentTracks.filter(id => id !== track.id)].slice(0, 10);
    setRecentTracks(newRecent);
    localStorage.setItem('play_recent', JSON.stringify(newRecent));
    
    setPhase('game');
    setIsLoading(true);
    setResumeCountdown(null);
    
    // Store level/chart for delayed start in unified countdown
    const notes = level.chart.notes.map((n, i) => ({
      time: n.time,
      lane: n.lane,
      type: n.type,
      id: `n_${i}`,
    }));
    pendingGameDataRef.current = { notes, level };
    countdownPurposeRef.current = 'start';
    
    // Show loading for 800ms then start countdown (reuse unified resumeCountdown system)
    loadingTimeoutRef.current = setTimeout(() => {
      if (!gameActiveRef.current) return;
      setIsLoading(false);
      setResumeCountdown(3);
    }, 800);
  };

  const handleResume = useCallback(() => {
    if (resumeCountdown !== null) {
      if (resumeCountdownTimerRef.current) { clearTimeout(resumeCountdownTimerRef.current); resumeCountdownTimerRef.current = null; }
      resumeCountdownCancelRef.current = true;
      setResumeCountdown(null);
      countdownPurposeRef.current = 'start';
      pendingGameDataRef.current = null;
      return;
    }
    countdownPurposeRef.current = 'resume';
    setResumeCountdown(3);
  }, [resumeCountdown, setResumeCountdown]);

  // Countdown effect using refs to avoid stale closures
  const togglePauseRef = useRef(togglePause);
  togglePauseRef.current = togglePause;
  const isPausedRef_ = useRef(gameState.isPaused);
  isPausedRef_.current = gameState.isPaused;
  const isPlayingRefCheck = useRef(gameState.isPlaying);
  isPlayingRefCheck.current = gameState.isPlaying;
  const resumeCountdownCancelRef = useRef(false);
  const countdownPurposeRef = useRef<'start' | 'resume'>('start');
  const pendingGameDataRef = useRef<{ notes: GameNote[]; level: LoadedLevel } | null>(null);
  const startGameRef = useRef(startGame);
  startGameRef.current = startGame;

  useEffect(() => {
    if (resumeCountdown === null) return;
    resumeCountdownCancelRef.current = false;
    const delay = resumeCountdown === 0 ? 600 : 1000;
    const timer = setTimeout(() => {
      if (resumeCountdownCancelRef.current) return;
      if (resumeCountdown === 0) {
        const purpose = countdownPurposeRef.current;
        setResumeCountdown(null);
        countdownPurposeRef.current = 'start';
        if (purpose === 'resume') {
          if (isPausedRef_.current && isPlayingRefCheck.current) togglePauseRef.current();
        } else if (purpose === 'start') {
          // Start the game engine after countdown
          const data = pendingGameDataRef.current;
          if (data) {
            startGameRef.current(data.notes);
            pendingGameDataRef.current = null;
            if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
          }
        }
      } else {
        setResumeCountdown(prev => prev !== null ? Math.max(0, prev - 1) : null);
      }
    }, delay);
    resumeCountdownTimerRef.current = timer;
    return () => { clearTimeout(timer); resumeCountdownTimerRef.current = null; };
  }, [resumeCountdown]);

  const handleAbortGame = () => {
    gameActiveRef.current = false;
    if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
    if (gameFinishedTimeoutRef.current) { clearTimeout(gameFinishedTimeoutRef.current); gameFinishedTimeoutRef.current = null; }
    stopGame();
    playGlobalMusic();
    setPhase('solo');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleStartClick = (withFullscreen: boolean) => {
    const isCurrentlyFull = !!document.fullscreenElement;
    if (withFullscreen) {
      if (!isCurrentlyFull) toggleFullscreen();
    } else {
      if (isCurrentlyFull) document.exitFullscreen();
    }
    
    if (!isMusicPlaying) playGlobalMusic();

    setPhase('disclaimer');
  };

  const handleGameFinished = () => {
    if (!gameActiveRef.current) return;
    gameActiveRef.current = false;
    stopGame();
    if (!selectedTrack) return;
    const isFail = gameState.life <= 0;

    const saveScore = async () => {
      if (isFail) {
        const newDeaths = { ...deathCounts, [selectedTrack.id]: (deathCounts[selectedTrack.id] || 0) + 1 };
        setDeathCounts(newDeaths);
        localStorage.setItem('play_deaths', JSON.stringify(newDeaths));
      }

      if (user && !isFail) {
        try {
          const { error: submitError } = await supabase.rpc('submit_game_score', {
            p_track_id: selectedTrack.id,
            p_score: gameState.score,
            p_combo: gameState.maxCombo,
            p_accuracy: gameState.accuracy,
            p_grade: getGrade(gameState.accuracy).rank,
            p_max_combo: gameState.maxCombo,
            p_perfect: gameState.hits.perfect,
            p_great: gameState.hits.great,
            p_good: gameState.hits.good,
            p_miss: gameState.hits.miss
          });

          if (submitError) {
             console.error('Error submitting secure score:', submitError);
          }
        } catch (err) {
          console.error('Error saving score:', err);
        }
      }

      const storedBest = localStorage.getItem(`record_${selectedTrack.id}`);
      if (!storedBest || gameState.score > parseInt(storedBest, 10)) {
        localStorage.setItem(`record_${selectedTrack.id}`, gameState.score.toString());
      }
      
      localStorage.setItem('play_last_player', guestName);
      localStorage.setItem(`last_match_${selectedTrack.id}`, JSON.stringify({
        score: gameState.score,
        maxPotentialScore: gameState.maxPotentialScore,
        maxCombo: gameState.maxCombo,
        accuracy: gameState.accuracy,
        progress: gameState.progress,
        notesHit: gameState.notesHit,
        totalNotes: gameState.totalNotes,
        mistakes: gameState.mistakes,
        life: gameState.life,
        kps: gameState.kps,
        deaths: gameState.deaths,
        hits: gameState.hits,
        date: new Date().toISOString()
      }));
    };

    saveScore();
    setPhase('results');
  };

  const getRecord = (trackId: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`record_${trackId}`) || '0';
    }
    return '0';
  };

  const getStarColor = (stars: number) => {
    if (stars >= 20) return '#FF0055';
    if (stars >= 12) return '#BD00FF';
    if (stars >= 5) return '#00D4FF';
    return '#00FFA3';
  };

  const getLastMatch = (trackId: string) => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`last_match_${trackId}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const filteredTracks = TRACKS_DATA.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(track.difficulty);
    const matchesAlbum = selectedAlbums.length === 0 || selectedAlbums.includes(track.album);
    
    const matchesUser = !searchUser || track.artist.toLowerCase().includes(searchUser.toLowerCase().replace('@', ''));
    
    let matchesCategory = true;
    if (filterCategory === 'favorites') matchesCategory = favorites.includes(track.id);
    else if (filterCategory === 'recent') matchesCategory = recentTracks.includes(track.id);
    else if (filterCategory === 'recommended') matchesCategory = track.stars > 10;
    else if (filterCategory === 'playlist') matchesCategory = selectedPlaylist
      ? (playlists.find(p => p.name === selectedPlaylist)?.tracks.includes(track.id) ?? false)
      : true;
    
    return matchesSearch && matchesDifficulty && matchesAlbum && matchesCategory && matchesUser;
  }).sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1;
    
    if (filterCategory === 'top_likes') return (b.likes - a.likes) * factor;
    if (filterCategory === 'most_played') return (b.plays - a.plays) * factor;
    
    return (a.stars - b.stars) * factor;
  });

  const groupedTracks = filteredTracks.reduce((acc, track) => {
    if (!acc[track.album]) acc[track.album] = [];
    acc[track.album].push(track);
    return acc;
  }, {} as Record<string, Track[]>);

  const albumNames = Object.keys(groupedTracks).sort((a, b) => a.localeCompare(b));

  const totalPages = Math.ceil(filteredTracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = filteredTracks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if ((e.key === 'Escape' || e.key === 'Enter') && phase === 'game') {
        if (resumeCountdown !== null) {
          if (resumeCountdownTimerRef.current) { clearTimeout(resumeCountdownTimerRef.current); resumeCountdownTimerRef.current = null; }
          resumeCountdownCancelRef.current = true;
          setResumeCountdown(null);
          if (countdownPurposeRef.current === 'start' && pendingGameDataRef.current) {
            const data = pendingGameDataRef.current;
            startGameRef.current(data.notes);
            pendingGameDataRef.current = null;
            if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
            togglePauseRef.current();
          }
          return;
        } else if (gameState.isPaused) {
          handleResume();
        } else {
          togglePause();
        }
        return;
      }
      if (phase === 'game') {
        e.preventDefault();
      } else if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const keysWASD: Record<string, number> = { KeyD: 0, KeyS: 1, KeyW: 2, KeyA: 3 };
      const keysArrows: Record<string, number> = { ArrowRight: 0, ArrowDown: 1, ArrowUp: 2, ArrowLeft: 3 };
      const keysCustom: Record<string, number> = { [customKeys[0]]: 0, [customKeys[1]]: 1, [customKeys[2]]: 2, [customKeys[3]]: 3 };
      
      const activeKeys = inputMode === 'wasd' ? keysWASD : inputMode === 'custom' ? keysCustom : keysArrows;
      if (activeKeys[e.code] !== undefined) {
        handleInput(activeKeys[e.code]);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, inputMode, customKeys, togglePause, handleInput, resumeCountdown, setResumeCountdown, handleResume, gameState.isPaused]);

  useEffect(() => {
    if (phase === 'game' && gameState.isPlaying && !gameState.isPaused && countdown === null && selectedTrack) {
      const endTime = (currentLevel?.config.durationSec ?? selectedTrack.duration_sec) + 3;
      gameFinishedTimeoutRef.current = setTimeout(() => {
        handleGameFinished();
      }, endTime * 1000);
      
      return () => {
        if (gameFinishedTimeoutRef.current) {
          clearTimeout(gameFinishedTimeoutRef.current);
          gameFinishedTimeoutRef.current = null;
        }
      };
    }
    if (gameState.isGameOver && phase === 'game') {
      if (gameFinishedTimeoutRef.current) {
        clearTimeout(gameFinishedTimeoutRef.current);
        gameFinishedTimeoutRef.current = null;
      }
      handleGameFinished();
    }
  }, [phase, gameState.isPlaying, gameState.isPaused, gameState.isGameOver, countdown, currentLevel]);

  // Network detection during gameplay
  useEffect(() => {
    if (phase !== 'game' || !gameState.isPlaying) return;
    if (!isNetworkOnline) {
      setIsDisconnected(true);
      disconnectRetryRef.current = 0;
      setDisconnectRetryCount(0);
      if (!gameState.isPaused) togglePause();
    }
  }, [phase, gameState.isPlaying, isNetworkOnline]);

  // Auto-retry: independent loop, runs as long as isDisconnected
  useEffect(() => {
    if (!isDisconnected || phase !== 'game') return;

    const doRetry = async () => {
      if (disconnectRetryRef.current >= disconnectMaxRetries) {
        setIsDisconnected(false);
        handleAbortGame();
        return;
      }
      setDisconnectRetryCount(disconnectRetryRef.current + 1);
      const delay = Math.min(2000 * Math.pow(1.5, disconnectRetryRef.current), 15000);
      disconnectRetryRef.current++;
      disconnectTimerRef.current = setTimeout(async () => {
        const ok = await checkConnection();
        if (ok) {
          setIsDisconnected(false);
          disconnectRetryRef.current = 0;
          setDisconnectRetryCount(0);
          if (gameState.isPaused) togglePause();
        } else {
          doRetry();
        }
      }, delay);
    };

    doRetry();

    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    };
  }, [isDisconnected, phase]);

  // Auto-pause on tab leave / window blur / click outside game
  useEffect(() => {
    const handlePause = () => {
      if (phase === 'game' && gameState.isPlaying && !gameState.isPaused) {
        togglePause();
      }
    };
    const onVisibility = () => { if (document.hidden) handlePause(); };
    const onClickOutside = (e: MouseEvent) => {
      if (phase !== 'game' || !gameState.isPlaying || gameState.isPaused) return;
      const target = e.target as HTMLElement;
      if (!gameContainerRef.current || !gameContainerRef.current.contains(target)) {
        handlePause();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', handlePause);
    document.addEventListener('mousedown', onClickOutside, true);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', handlePause);
      document.removeEventListener('mousedown', onClickOutside, true);
    };
  }, [phase, gameState.isPlaying, gameState.isPaused]);

  const renderTrackCard = (track: Track) => {
    const isSelected = selectedTrack?.id === track.id;
    const isNew = new Date(track.release_date) > new Date('2026-03-01');

    const diffColor = track.difficulty === 'Expert' ? '#FF0055' :
      track.difficulty === 'Hard' ? '#BD00FF' :
      track.difficulty === 'Normal' ? '#00D4FF' :
      '#00FFA3';

    return (
      <div key={track.id} className="relative group">
        <div
          onClick={() => setSelectedTrack(selectedTrack?.id === track.id ? null : track)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedTrack(selectedTrack?.id === track.id ? null : track)}
          className={`w-full p-3 rounded-[2rem] border transition-all flex items-center gap-3 relative overflow-hidden cursor-pointer ${
            isSelected 
            ? 'bg-black transform scale-[1.01]' 
            : 'bg-black/80 border-white/5 hover:border-white/20 hover:bg-white/10'
          }`}
          style={isSelected && accentColors[track.id] ? { borderColor: accentColors[track.id], boxShadow: `0 0 20px ${accentColors[track.id]}44` } : undefined}
        >
          <div className="w-12 h-12 flex-shrink-0 relative group/tc">
            <img src={trackDisc(track.id)} alt=""
              className={`absolute inset-0 w-full h-full -translate-y-1 z-0 transition-all duration-500 ease-out group-hover/tc:-translate-y-2 group-hover/tc:z-20 ${isSelected && isMusicPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
            <img src={trackCover(track.id)} alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-500 ease-out z-10 shadow-lg group-hover/tc:opacity-15"
            />
            {isNew && (
              <div className="absolute -top-2 -right-2 bg-neon-cyan text-black text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.8)] animate-pulse z-30">
                NEW
              </div>
            )}
          </div>

          <div className="flex-1 text-left min-w-0">
            <h3 className={`text-sm md:text-base font-header font-black uppercase italic tracking-tight truncate flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
              <div className="w-3.5 h-3.5 shrink-0 text-gray-500">{I.music}</div>
              {track.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <div className="w-2.5 h-2.5">{I.album}</div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedAlbums([track.album]); }}
                className="text-[8px] text-gray-600 font-bold uppercase tracking-wider hover:text-neon-cyan transition-colors"
              >{track.album}</button>
              <span className="text-gray-700 text-[6px]">•</span>
              <div className="w-2.5 h-2.5 text-gray-500">{I.disc}</div>
              <span className="text-[8px] text-gray-500 font-bold">
                <Link href="/profile/@ciszukoantony_" className="hover:text-neon-blue transition-colors">{track.artist}</Link>
              </span>
              <span className="text-gray-700 text-[6px]">•</span>
              <div className="w-2.5 h-2.5 text-gray-500">{I.user}</div>
              <span className="text-[8px] text-gray-600 font-bold">
                <Link href="/profile/@muzicmania" className="hover:text-neon-cyan transition-colors">MuzicMania</Link>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span className="flex items-center gap-1 text-[8px] text-gray-500 font-bold">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diffColor }} />
                {track.difficulty}
              </span>
              <div className="flex">
                {Array.from({length: Math.min(Math.ceil(track.stars / 4), 5)}).map((_, i) => (
                  <div key={i} className="w-2 h-2" style={{ color: getStarColor(track.stars) }}>{I.star}</div>
                ))}
              </div>
              <span className="text-gray-700 text-[6px]">•</span>
              <span className="flex items-center gap-1 text-[8px] text-gray-500 font-bold">
                <div className="w-2.5 h-2.5">{I.clock}</div>
                {track.duration}
              </span>
              <span className="text-gray-700 text-[6px]">•</span>
              <span className="flex items-center gap-1 text-[8px] text-neon-blue font-bold">
                <div className="w-2.5 h-2.5">{I.music}</div>
                {track.bpm}
              </span>
              <span className="text-gray-700 text-[6px]">•</span>
              <span className="flex items-center gap-1 text-[8px] text-neon-pink font-bold">
                <div className="w-2.5 h-2.5">{I.heart}</div>
                {track.likes}
              </span>
              <span className="text-gray-700 text-[6px]">•</span>
              <span className="flex items-center gap-1 text-[8px] text-neon-blue font-bold">
                <div className="w-2.5 h-2.5">{I.play}</div>
                {(realPlays[track.id] || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-2 border-l border-white/10 pl-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleStartGame(track); }}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${
                isSelected
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                  : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white hover:bg-white/5'
              }`}
              title="Jugar"
            >
              <div className="w-5 h-5">{I.play}</div>
            </button>

            <button 
              onClick={(e) => toggleLike(e, track.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-90 relative z-30 ${
                favorites.includes(track.id)
                  ? 'border-neon-pink text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,0,128,0.3)]'
                  : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white hover:bg-white/5'
              }`}
              title="Calificar track"
            >
              <div className="w-5 h-5">{I.heart}</div>
            </button>

            {playlists.length > 0 && (
              <div className="relative group/plist">
                <button
                  className="p-2 rounded-full text-gray-700 hover:text-neon-cyan transition-all"
                  title="Añadir a playlist"
                >
                  <div className="w-3 h-3">{I.album}</div>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-xl py-1 min-w-[140px] shadow-2xl opacity-0 invisible group-hover/plist:opacity-100 group-hover/plist:visible transition-all z-50">
                  {playlists.map(pl => {
                    const inPlaylist = pl.tracks.includes(track.id);
                    return (
                      <button
                        key={pl.name}
                        onClick={() => { toggleTrackInPlaylist(pl.name, track.id); }}
                        className={`w-full text-left px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                          inPlaylist ? 'text-neon-cyan bg-neon-cyan/5' : 'text-gray-500 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full border ${inPlaylist ? 'bg-neon-cyan border-neon-cyan' : 'border-gray-600'}`} />
                        {pl.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) document.body.classList.add('is-fullscreen');
      else document.body.classList.remove('is-fullscreen');
    };
    
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.body.classList.remove('is-fullscreen');
    };
  }, []);

  const handleExternalLink = (url: string | null, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (url) setExternalLinkUrl(url);
  };

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
  };

  if (phase === 'loading') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.1)_0%,transparent_70%)] animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <motion.div 
            animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 border-t-2 border-r-2 border-neon-cyan rounded-full drop-shadow-neon-cyan"
          />
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-header font-black text-white italic tracking-[0.5em] animate-pulse">MUZICMANIA <span className="text-neon-cyan">2.0</span></h2>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-neon-cyan to-neon-purple shadow-[0_0_15px_rgba(0,212,255,0.8)]"
              />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Inicializando Protocolos de Sincronización...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
        <div 
          ref={gameContainerRef} 
          className="w-full flex items-center justify-center bg-black relative" 
          style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 80px)', filter: screenFilter }}
      >
        <div 
          className={`relative flex flex-col overflow-hidden bg-black transition-all duration-300 w-full h-full max-w-[1920px] mx-auto ${!isFullscreen ? 'md:rounded-[2rem] md:border border-white/5 md:shadow-2xl' : ''}`}
        >
               <style>{`
              @keyframes ml { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              @keyframes mr { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
              @keyframes stripIn { 0%{opacity:0} 100%{opacity:0.14} }
            `}</style>
          {/* Dynamic Animated Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {(phase === 'solo' || phase === 'multijugador') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-black"
              >
                {!disableBgEffects && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/20 via-transparent to-neon-purple/20 pointer-events-none" />
                    {/* Grid overlay - synthwave square grid */}
                    <div className="absolute inset-0 opacity-[0.5] pointer-events-none"
                      style={{
                        backgroundImage:'linear-gradient(rgba(0,212,255,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(189,0,255,0.1) 1px,transparent 1px)',
                        backgroundSize:'45px 45px',
                        WebkitMask:'linear-gradient(to bottom,transparent,#000 10%,#000 90%,transparent),linear-gradient(to right,transparent,#000 5%,#000 95%,transparent)',
                        mask:'linear-gradient(to bottom,transparent,#000 10%,#000 90%,transparent),linear-gradient(to right,transparent,#000 5%,#000 95%,transparent)',
                        WebkitMaskComposite:'intersect',
                        maskComposite:'intersect',
                      }}
                    />
                    <div className="absolute inset-0 opacity-[0.12] pointer-events-none"
                      style={{
                        backgroundImage:'linear-gradient(rgba(255,255,255,0.06) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,0.04) 2px,transparent 2px)',
                        backgroundSize:'135px 135px',
                      }}
                    />
                  </>
                )}
                
                {!disableFloatingIcons && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {isMounted && noteData.map((n,i)=>(
                      <motion.div
                        key={i}
                        className="absolute pointer-events-none select-none font-black"
                        style={{ left:`${n.left}%` }}
                        initial={{ y: '110%', opacity: 0, scale: 0.3 }}
                        animate={{
                          y: '-120%',
                          opacity: [0, n.opacity, n.opacity*0.8, 0],
                          scale: [0.3, 1, 1, 0.5],
                        }}
                        transition={{
                          duration: n.dur,
                          repeat: Infinity,
                          delay: n.delay,
                          ease: 'linear',
                        }}
                      >
                        <div
                          style={{
                            fontSize:n.size,
                            color:n.color,
                            textShadow:'0 0 20px currentColor,0 0 40px currentColor',
                            filter:'drop-shadow(0 0 8px currentColor)',
                          }}
                          >{catMode ? '🐱' : n.symbol}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {!disableBgEffects && (
                  <>
                    {Array.from({length:24}).map((_,ri)=>(
                      <div key={ri} className="absolute w-full"
                        style={{
                          top:`${-15+ri*(150/23)}%`,
                          height:'8%',
                          transform:'rotate(25deg)',
                          opacity:0,
                          animation:`stripIn 0.4s ${ri*0.04}s ease-out forwards`,
                          willChange:'transform',
                          backfaceVisibility:'hidden',
                        }}
                      >
                        <div className="h-full flex whitespace-nowrap items-center w-[200%]"
                          style={{
                            animation:`${ri%2===0?'ml':'mr'} ${24+ri*0.25}s linear infinite`,
                            animationDelay:`${-ri*0.4}s`,
                            willChange:'transform',
                            backfaceVisibility:'hidden',
                          }}
                        >
                          {Array.from({length:5}).map((_,ci)=>(
                            <span key={ci} className="flex items-center gap-3 mx-12 shrink-0 h-[85%]">
                              <img src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
                                alt="" className="h-full w-auto brightness-0 invert"
                              />
                              <img src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')}
                                alt="" className="h-[55%] w-auto brightness-0 invert"
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/80 via-neon-purple/80 to-neon-pink/80 pointer-events-none" style={{mixBlendMode:'color'}} />
                  </>
                )}
              </motion.div>
            )}
             {phase === 'game' && <div className="absolute inset-0 bg-black/90 z-10 transition-colors duration-1000" />}
            {phase === 'game' && !disableGlow && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[200px] animate-pulse transition-colors duration-1000"
                style={selectedTrack && accentColors[selectedTrack.id] ? { backgroundColor: `${accentColors[selectedTrack.id]}1A` } : { backgroundColor: 'rgba(128,0,255,0.05)' }}
              />
            )}
          </div>

          <div className="relative z-10 w-full h-full flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
          
          {/* --- WELCOME PHASE --- */}
          {phase === 'welcome' && (
            <motion.div key="welcome" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6"
              onClick={() => { if (!isMusicPlaying) playGlobalMusic(); }}
            >
              
              {/* Song Information Toast */}
              <AnimatePresence>
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="absolute top-8 left-8 z-[60] bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-xl flex items-center gap-3"
                >
                  <div className="w-14 h-14 shrink-0 relative group/disc cursor-pointer" onClick={() => router.push(`/library?track=${selectedTrack?.id || titleTrack.id}`)}>
                    <img src={trackDisc(selectedTrack?.id || titleTrack.id)} alt=""
                      className="absolute inset-0 w-full h-full -translate-y-2 z-0 transition-all duration-500 ease-out group-hover/disc:-translate-y-4 group-hover/disc:z-20"
                    />
                    <img src={trackCover(selectedTrack?.id || titleTrack.id)} alt=""
                      className="absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-500 ease-out z-10 shadow-lg group-hover/disc:opacity-15"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[7px] text-neon-cyan font-black uppercase tracking-[0.2em]">SONANDO AHORA...</div>
                    <div className="text-white font-header font-black text-xs uppercase italic tracking-wider leading-tight truncate max-w-[180px] flex items-center gap-1.5 cursor-pointer hover:text-neon-cyan" onClick={() => router.push(`/library?track=${selectedTrack?.id || titleTrack.id}`)}>
                      <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                      {titleTrack.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-gray-400 font-black uppercase text-[8px] tracking-wider">Autor:</span>
                      <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[8px] tracking-wider hover:text-neon-blue">Ciszuko Antony</Link>
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span className="text-gray-400 font-black uppercase text-[8px] tracking-wider">Subido Por:</span>
                      <Link href="/profile/@muzicmania" className="text-white font-bold text-[8px] tracking-wider hover:text-neon-cyan">MuzicMania</Link>
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Background Elements (Ultra Reactive) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(40,0,90,0.45)_0%,rgba(0,10,30,0.2)_60%,transparent_100%)]" />
                
                {/* Neon Spectrogram Visualizer */}
                <div className="absolute bottom-0 left-0 w-full h-48 opacity-15">
                  <MusicVisualizer 
                    className="w-full h-full" 
                    barColor="#00d4ff" 
                    barWidth={6} 
                    gap={3} 
                    sensitivity={1.0} 
                  />
                </div>
                
                {/* Floating Music Icons (Client-only to avoid hydration mismatch) */}
                <div className="absolute inset-0">
                  {isMounted && [...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1], 
                        scale: [1, 1.2, 1],
                        x: [0, Math.random() * 40 - 20, 0],
                        y: [0, Math.random() * 40 - 20, 0]
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 2, 
                        repeat: Infinity, 
                        delay: i * 0.5 
                      }}
                      className="absolute text-neon-cyan/20"
                      style={{ 
                        top: `${Math.random() * 100}%`, 
                        left: `${Math.random() * 100}%` 
                      }}
                    >
                      {i % 2 === 0 ? I.music : I.zap}
                    </motion.div>
                  ))}
                </div>

                <div className="absolute inset-0 animate-grid-shift opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,212,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(0,212,255,0.1) 2px, transparent 2px)',
                    backgroundSize: '64px 64px',
                  }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-neon-purple/5 via-transparent to-neon-cyan/5" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full py-4 px-4 overflow-y-auto scrollbar-hide gap-4 md:gap-6">
                
                {/* Branding (Horizontal Layout) */}
                <div className="flex flex-row items-center justify-center gap-4 md:gap-6 mt-auto">
                  <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-16 h-16 md:w-24 md:h-24 relative drop-shadow-[0_0_50px_rgba(0,212,255,0.5)] shrink-0"
                  >
                    <NextImage 
                      src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} 
                      alt="MuzicMania Isotipo" 
                      fill 
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-48 h-8 md:w-64 md:h-10 relative shrink-0"
                  >
                    <NextImage 
                      src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')} 
                      alt="MuzicMania Logotipo" 
                      fill 
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </div>

                {/* Central Action Area */}
                <div className="flex flex-col items-center gap-6 w-full max-w-lg shrink-0">
                  <p className="text-xs md:text-sm text-neon-sky font-accent text-center text-shadow-neon-cyan tracking-widest uppercase animate-pulse">
                    Domina el bit en la dimensión definitiva.
                  </p>
                  
                  <div className="flex flex-col gap-4 w-full px-4">
                    <button 
                      onClick={() => handleStartClick(true)}
                      className="group/btn relative w-full px-8 py-6 md:py-10 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black uppercase italic tracking-tighter text-xl md:text-3xl overflow-hidden rounded-[2.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(189,0,255,0.3)] border border-white/20"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-9 md:h-9" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                          EMPEZAR A JUGAR
                        </span>
                    </button>

                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleStartClick(false)}
                        className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] hover:text-neon-cyan transition-all py-3 px-6 border border-white/5 rounded-full bg-white/5 hover:border-neon-cyan/30 hover:bg-neon-cyan/5 relative z-50"
                      >
                        IGNORAR PANTALLA COMPLETA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permanent Footer Info / Disclaimer */}
                <div className="w-full text-center space-y-3 mt-auto shrink-0 pb-4">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">
                        Sesión Local: Datos temporales. Usa Login para guardar récords.
                      </span>
                   </div>
                   <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em] font-black">
                     &copy; 2026 CiszuNetwork. Todos los derechos reservados.
                   </p>

                </div>
              </div>
            </motion.div>
          )}

          
          {/* --- DISCLAIMER PHASE --- */}
          {phase === 'disclaimer' && (
            <motion.div key="disclaimer" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="max-w-2xl mx-auto w-full relative pt-20">
              {/* GO BACK BUTTON - Repositioned to not overlap */}
              <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setPhase('welcome')}
                className="absolute -top-24 left-0 z-50 flex items-center gap-3 text-gray-500 hover:text-white transition-all uppercase font-black text-[10px] tracking-[0.2em] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 shadow-xl transition-all">
                  <div className="w-5 h-5">{I.arrowLeft}</div>
                </div>
                <span>VOLVER AL INICIO</span>
              </motion.button>
              <div className="p-8 md:p-12 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
                <button onClick={() => setPhase('welcome')} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
                  <div className="w-6 h-6">{I.circleX}</div>
                </button>
                <div className="w-20 h-20 bg-neon-red/10 border border-neon-red/30 rounded-full flex items-center justify-center mx-auto mb-6 text-neon-red">
                  <div className="w-10 h-10">{I.user}</div>
                </div>
                <h3 className="text-2xl font-header font-black text-white uppercase tracking-tighter mb-3">Invitado</h3>
                <p className="text-white/40 font-bold uppercase text-[10px] leading-relaxed tracking-widest px-4 mb-8">
                  Estás a punto de jugar como invitado. Tus r&eacute;cords se guardar&aacute;n de forma local.
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <Button onClick={handleAcceptDisclaimer} className="w-full py-4 rounded-2xl font-header font-black uppercase tracking-widest text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
                    CONTINUAR COMO INVITADO
                  </Button>
                  <div className="flex gap-3">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-2xl font-header font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-neon-pink/20">
                        INICIAR SESIÓN
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button variant="outline" className="w-full h-12 border border-white/20 text-white rounded-2xl font-header font-black uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-white/10 transition-all">
                        REGISTRARSE
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- INTRO & CONFIG PHASE --- */}
          {phase === 'intro' && (
            <motion.div key="intro" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="max-w-4xl mx-auto w-full my-auto px-6">
              {/* GO BACK BUTTON */}
              <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setPhase('welcome')}
                className="absolute top-8 left-8 z-50 flex items-center gap-3 text-gray-500 hover:text-white transition-all uppercase font-black text-[10px] tracking-[0.2em] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 shadow-xl transition-all">
                  <div className="w-5 h-5">{I.arrowLeft}</div>
                </div>
                <span>VOLVER AL INICIO</span>
              </motion.button>
              
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-header font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan">
                  CONFIGURA TU TERMINAL
                </h1>
                <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Paso 1 de 1 - Preferencias Táctiles</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Opcion Flechas */}
                <button 
                  onClick={() => saveInputMode('arrows')}
                  className={`p-8 rounded-[3rem] border transition-all text-center flex flex-col items-center gap-6 ${inputMode === 'arrows' ? 'bg-neon-blue/10 border-neon-blue shadow-neon-blue/20 transform scale-105' : 'bg-black/50 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <div className={`text-xl font-header font-black italic uppercase ${inputMode === 'arrows' ? 'text-neon-blue drop-shadow-neon-blue' : 'text-gray-500'}`}>CLÁSICO (FLECHAS)</div>
                  <div className="flex gap-2">
                    {['←', '↓', '↑', '→'].map((k, i) => (
                      <div key={i} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black text-xl transition-all ${inputMode === 'arrows' ? 'border-neon-blue text-white bg-neon-blue/20 drop-shadow-neon-blue' : 'border-white/10 text-gray-500'}`}>{k}</div>
                    ))}
                  </div>
                </button>

                {/* Opcion WASD */}
                <button 
                  onClick={() => saveInputMode('wasd')}
                  className={`p-8 rounded-[3rem] border transition-all text-center flex flex-col items-center gap-6 ${inputMode === 'wasd' ? 'bg-neon-pink/10 border-neon-pink shadow-neon-pink/20 transform scale-105' : 'bg-black/50 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <div className={`text-xl font-header font-black italic uppercase ${inputMode === 'wasd' ? 'text-neon-pink drop-shadow-neon-pink' : 'text-gray-500'}`}>GAMER (W A S D)</div>
                  <div className="flex gap-2">
                    {['A', 'S', 'W', 'D'].map((k, i) => (
                      <div key={i} className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black text-xl transition-all ${inputMode === 'wasd' ? 'border-neon-pink text-white bg-neon-pink/20 drop-shadow-neon-pink' : 'border-white/10 text-gray-500'}`}>{k}</div>
                    ))}
                  </div>
                </button>

                {/* Opcion Custom */}
                <div 
                  onClick={() => saveInputMode('custom')}
                  className={`p-8 rounded-[3rem] border transition-all text-center flex flex-col items-center gap-6 cursor-pointer group ${inputMode === 'custom' ? 'bg-neon-purple/10 border-neon-purple shadow-neon-purple/20 transform scale-105' : 'bg-black/50 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                >
                  <div className={`text-xl font-header font-black italic uppercase transition-colors ${inputMode === 'custom' ? 'text-neon-purple drop-shadow-neon-purple' : 'text-gray-500 group-hover:text-gray-300'}`}>PERSONALIZADO</div>
                  <div className="flex gap-2">
                    {customKeys.map((k, i) => (
                      <button 
                        key={i} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if(inputMode !== 'custom') saveInputMode('custom');
                          setEditingKeyIndex(i); 
                        }}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black text-xs transition-all pointer-events-auto ${
                          editingKeyIndex === i 
                          ? 'border-neon-purple text-black bg-neon-purple animate-pulse'
                          : inputMode === 'custom' 
                            ? 'border-neon-purple text-white bg-neon-purple/20 drop-shadow-neon-purple hover:bg-neon-purple/40 cursor-text' 
                            : 'border-white/10 text-gray-500 cursor-pointer'
                        }`}
                      >
                        {editingKeyIndex === i ? '?' : k.replace('Key', '').replace('Arrow', '')}
                      </button>
                    ))}
                  </div>
                  {inputMode === 'custom' && (
                    <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-2 animate-pulse">
                      Toca un cuadro para cambiar tecla
                      </div>
                  )}
              </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button onClick={handleFinishIntro} size="lg" className="!bg-white text-black font-black px-12 py-6 text-lg hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  CONFIRMAR E IR A SELECCIÓN DE CANCIONES
                </Button>
              </div>
              </div>
            </motion.div>
          )}

          {/* --- HUB PHASE (Main Menu) --- */}
          {phase === 'hub' && (
            <motion.div key="hub" initial="hidden" animate="visible" exit="exit" variants={sectionVariants}
              className="flex-1 w-full h-full flex relative overflow-hidden bg-black"
            >
              {/* Animated background layers */}
              {(() => {
                const modeBg: Record<string,{from:string,via:string,to:string,orb1:string,orb2:string,orb3:string}> = {
                  historia: {from:'#1a1025',via:'#0a0a1a',to:'#1a1625',orb1:'rgba(107,114,128,0.08)',orb2:'rgba(75,85,99,0.05)',orb3:'rgba(156,163,175,0.04)'},
                  solo: {from:'#0a0a2a',via:'#0a001a',to:'#0a1a2e',orb1:'rgba(0,212,255,0.12)',orb2:'rgba(0,100,255,0.08)',orb3:'rgba(0,212,255,0.04)'},
                  multijugador: {from:'#2a0a2e',via:'#1a0a2e',to:'#2a0a1a',orb1:'rgba(236,72,153,0.12)',orb2:'rgba(189,0,255,0.08)',orb3:'rgba(236,72,153,0.04)'},
                  crear: {from:'#0a2a1a',via:'#0a1a0a',to:'#0a2a20',orb1:'rgba(16,185,129,0.12)',orb2:'rgba(20,184,166,0.08)',orb3:'rgba(16,185,129,0.04)'},
                  eventos: {from:'#2a1a0a',via:'#1a100a',to:'#2a0a0a',orb1:'rgba(249,115,22,0.12)',orb2:'rgba(239,68,68,0.08)',orb3:'rgba(249,115,22,0.04)'},
                  tienda: {from:'#2a2a0a',via:'#1a1a0a',to:'#2a0a2a',orb1:'rgba(234,179,8,0.12)',orb2:'rgba(168,85,247,0.08)',orb3:'rgba(234,179,8,0.04)'},
                };
                const bg = hubHoveredMode ? modeBg[hubHoveredMode] || modeBg.solo : modeBg.solo;
                return (
                  <>
                    <div className="absolute inset-0 pointer-events-none" style={{background: `linear-gradient(135deg, ${bg.from}, ${bg.via}, ${bg.to})`}} />
                    {/* Grid */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '50px 50px' }} 
                    />
                    {/* Animated orbs */}
                    <motion.div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none`}
                      style={{ background: `radial-gradient(circle, ${bg.orb1}, transparent 70%)` }}
                      animate={{ x: [0, 60, -40, 0], y: [0, -40, 50, 0] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none`}
                      style={{ background: `radial-gradient(circle, ${bg.orb2}, transparent 70%)` }}
                      animate={{ x: [0, -50, 40, 0], y: [0, 40, -50, 0] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${bg.orb3}, transparent 70%)` }}
                      animate={{ scale: [1, 1.3, 0.9, 1], opacity: [0.2, 0.5, 0.15, 0.2] }}
                      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </>
                );
              })()}
              
              {!disableFloatingIcons && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {isMounted && noteData.map((n, i) => {
                    const baseAnim = n.type === 'up' 
                      ? { y: ['110%', '-110%'], rotate: [n.rotate, n.rotate + 360] }
                      : n.type === 'down'
                      ? { y: ['-110%', '110%'], rotate: [n.rotate, n.rotate - 360] }
                      : n.type === 'drift'
                      ? { x: ['-10%', '110%'], y: [n.top - 20 + '%', n.top + 20 + '%'], rotate: [n.rotate, n.rotate + 180] }
                      : { scale: [0.3, 1.2, 0.8, 0], rotate: [n.rotate, n.rotate + 120], y: [0, -40, 0] };
                    
                    const posStyle = n.type === 'up' ? { left: `${n.left}%`, bottom: '0' }
                      : n.type === 'down' ? { left: `${n.left}%`, top: '0' }
                      : n.type === 'drift' ? { top: `${n.top}%` }
                      : { left: `${n.left}%`, top: `${n.top}%` };

                    return (
                      <motion.div key={i}
                        className="absolute pointer-events-none select-none font-black"
                        style={posStyle}
                        initial={{ opacity: 0 }}
                        animate={{
                          ...baseAnim,
                          opacity: [0, n.opacity * 0.7, n.opacity * 0.5, 0],
                        }}
                        transition={{
                          duration: n.dur,
                          repeat: Infinity,
                          delay: n.delay,
                          ease: 'linear',
                        }}
                      >
                        <div style={{ fontSize: n.size, color: n.color, textShadow: `0 0 ${n.size * 2}px ${n.color}, 0 0 ${n.size * 4}px ${n.color}60` }}>
                          {catMode ? (i % 3 === 0 ? '🐱' : i % 3 === 1 ? '😺' : '🐈') : n.symbol}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Easter egg click counter */}
              <AnimatePresence>
                {logoClicks > 0 && (
                  <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-400">{catMode ? '🐱 MODO GATO' : '🎵 EASTER EGG'}</span>
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < logoClicks ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'bg-white/20'}`} />
                        ))}
                      </div>
                      {logoClicks >= 3 && (
                        <motion.span initial={{scale:0}} animate={{scale:1}} className="text-neon-cyan">
                          {catMode ? '😺 ACTIVADO' : '✨ COMPLETADO'}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Sidebar */}
              <div className="relative z-10 w-full h-full flex">
                {/* Left Sidebar */}
                <div className="w-[280px] shrink-0 h-full flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl">
                  {/* Scrollable area: modes + bottom options + account */}
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Mode Options */}
                    <div className="flex flex-col gap-0.5 px-3 pt-5">
                    {[
                      { id: 'historia', label: 'MODO HISTORIA', icon: I.book, desc: 'Descubre la historia de MuzicMania', locked: true, lockReason: 'beta', pronto: true },
                      { id: 'solo', label: 'MODO SOLO', icon: I.music, desc: 'Juega partidas individuales con 4 dificultades y canciones variadas' },
                      { id: 'multijugador', label: 'MULTIJUGADOR', icon: I.radio, desc: 'Compite contra otros jugadores', soon: true, lockReason: 'beta' },
                      { id: 'crear', label: 'CREAR', icon: I.customize, desc: 'Crea y comparte tus propios niveles', locked: true, lockReason: 'account' },
                      { id: 'eventos', label: 'EVENTOS', icon: I.trophy, desc: 'Eventos por tiempo limitado', locked: true, lockReason: 'beta', pronto: true },
                      { id: 'tienda', label: 'TIENDA', icon: I.store, desc: 'Consigue nuevos ítems y skins', locked: true, lockReason: 'account' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onMouseEnter={() => { setHubHoveredMode(mode.id); setHubSelectedOption(null); }}
                        onMouseLeave={() => { setHubHoveredMode(null); }}
                        onClick={() => {
                          setHubSidebarView('main');
                          if (mode.locked || mode.soon) {
                            if (mode.lockReason === 'account') { setHubError({title:'CUENTA REQUERIDA',desc:'Necesitas iniciar sesión para acceder a esta funcionalidad'}); return; }
                            setHubError({title:'EN DESARROLLO',desc:'Esta funcionalidad aún está en desarrollo y estará disponible próximamente'}); return;
                          }
                          setPhase(mode.id as PlayPhase);
                        }}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          mode.locked || mode.soon
                            ? 'opacity-40 cursor-pointer'
                            : 'hover:bg-white/5 hover:border-white/10 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${
                          mode.id === 'solo' ? 'text-neon-cyan bg-neon-cyan/10' :
                          mode.id === 'multijugador' ? 'text-neon-pink bg-neon-pink/10' :
                          mode.id === 'tienda' ? 'text-yellow-500 bg-yellow-500/10' :
                          mode.id === 'crear' ? 'text-emerald-500 bg-emerald-500/10' :
                          mode.id === 'eventos' ? 'text-orange-500 bg-orange-500/10' :
                          'text-gray-500 bg-white/5'
                        } group-hover:scale-110 transition-transform`}>
                          {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/90 group-hover:text-white transition-colors">{mode.label}</span>
                            {(mode.soon || mode.pronto) && <span className="text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded bg-neon-pink/20 text-neon-pink">PRONTO</span>}
                            {(mode.locked || mode.soon) && <div className="w-2.5 h-2.5 text-gray-600">{I.lock}</div>}
                          </div>
                          <p className="text-[7px] text-gray-600 font-bold mt-0.5">{mode.desc}</p>
                        </div>
                        {!mode.locked && !mode.soon && (
                          <div className="w-2.5 h-2.5 text-white/20 group-hover:text-white/50 transition-colors">{I.chevronRight}</div>
                        )}
                      </button>
                    ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5 mx-3 my-2"></div>

                    {/* Bottom options - Grid */}
                    <div className="grid grid-cols-2 gap-1.5 px-3">
                      {[
                        { id: 'inventario', label: 'INVENTARIO', icon: I.backpack, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', hoverBg: 'hover:bg-yellow-500/20', onClick: () => { setHubSidebarView('main'); setIsInventarioOpen(true); } },
                        { id: 'ayuda', label: 'AYUDA', icon: I.help, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20', hoverBg: 'hover:bg-neon-cyan/20', onClick: () => { setHubSidebarView('main'); setIsHelpOpen(true); } },
                        { id: 'info', label: 'INFO', icon: I.about, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20', hoverBg: 'hover:bg-neon-blue/20', onClick: () => { setHubSidebarView('main'); setIsInfoOpen(true); } },
                        { id: 'creditos', label: 'CRÉDITOS', icon: I.starOutline, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20', hoverBg: 'hover:bg-neon-pink/20', onClick: () => { setHubSidebarView('main'); setIsCreditsOpen(true); } },
                        { id: 'leaderboard', label: 'LEADERBOARD', icon: I.trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', hoverBg: 'hover:bg-yellow-500/20', onClick: () => { window.open('/leaderboard', '_blank'); } },
                        { id: 'forum', label: 'FORUM', icon: I.forum, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20', hoverBg: 'hover:bg-neon-cyan/20', onClick: () => { window.open('/forum', '_blank'); } },
                        { id: 'redes', label: 'REDES', icon: I.discord, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', hoverBg: 'hover:bg-neon-green/20', onClick: () => { setHubSidebarView('main'); setIsRedesOpen(true); } },
                        { id: 'changelog', label: 'CAMBIOS', icon: I.clock, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hoverBg: 'hover:bg-orange-500/20', onClick: () => { setHubSidebarView('main'); setIsChangelogOpen(true); } },
                        { id: 'config', label: 'CONFIG', icon: I.settings, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', hoverBg: 'hover:bg-violet-500/20', onClick: () => { setHubSidebarView('main'); setIsConfigOpen(true); } },
                        { id: 'otros', label: 'OTROS', icon: I.sliders, color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20', hoverBg: 'hover:bg-neon-purple/20', onClick: () => { setHubSidebarView('main'); setIsOtrosOpen(true); } },
                      ].map(opt => (
                        <button key={opt.id}
                          onMouseEnter={() => { setHubHoveredMode(null); setHubSelectedOption(opt.id); }}
                          onMouseLeave={() => { setHubSelectedOption(null); }}
                          onClick={opt.onClick}
                          className={`group flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all ${opt.bg} ${opt.border} ${opt.hoverBg}`}
                        >
                          <div className={`w-4 h-4 ${opt.color} group-hover:scale-110 transition-transform`}>{opt.icon}</div>
                          <span className={`text-[7px] font-black uppercase tracking-widest ${opt.color} opacity-80 group-hover:opacity-100 transition-opacity`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Account section - removed, now in top bar */}
                    <div className="mt-auto border-t border-white/5 mx-3 my-2 pt-2 pb-3">
                    </div>
                  </div>
                </div>
                
                  {/* Right Content */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  {/* Top bar - Account + buttons */}
                  <div className="flex items-center justify-between px-8 py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      {user ? (
                        <div className="flex items-center gap-4 bg-gradient-to-r from-neon-cyan/[0.08] to-neon-purple/[0.05] rounded-2xl px-5 py-2.5 border border-white/[0.08] hover:border-neon-cyan/20 transition-all group/account cursor-pointer"
                          onClick={() => router.push('/profile')}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-purple flex items-center justify-center text-black font-black text-sm shadow-lg shadow-neon-cyan/20 group-hover/account:scale-110 transition-transform">
                            {user.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-white truncate flex items-center gap-1.5">{user.username} <div className="w-3 h-3 text-blue-400">{I.verified}</div></div>
                            <div className="text-[7px] text-gray-500 font-bold truncate">{user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-white/[0.08] to-white/[0.03] rounded-2xl px-5 py-2.5 border border-white/[0.08] hover:border-neon-cyan/30 transition-all group/account">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center font-black text-lg shadow-lg shadow-neon-cyan/10 group-hover/account:scale-110 transition-transform">
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-neon-cyan to-neon-purple">?</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-black text-white truncate flex items-center gap-1.5">{guestName}</div>
                            <div className="text-[7px] text-gray-500 font-bold truncate">{guestId || ('@' + guestName.toLowerCase())}</div>
                          </div>
                          <div className="flex gap-1.5">
                            <Link href="/login" className="px-3 py-1.5 bg-gradient-to-r from-neon-cyan/30 to-neon-blue/30 border border-neon-cyan/40 rounded-xl text-[7px] font-black uppercase tracking-widest text-neon-cyan hover:from-neon-cyan/50 hover:to-neon-blue/50 transition-all shadow-lg shadow-neon-cyan/5 shrink-0">
                              INICIAR SESIÓN
                            </Link>
                            <Link href="/register" className="px-3 py-1.5 bg-white/5 border border-white/20 rounded-xl text-[7px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
                              REGISTRARSE
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Latest Update Panel - Top Right */}
                    {(() => {
                      const sorted = [...CHANGELOG_DATA].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const latest = sorted[0];
                      return latest ? (
                      <div onClick={() => { setHubHoveredMode(null); setHubSelectedOption('changelog'); setIsChangelogOpen(true); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-transparent hover:from-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 rounded-full transition-all cursor-pointer shrink-0 group"
                        title={`Última actualización: ${latest.version}`}
                      >
                        <div className="w-3 h-3 text-orange-400 group-hover:scale-110 transition-transform">{I.clock}</div>
                        <span className="text-[7px] text-orange-300/80 group-hover:text-orange-200 font-black uppercase tracking-widest whitespace-nowrap">{latest.version} — {latest.date}</span>
                        <div className="h-3 w-px bg-white/10" />
                        <span className="text-[6px] text-gray-500 font-black">{latest.likes}</span>
                        <div className="w-2 h-2 text-neon-pink">{CHANGELOG_I.heart}</div>
                      </div>
                      ) : null;
                    })()}
                  </div>
                   
                  {/* Center - Preview Area */}
                  <div className="flex-1 flex flex-col items-center justify-center px-12 relative">
                    {/* Always-visible logo layer */}
                    <div className="text-center max-w-lg relative z-[1]">
                      <motion.div 
                        className="flex flex-col items-center gap-4"
                        animate={{
                          opacity: hubHoveredMode || hubSelectedOption ? 0.12 : 1,
                          scale: hubHoveredMode || hubSelectedOption ? 0.85 : 1,
                          filter: hubHoveredMode || hubSelectedOption ? 'blur(3px)' : 'blur(0px)',
                        }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      >
                        <motion.img 
                          src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} 
                          alt="" className="w-20 h-auto md:w-28"
                          whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
                          onClick={() => {
                            setLogoClicks(prev => prev + 1);
                            setTimeout(() => setLogoClicks(0), 2000);
                            if (logoClicks >= 2) { setCatMode(!catMode); setLogoClicks(0); }
                          }}
                        />
                        <img 
                          src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')} 
                          alt="" className="w-44 h-auto md:w-56"
                        />
                      </motion.div>
                      <motion.p 
                        className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-4"
                        animate={{ opacity: hubHoveredMode || hubSelectedOption ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        Selecciona un modo para comenzar
                      </motion.p>
                    </div>

                    {/* Guest warning - always visible when not logged in (not darkened with logo) */}
                    {!user && !hubHoveredMode && !hubSelectedOption && (
                      <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 inline-flex items-center gap-2 z-[2]">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                        <span className="text-[8px] text-red-400 font-black uppercase tracking-widest">CUENTA INVITADO — inicia sesión para desbloquear todas las funciones</span>
                      </motion.div>
                    )}

                    {/* Mode preview overlay */}
                    <AnimatePresence>
                    {hubHoveredMode && (() => {
                      const previews: Record<string,{icon:React.ReactNode,title:string,color:string,bg:string,desc:string,stats:{label:string,value:string}[]}> = {
                        historia: {icon:I.book,title:'MODO HISTORIA',color:'from-gray-500 via-white to-gray-600',bg:'from-white/5 to-white/5',desc:'Sumérgete en la historia de MuzicMania. Descubre secretos, desbloquea canciones y avanza por capítulos.',stats:[{label:'CAPÍTULOS',value:'Sin definir'},{label:'SECRETOS',value:'Por descubrir'},{label:'CANON',value:'Historia principal'}]},
                        solo: {icon:I.music,title:'MODO SOLO',color:'from-neon-cyan via-white to-neon-blue',bg:'from-neon-cyan/20 to-neon-blue/20',desc:'Demuestra tu habilidad rítmica en partidas individuales. Elige entre 4 dificultades y completa cada canción al ritmo perfecto.',stats:[{label:'ESTILO',value:'Individual'},{label:'PRECISIÓN',value:'Descripción'},{label:'SUPERVIVENCIA',value:'Descripción'}]},
                        multijugador: {icon:I.radio,title:'MULTIJUGADOR',color:'from-neon-pink via-white to-neon-purple',bg:'from-neon-pink/20 to-neon-purple/20',desc:'Compite en tiempo real contra otros jugadores. Sube en el ranking global y conviértete en leyenda.',stats:[{label:'ESTILO',value:'Competitivo'},{label:'MULTI-OPCIONES',value:'Próximamente'},{label:'ESTADO',value:'Próximamente'}]},
                        crear: {icon:I.customize,title:'CREAR',color:'from-emerald-500 via-white to-teal-500',bg:'from-emerald-500/20 to-teal-500/20',desc:'Diseña tus propios niveles con nuestro editor integrado. Comparte tus creaciones con la comunidad.',stats:[{label:'EDITOR',value:'Editor visual de niveles'},{label:'PUBLICAR',value:'Comparte con la comunidad'},{label:'SELECTORES',value:'Aparece en selectores'}]},
                        eventos: {icon:I.trophy,title:'EVENTOS',color:'from-orange-500 via-white to-red-500',bg:'from-orange-500/20 to-red-500/20',desc:'Participa en eventos por tiempo limitado. Consigue recompensas exclusivas y compite por el podio.',stats:[{label:'RECOMPENSAS',value:'Por definir'},{label:'DURACIÓN',value:'Tiempo limitado'},{label:'PODIO',value:'Próximamente'}]},
                        tienda: {icon:I.store,title:'TIENDA',color:'from-yellow-500 via-white to-purple-500',bg:'from-yellow-500/20 to-purple-500/20',desc:'Consigue nuevos ítems y skins exclusivos. Personaliza tu experiencia al máximo.',stats:[{label:'SKINS',value:'Próximamente'},{label:'CANCIONES',value:'Próximamente'},{label:'OFERTAS',value:'Próximamente'}]},
                      };
                      const p = previews[hubHoveredMode] || previews.solo;
                      return (
                        <motion.div key={hubHoveredMode} initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <div className="text-center max-w-lg">
                            <div className={`w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br ${p.bg} border border-white/10 flex items-center justify-center`}>
                              <div className={`w-12 h-12`} style={{color: hubHoveredMode === 'historia' ? '#6b7280' : hubHoveredMode === 'crear' ? '#10b981' : hubHoveredMode === 'eventos' ? '#f97316' : hubHoveredMode === 'tienda' ? '#eab308' : hubHoveredMode === 'multijugador' ? '#ec4899' : '#00d4ff'}}>{p.icon}</div>
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-header font-black uppercase tracking-tighter bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>
                              {p.title}
                            </h2>
                            <p className="text-xs text-gray-400 font-bold mt-3 max-w-md mx-auto leading-relaxed">
                              {p.desc}
                            </p>
                            <div className="flex items-center justify-center gap-5 mt-5">
                              {p.stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                  <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{stat.label}</div>
                                  <div className="text-[11px] text-gray-300 font-bold mt-1">{stat.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                    </AnimatePresence>

                    {/* Option preview overlay */}
                    <AnimatePresence>
                    {hubSelectedOption && (() => {
                      const optionPreviews: Record<string,{icon:React.ReactNode,title:string,color:string,desc:string}> = {
                        inventario: {icon:I.backpack,title:'INVENTARIO',color:'text-yellow-500',desc:'Gestiona tus skins, efectos y objetos coleccionables'},
                        ayuda: {icon:I.help,title:'AYUDA',color:'text-neon-cyan',desc:'Guía de controles, puntuación y mecánicas del juego'},
                        info: {icon:I.about,title:'INFORMACIÓN',color:'text-neon-blue',desc:'Información general sobre MuzicMania'},
                        creditos: {icon:I.starOutline,title:'CRÉDITOS',color:'text-neon-pink',desc:'Conoce al equipo detrás de MuzicMania'},
                        leaderboard: {icon:I.trophy,title:'LEADERBOARD',color:'text-yellow-500',desc:'Clasificación global de los mejores jugadores'},
                        forum: {icon:I.forum,title:'FORUM',color:'text-neon-cyan',desc:'Comunidad, discusiones y contenido del equipo'},
                        redes: {icon:I.discord,title:'REDES',color:'text-neon-green',desc:'Síguenos en todas las plataformas'},
                        changelog: {icon:I.clock,title:'CHANGELOG',color:'text-orange-500',desc:'Últimas actualizaciones y cambios del juego'},
                        otros: {icon:I.sliders,title:'OTROS',color:'text-neon-purple',desc:'Enlaces rápidos a otras secciones de la plataforma'},
                        config: {icon:I.settings,title:'CONFIGURACIÓN',color:'text-neon-purple',desc:'Ajusta la configuración del juego, audio, controles y apariencia'},
                      };
                      const op = optionPreviews[hubSelectedOption];
                      if (!op) return null;
                      if (hubSelectedOption === 'changelog') {
                        const sorted = [...CHANGELOG_DATA].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        const top3 = sorted.slice(0, 3);
                        return top3.length > 0 ? (
                          <motion.div key="changelog-preview" initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}}
                            className="absolute inset-0 flex items-center justify-center z-10 px-8"
                          >
                            <div className="text-center max-w-lg w-full">
                              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
                                <div className="w-7 h-7 text-orange-400">{I.clock}</div>
                              </div>
                              <h2 className="text-xl font-header font-black uppercase tracking-tighter text-white mb-3">ÚLTIMAS ACTUALIZACIONES</h2>
                              <div className="space-y-2.5 text-left max-w-md mx-auto">
                                {top3.map((item, idx) => {
                                  const primaryType = item.types[0];
                                  const tagCfg = primaryType ? CHANGELOG_TAGS[primaryType] : null;
                                  return (
                                    <Link key={item.id} href={`/changelog/${item.id}`}
                                      className="group block bg-black/60 border border-white/5 hover:border-orange-500/30 rounded-xl p-3 transition-all hover:bg-orange-500/[0.04]"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[10px] ${tagCfg?.color || 'text-orange-400'} ${tagCfg ? `bg-gradient-to-br ${tagCfg.gradient}/20` : 'bg-orange-500/10'} border border-white/5`}>
                                          <div className="w-4 h-4">{tagCfg?.icon || CHANGELOG_I.clock}</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[9px] font-black font-header ${tagCfg?.color || 'text-orange-400'}`}>{item.version}</span>
                                            <span className="text-[6px] text-gray-600 font-bold">{item.date}</span>
                                          </div>
                                          <h4 className="text-white font-black text-[10px] uppercase tracking-wider truncate group-hover:text-orange-200 transition-colors">{item.title}</h4>
                                          <p className="text-[7px] text-gray-500 font-bold mt-0.5 line-clamp-1">{item.description}</p>
                                          <div className="flex flex-wrap gap-1 mt-1.5">
                                            {item.types.slice(0, 3).map(type => {
                                              const tCfg = CHANGELOG_TAGS[type];
                                              return tCfg ? (
                                                <span key={type} className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[5px] font-black uppercase tracking-widest ${tCfg.color} bg-white/5`}>
                                                  <div className="w-1.5 h-1.5">{tCfg.icon}</div>{tCfg.label}
                                                </span>
                                              ) : null;
                                            })}
                                          </div>
                                        </div>
                                        <div className="w-3 h-3 text-gray-600 group-hover:text-orange-400 transition-colors shrink-0 mt-1">{I.arrowRight}</div>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                              <Link href="/changelog"
                                className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[7px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                              ><div className="w-2.5 h-2.5">{I.clock}</div> VER HISTORIAL COMPLETO <div className="w-2.5 h-2.5">{I.arrowRight}</div></Link>
                            </div>
                          </motion.div>
                        ) : null;
                      }
                      return (
                        <motion.div key={hubSelectedOption} initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          <div className="text-center max-w-lg">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <div className={`w-8 h-8 ${op.color}`}>{op.icon}</div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-header font-black uppercase tracking-tighter text-white">{op.title}</h2>
                            <p className="text-[11px] text-gray-400 font-bold mt-2 max-w-md mx-auto">{op.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })()}
                    </AnimatePresence>
                    
                    {/* Now Playing - Full design, compact size */}
                    <div className="absolute bottom-6 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-[1.2rem] shadow-xl shadow-black/50">
                      <div className="w-10 h-10 shrink-0 relative group/disc cursor-pointer" onClick={() => router.push(`/library?track=${titleTrack.id}`)}>
                        <img src={trackDisc(titleTrack.id)} alt=""
                          className={`absolute inset-0 w-full h-full -translate-y-0.5 z-0 transition-all duration-500 ease-out group-hover/disc:-translate-y-3 group-hover/disc:z-20 ${isMusicPlaying ? 'animate-spin' : ''}`}
                          style={{animationDuration:'4s'}}
                        />
                        <img src={trackCover(titleTrack.id)} alt=""
                          className="absolute inset-0 w-full h-full object-cover rounded-lg transition-all duration-500 ease-out z-10 shadow group-hover/disc:opacity-15"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[6px] text-neon-cyan font-black uppercase tracking-[0.15em]">SONANDO AHORA</div>
                        <div className="text-white font-header font-black text-[10px] uppercase italic tracking-wider leading-tight truncate max-w-[140px] flex items-center gap-1 cursor-pointer hover:text-neon-cyan" onClick={() => router.push(`/library?track=${titleTrack.id}`)}>
                          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                          {titleTrack.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0 mt-0.5">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span className="text-gray-500 font-black uppercase text-[6px] tracking-wider">Autor:</span>
                          <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[7px] tracking-wider hover:text-neon-blue">Ciszuko Antony</Link>
                          <svg viewBox="0 0 24 24" className="w-2 h-2 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-1 gap-y-0">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span className="text-gray-500 font-black uppercase text-[6px] tracking-wider">Subido Por:</span>
                          <Link href="/profile/@muzicmania" className="text-white font-bold text-[7px] tracking-wider hover:text-neon-cyan">MuzicMania</Link>
                          <svg viewBox="0 0 24 24" className="w-2 h-2 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Social Panel - Right Side */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
                      <button onClick={() => handleExternalLink('https://discord.gg/W3kMtMMj6E')} title="Discord" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.discord}</div>
                      </button>
                      <button onClick={() => handleExternalLink('https://wa.me/584126858111')} title="WhatsApp" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.whatsapp}</div>
                      </button>
                      <button onClick={() => handleExternalLink('https://www.instagram.com/ciszunetwork/')} title="Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-pink hover:border-neon-pink/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.instagram}</div>
                      </button>
                      <button onClick={() => handleExternalLink('https://www.tiktok.com/@ciszunetwork')} title="TikTok" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.tiktok}</div>
                      </button>
                      <button onClick={() => handleExternalLink('https://www.youtube.com/@CiszuNetwork')} title="YouTube" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FF0000] hover:border-[#FF0000]/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.youtube}</div>
                      </button>
                      <button onClick={() => handleExternalLink('https://x.com/CiszukoAntony')} title="X (Twitter)" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.x}</div>
                      </button>
                      <Link href="/" title="Inicio" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all shadow-lg hover:scale-110">
                        <div className="w-5 h-5">{I.globe}</div>
                      </Link>
                    </div>
                  </div>
                   
                  {/* Bottom bar */}
                  <div className="flex items-center justify-center px-8 py-3 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-loose">
                        &copy; 2026 <span className="hover:text-neon-cyan transition-colors cursor-pointer uppercase font-black">CISZU NETWORK</span> & MUZICMANIA.
                        <br className="hidden sm:block" />                         HECHO CON ❤️ POR <button onClick={() => handleExternalLink('https://ciszukoantony.vercel.app')} className="text-neon-cyan font-black transition-colors hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] cursor-pointer">CISZUKO ANTONY</button>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setHubError({title:'FUNCIÓN BETA',desc:'El cambio de tema no está disponible en esta versión. Por defecto el juego está en modo oscuro.'}); }}
                        className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300"
                        title="Cambiar Tema (No disponible)"
                      >
                        <div className={`w-4 h-4 transition-colors text-gray-400 group-hover:text-neon-cyan`}>{I.moon}</div>
                        <span className="text-[8px] text-gray-500 group-hover:text-white font-black uppercase tracking-widest">AUTOMÁTICO</span>
                      </button>
                      <button onClick={() => setHubSidebarView(hubSidebarView === 'main' ? 'lang' : 'main')}
                        className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300"
                        title="Cambiar Idioma"
                      >
                        <svg className={`w-4 h-4 transition-all duration-500 ${hubSidebarView === 'lang' ? 'rotate-90 text-neon-cyan' : 'text-gray-400 group-hover:rotate-12'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 shrink-0 transition-transform group-hover:scale-110">
                          {(LANGS.find(l => l.code === 'EN-US') || LANGS.find(l => l.code === 'en-us'))?.flag}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- MULTIJUGADOR PHASE --- */}
          {phase === 'multijugador' && (
            <motion.div key="multijugador" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6">
              <div className="text-center max-w-lg">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center">
                  <div className="w-12 h-12 text-neon-pink">{I.radio}</div>
                </div>
                <h2 className="text-4xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-neon-pink via-white to-neon-purple bg-clip-text text-transparent mb-4">MULTIJUGADOR</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mb-8">Próximamente - Modo multijugador en desarrollo</p>
                <button onClick={() => setPhase('hub')}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                >VOLVER AL MENÚ</button>
              </div>
            </motion.div>
          )}

          {/* --- TIENDA PHASE --- */}
          {phase === 'tienda' && (
            <motion.div key="tienda" initial="hidden" animate="visible" exit="exit" variants={sectionVariants}
              className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6 bg-black"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="text-center relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 text-yellow-500">{I.store}</div>
                </div>
                <h2 className="text-4xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-500 via-white to-purple-500 bg-clip-text text-transparent mb-4">TIENDA</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mb-8">Consigue nuevos ítems y personaliza tu experiencia</p>
                <button onClick={() => setPhase('hub')}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                >VOLVER AL MENÚ</button>
              </div>
            </motion.div>
          )}

          {/* --- EVENTOS PHASE --- */}
          {phase === 'eventos' && (
            <motion.div key="eventos" initial="hidden" animate="visible" exit="exit" variants={sectionVariants}
              className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6 bg-black"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />
              <div className="text-center relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 text-orange-500">{I.trophy}</div>
                </div>
                <h2 className="text-4xl font-header font-black uppercase tracking-tighter bg-gradient-to-r from-orange-500 via-white to-red-500 bg-clip-text text-transparent mb-4">EVENTOS</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mb-8">Eventos por tiempo limitado - Próximamente</p>
                <button onClick={() => setPhase('hub')}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                >VOLVER AL MENÚ</button>
              </div>
            </motion.div>
          )}

          {/* --- HISTORIA PHASE --- */}
          {phase === 'historia' && (
            <motion.div key="historia" initial="hidden" animate="visible" exit="exit" variants={sectionVariants}
              className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6 bg-black"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-10 h-10 text-gray-600">{I.lock}</div>
                </div>
                <h2 className="text-3xl font-header font-black uppercase tracking-tighter text-gray-600 mb-2">MODO HISTORIA</h2>
                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] mb-6">Bloqueado - Próximamente</p>
                <button onClick={() => setPhase('hub')}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                >VOLVER AL MENÚ</button>
              </div>
            </motion.div>
          )}

          {/* --- SOLO PHASE --- */}
          {phase === 'solo' && (
            <motion.div key="solo" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="w-full h-full flex flex-col pt-2 pb-1 px-4">
              <div className="flex items-center gap-2 bg-black px-2.5 py-1.5 rounded-xl border border-white/5 relative z-30 shrink-0">
                  <button 
                    onClick={() => setPhase('hub')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                  >
                    <div className="w-3.5 h-3.5">{I.arrowLeft}</div>
                    VOLVER
                  </button>
                  <div className="w-px h-5 bg-white/10" />
                  <div ref={menuRef} className="relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)} 
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-transparent hover:border-white/10"
                    >
                      <div className="w-3.5 h-3.5">{I.menu}</div>
                      MENÚ
                    </button>
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="absolute left-0 top-full mt-2 w-48 bg-black border border-white/10 rounded-2xl shadow-2xl py-2 z-50"
                        >
                          <button onClick={() => { setIsInventarioOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-yellow-500">{I.backpack}</div>
                            INVENTARIO
                          </button>
                          <button onClick={() => { setIsHelpOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-cyan">{I.help}</div>
                            AYUDA
                          </button>
                          <button onClick={() => { setIsInfoOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-neon-blue hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-blue">{I.about}</div>
                            INFO
                          </button>
                          <button onClick={() => { setIsCreditsOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-neon-pink hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-pink">{I.starOutline}</div>
                            CRÉDITOS
                          </button>
                          <div className="h-px bg-white/5 mx-4 my-1" />
                          <button onClick={() => { window.open('/leaderboard', '_blank'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-yellow-500">{I.trophy}</div>
                            LEADERBOARD
                          </button>
                          <button onClick={() => { window.open('/forum', '_blank'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-cyan">{I.forum}</div>
                            FORUM
                          </button>
                          <div className="h-px bg-white/5 mx-4 my-1" />
                          <button onClick={() => { setIsRedesOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-green">{I.discord}</div>
                            REDES
                          </button>
                          <button onClick={() => { setIsChangelogOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-orange-500">{I.clock}</div>
                            CHANGELOG
                          </button>
                          <div className="h-px bg-white/5 mx-4 my-1" />
                          <button onClick={() => { setIsOtrosOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-purple">{I.sliders}</div>
                            OTROS
                          </button>
                          <button onClick={() => { setIsConfigOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            <div className="w-4 h-4 text-neon-purple">{I.settings}</div>
                            CONFIGURACIÓN
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="w-px h-5 bg-white/10" />
                  <div className="relative flex-1 max-w-[180px] group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-600 group-focus-within:text-neon-cyan transition-colors">
                      <div className="w-3.5 h-3.5">{I.search}</div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="BUSCAR..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold text-white placeholder-gray-700 focus:outline-none focus:border-neon-cyan/50 transition-all"
                    />
                  </div>

                  <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                    title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  >
                    <div className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'desc' ? 'scale-y-[-1]' : ''}`}>
                      {I.sort}
                    </div>
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  {/* FILTROS DROPDOWN */}
                  <div ref={filtersRef} className="relative">
                    <button
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        filterCategory !== 'all'
                          ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                          : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-3.5 h-3.5">{I.filter}</div>
                      FILTROS
                    </button>
                    {isFiltersOpen && (
                      <motion.div
                        key="filters"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl py-2 z-[100] overflow-hidden"
                      >
                          <AnimatePresence mode="wait">
                            {!showPopularSub ? (
                              <motion.div key="main" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                                {[
                                  { id: 'all', label: 'TODOS', icon: I.disc },
                                  { id: 'top_likes', label: 'CALIFICADOS', icon: I.heart },
                                  { id: 'most_played', label: 'REPRODUCCIONES', icon: I.play },
                                  { id: 'recent', label: 'RECIENTES', icon: I.history },
                                  { id: 'favorites', label: 'MIS FAVORITOS', icon: I.star },
                                  ...(playlists.length > 0 ? [{ id: 'playlist', label: 'PLAYLISTS', icon: I.album }] : []),
                                ].map(cat => (
                                  <button
                                    key={cat.id}
                                    onClick={() => { setFilterCategory(cat.id as any); setIsFiltersOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                      filterCategory === cat.id
                                        ? 'text-neon-blue bg-neon-blue/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="w-4 h-4">{cat.icon}</div>
                                    {cat.label}
                                  </button>
                                ))}
                                <div className="h-px bg-white/5 mx-4 my-1" />
                                <button
                                  onClick={() => setShowPopularSub(true)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    ['popular_day','popular_week','popular_month','popular_year'].includes(filterCategory)
                                      ? 'text-neon-purple bg-neon-purple/5'
                                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <div className="w-4 h-4">{I.stats}</div>
                                  POPULARIDAD
                                  <div className="ml-auto w-3 h-3">{I.arrowRight}</div>
                                </button>
                                {filterCategory === 'playlist' && playlists.length > 0 && (
                                  <>
                                    <div className="h-px bg-white/5 mx-4 my-1" />
                                    <div className="px-4 py-1 text-[7px] text-gray-700 font-black uppercase tracking-widest">PLAYLISTS</div>
                                    {playlists.map(pl => (
                                      <button
                                        key={pl.name}
                                        onClick={() => { setSelectedPlaylist(selectedPlaylist === pl.name ? null : pl.name); setIsFiltersOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                          selectedPlaylist === pl.name
                                            ? 'text-neon-green bg-neon-green/5'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                      >
                                        <div className="w-4 h-4">{I.album}</div>
                                        {pl.name} ({pl.tracks.length})
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => { setIsPlaylistModalOpen(true); setNewPlaylistName(''); setIsFiltersOpen(false); }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                      <div className="w-4 h-4">{I.album}</div>
                                      + GESTIONAR
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }}>
                                <button
                                  onClick={() => setShowPopularSub(false)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  <div className="w-4 h-4">{I.arrowLeft}</div>
                                  VOLVER
                                </button>
                                <div className="h-px bg-white/5 mx-4 my-1" />
                                {[
                                  { label: 'Día', key: 'popular_day', icon: I.sun },
                                  { label: 'Semana', key: 'popular_week', icon: I.calendar },
                                  { label: 'Mes', key: 'popular_month', icon: I.clock },
                                  { label: 'Año', key: 'popular_year', icon: I.zap },
                                ].map(opt => (
                                  <button
                                    key={opt.key}
                                    onClick={() => { setFilterCategory(opt.key as any); setIsFiltersOpen(false); setShowPopularSub(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                      filterCategory === opt.key
                                        ? 'text-neon-purple bg-neon-purple/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="w-4 h-4">{opt.icon}</div>
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                  </div>

                  {/* DIFICULTAD DROPDOWN */}
                  <div ref={difficultyRef} className="relative">
                    <button
                      onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        selectedDifficulties.length > 0
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-3.5 h-3.5">{I.star}</div>
                      DIFICULTAD
                      {selectedDifficulties.length > 0 && (
                        <span className="text-[8px] text-neon-cyan font-black ml-1">({selectedDifficulties.length})</span>
                      )}
                    </button>
                    <AnimatePresence>
                      {isDifficultyOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="absolute top-full left-0 mt-2 w-44 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50"
                        >
                          {['Easy', 'Normal', 'Hard', 'Expert'].map((diff, idx) => {
                            const stars = idx === 0 ? 2 : idx === 1 ? 5 : idx === 2 ? 12 : 20;
                            const color = getStarColor(stars);
                            const isSelected = selectedDifficulties.includes(diff);
                            return (
                              <button
                                key={diff}
                                onClick={() => { setSelectedDifficulties(prev => prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isSelected
                                    ? 'text-white bg-white/5'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-neon-cyan border-neon-cyan' : 'border-gray-600'
                                }`}>
                                  {isSelected && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-black"><polyline points="20 6 9 17 4 12"/></svg>
                                  )}
                                </div>
                                <div className="w-3 h-3" style={{ color }}>{I.star}</div>
                                {diff}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div ref={albumsRef} className="relative">
                    <button 
                      onClick={() => setIsAlbumsOpen(!isAlbumsOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        selectedAlbums.length > 0 
                        ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' 
                        : 'bg-white/5 border-transparent text-gray-600 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-4 h-4">{I.album}</div>
                      ÁLBUM
                      {selectedAlbums.length > 0 && (
                        <span className="text-[8px] font-black ml-1">({selectedAlbums.length})</span>
                      )}
                    </button>
                    <AnimatePresence>
                      {isAlbumsOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50"
                        >
                          <div className="px-3 pb-2">
                            <input
                              type="text"
                              placeholder="BUSCAR ÁLBUM..."
                              value={albumSearch}
                              onChange={e => setAlbumSearch(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-[10px] font-bold text-white placeholder-gray-700 focus:outline-none focus:border-neon-cyan/50 transition-all"
                            />
                          </div>
                          <div className="px-3 pb-1 flex gap-1">
                            <button
                              onClick={() => { setSelectedAlbums([]); setIsAlbumsOpen(false); }}
                              className={`flex-1 px-2 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                                selectedAlbums.length === 0
                                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                  : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              TODOS
                            </button>
                            <button
                              onClick={() => {
                                const sorted = [...new Set(TRACKS_DATA.map(t => t.album))].sort((a, b) => {
                                  const aDate = Math.max(...TRACKS_DATA.filter(t => t.album === a).map(t => new Date(t.release_date).getTime()));
                                  const bDate = Math.max(...TRACKS_DATA.filter(t => t.album === b).map(t => new Date(t.release_date).getTime()));
                                  return bDate - aDate;
                                });
                                setSelectedAlbums(sorted.slice(0, 5));
                                setIsAlbumsOpen(false);
                              }}
                              className="flex-1 px-2 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                              RECIENTES
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto custom-scrollbar">
                            {[...new Set(TRACKS_DATA.map(t => t.album))].filter(a => a.toLowerCase().includes(albumSearch.toLowerCase())).map(album => {
                              const isSelected = selectedAlbums.includes(album);
                              return (
                                <button
                                  key={album}
                                  onClick={() => { setSelectedAlbums(prev => prev.includes(album) ? prev.filter(a => a !== album) : [...prev, album]); }}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isSelected ? 'text-neon-cyan bg-neon-cyan/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-neon-cyan border-neon-cyan' : 'border-gray-600'
                                  }`}>
                                    {isSelected && (
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-black"><polyline points="20 6 9 17 4 12"/></svg>
                                    )}
                                  </div>
                                  <div className="w-3.5 h-3.5 text-gray-500 shrink-0">{I.album}</div>
                                  <span className="truncate">{album}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-px h-5 bg-white/10 ml-auto" />
                </div>

                <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 pt-0">
                 <div className="flex flex-col min-h-0">
                 {/* Lista de Canciones con Scroll */}
                 <motion.div layout className="flex-1 space-y-6 overflow-y-auto pr-3 pb-4 pl-3 -mx-2 custom-scrollbar">
                   {paginatedTracks.length > 0 ? (
                     showAlbums ? (
                       (() => {
                         const paginatedGrouped = paginatedTracks.reduce((acc, track) => {
                           if (!acc[track.album]) acc[track.album] = [];
                           acc[track.album].push(track);
                           return acc;
                         }, {} as Record<string, Track[]>);
                         const paginatedAlbumNames = Object.keys(paginatedGrouped).sort((a, b) => a.localeCompare(b));
                         return paginatedAlbumNames.map(album => {
                           const albumTracks = paginatedGrouped[album];
                           const totalLikes = albumTracks.reduce((sum, t) => sum + t.likes, 0);
                           const totalPlays = albumTracks.reduce((sum, t) => sum + (realPlays[t.id] || 0), 0);
                           const author = albumTracks[0]?.artist || '';
                           return (
                              <div key={album} className="bg-black/80 rounded-2xl p-4 border border-white/10 space-y-3">
                               <button
                                 onClick={() => { setSelectedAlbums([album]); }}
                                 className="w-full text-left group"
                               >
                                 <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-neon-cyan transition-colors">
                                   <div className="w-1 h-4 bg-neon-cyan/50 rounded-full shrink-0" />
                                   {album}
                                 </h4>
                                 <p className="text-[8px] text-gray-600 font-bold mt-0.5">Álbum recopilatorio</p>
                                 <div className="flex items-center gap-3 mt-1 text-[8px] text-gray-500 font-bold">
                                   <span className="flex items-center gap-1">
                                     <div className="w-2.5 h-2.5">{I.heart}</div>
                                     {totalLikes}
                                   </span>
                                   <span className="flex items-center gap-1">
                                     <div className="w-2.5 h-2.5">{I.play}</div>
                                     {totalPlays.toLocaleString()}
                                   </span>
                                   <span className="text-gray-600">•</span>
                                   <span>{author}</span>
                                   <span className="text-gray-600">•</span>
                                   <span className="text-neon-cyan">MuzicMania</span>
                                 </div>
                               </button>
                               {albumTracks.map((track) => renderTrackCard(track))}
                             </div>
                           );
                         })
                       })()
                     ) : (
                       <div className="space-y-3">
                         {paginatedTracks.map(track => renderTrackCard(track))}
                       </div>
                     )
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                       <div className="w-16 h-16 opacity-20">{I.search}</div>
                       <p className="text-sm font-bold uppercase tracking-widest text-center">No se encontraron tracks con &quot;{searchQuery}&quot;</p>
                       <button 
                         onClick={() => { setSearchQuery(''); setFilterCategory('all'); setSelectedDifficulties([]); }}
                         className="px-6 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-full font-header font-black text-[10px] uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all"
                       >
                         REINICIAR BÚSQUEDA
                       </button>
                     </div>
                   )}
                 </motion.div>
                   {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 pt-4 pb-2">
                       <button
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                         disabled={currentPage === 1}
                         className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                       >
                         <div className="w-3 h-3">{I.arrowLeft}</div>
                       </button>
                       {(() => {
                         const pages: (number | string)[] = [];
                         let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
                         const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);
                         if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
                           startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
                         }
                         if (startPage > 1) {
                           pages.push(1);
                           if (startPage > 2) pages.push('...');
                         }
                         for (let i = startPage; i <= endPage; i++) pages.push(i);
                         if (endPage < totalPages) {
                           if (endPage < totalPages - 1) pages.push('...');
                           pages.push(totalPages);
                         }
                         return pages.map((page, idx) =>
                           typeof page === 'string' ? (
                             <span key={`ellipsis-${idx}`} className="text-[8px] text-gray-600 font-black px-1">...</span>
                           ) : (
                             <button
                               key={page}
                               onClick={() => setCurrentPage(page)}
                               className={`w-8 h-8 rounded-xl text-[9px] font-black transition-all ${
                                 currentPage === page
                                   ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan'
                                   : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                               }`}
                             >
                               {page}
                             </button>
                           )
                         );
                       })()}
                       <button
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         disabled={currentPage === totalPages}
                         className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                       >
                         <div className="w-3 h-3">{I.arrowRight}</div>
                       </button>
                      </div>
                  </div>

                <div className="flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  {selectedTrack ? (
                    <motion.div
                      key="info-panel"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                       className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] flex flex-col min-h-0 relative overflow-hidden"
                     >
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                         <div className="px-5 py-6">
                         {/* Banner estilo Discord - edge to edge */}
                        <div className="relative -mx-5 -mt-6 mb-4 rounded-t-[3rem] overflow-hidden" style={{ height: '200px' }}>
                          <img src={trackBanner(selectedTrack.id)} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />
                        </div>

                        {/* Disc + Title overlapping banner */}
                        <div className="flex items-end gap-4 -mt-20 relative z-10 mb-6">
                          <div className="w-28 h-28 shrink-0 relative drop-shadow-2xl">
                            <img src={trackDisc(selectedTrack.id)} alt=""
                              className={`w-full h-full ${isMusicPlaying ? 'animate-spin' : ''}`}
                              style={{ animationDuration: '4s' }}
                            />
                            <img src={trackCover(selectedTrack.id)} alt=""
                              className="absolute -bottom-1 -right-1 w-16 h-16 object-cover rounded-xl shadow-2xl border-2 border-white/10"
                            />
                          </div>
                          <div className="flex-1 min-w-0 mb-1">
                            <h2 className="inline-flex items-center gap-2 text-2xl md:text-3xl font-header font-black text-white italic uppercase leading-tight truncate backdrop-blur-md bg-black/40 px-4 py-1.5 rounded-xl">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                              {selectedTrack.name}
                            </h2>
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[9px] font-black text-neon-cyan uppercase tracking-widest border border-white/10">
                                <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                                {selectedTrack.album}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 mb-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md bg-black/30 px-2 py-1 rounded-lg">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTrack.difficulty === 'Expert' ? '#FF0055' : selectedTrack.difficulty === 'Hard' ? '#BD00FF' : selectedTrack.difficulty === 'Normal' ? '#00D4FF' : '#00FFA3' }} />
                              <span style={{ color: selectedTrack.difficulty === 'Expert' ? '#FF0055' : selectedTrack.difficulty === 'Hard' ? '#BD00FF' : selectedTrack.difficulty === 'Normal' ? '#00D4FF' : '#00FFA3' }}>{selectedTrack.difficulty}</span>
                            </div>
                            <div className="flex backdrop-blur-md bg-black/20 px-2 py-0.5 rounded-lg">
                              {Array.from({length: Math.min(Math.ceil(selectedTrack.stars / 4), 5)}).map((_, i) => (
                                <div key={i} className="w-3 h-3" style={{ color: getStarColor(selectedTrack.stars) }}>{I.star}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                       <div className="flex flex-col gap-4 mb-6">
                           <p className="text-white text-sm leading-relaxed text-center">{selectedTrack.description}</p>
                           <div className="flex items-start gap-6">
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <div className="w-3 h-3 text-gray-500">{I.user}</div>
                                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                     Subido por <Link href="/profile/@muzicmania" className="text-neon-cyan hover:underline normal-case">{currentLevel?.config.uploadedBy ?? 'MuzicMania'}</Link>
                                    <div className="w-3 h-3 text-blue-400 shrink-0">{I.verified}</div>
                                  </span>
                                </div>
                               <div className="flex items-center gap-1 text-[8px] text-gray-600 font-bold tracking-widest">
                                 <div className="w-2 h-2 text-gray-500">{I.calendar}</div>
                                 {selectedTrack.release_date}
                               </div>
                             </div>
                             <div className="w-px bg-white/10 self-stretch" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <div className="w-3 h-3 text-gray-500">{I.disc}</div>
                                   <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                      Autor: <Link href="/profile/@ciszukoantony_" className="text-neon-blue hover:underline normal-case">Ciszuko Antony</Link>
                                     <div className="w-3 h-3 text-blue-400 shrink-0">{I.verified}</div>
                                   </span>
                                </div>
                               <div className="flex items-center gap-1 text-[8px] text-gray-600 font-bold tracking-widest">
                                 <div className="w-2 h-2 text-gray-500">{I.clock}</div>
                                 {selectedTrack.release_date}
                               </div>
                             </div>
                           </div>
                       </div>

                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                              <div className="text-[8px] uppercase tracking-widest text-gray-500 font-black">Reproducciones</div>
                              <div className="text-sm font-header text-white flex items-center gap-1">
                                <div className="w-3 h-3 text-neon-blue">{I.play}</div>
                                {(realPlays[selectedTrack.id] || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex-1 bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                              <div className="text-[8px] uppercase tracking-widest text-gray-500 font-black">Valoraciones</div>
                              <div className="text-sm font-header text-white flex items-center gap-1">
                                <div className="w-3 h-3 text-neon-pink">{I.heart}</div>
                                {selectedTrack.likes}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                              <div className="text-[8px] uppercase tracking-widest text-gray-500 font-black">BPM</div>
                              <div className="text-sm font-header text-white flex items-center gap-1">
                                <div className="w-3 h-3 text-neon-blue">{I.music}</div>
                                {selectedTrack.bpm}
                              </div>
                            </div>
                            <div className="flex-1 bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                              <div className="text-[8px] uppercase tracking-widest text-gray-500 font-black">Duración</div>
                              <div className="text-sm font-header text-white flex items-center gap-1">
                                <div className="w-3 h-3 text-gray-400">{I.clock}</div>
                                {selectedTrack.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                          
                           {/* Records Panel + Última Partida integrada */}
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                             <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                   <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Record Personal</div>
                                   <div className="text-xl font-header font-black text-white">{getRecord(selectedTrack.id).toLocaleString()}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                   <div>
                                      <div className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan font-black">Record Global</div>
                                      <div className="text-[8px] text-gray-600 font-bold uppercase">{globalRecord?.user || 'Sin Record'}</div>
                                   </div>
                                   <div className="text-2xl font-header font-black text-neon-cyan drop-shadow-neon-cyan">{(globalRecord?.score || 0).toLocaleString()}</div>
                                </div>

                                {/* Última Partida inline */}
                                {isHydrated && getLastMatch(selectedTrack.id) && (
                                  <div onClick={() => setShowLastMatchDetail(selectedTrack.id)} className="cursor-pointer bg-gradient-to-r from-neon-purple/10 to-transparent border border-neon-purple/20 p-3 rounded-xl hover:bg-neon-purple/15 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-neon-purple/20 text-neon-purple">
                                          <div className="w-3.5 h-3.5">{I.history}</div>
                                        </div>
                                        <div>
                                          <div className="text-[7px] uppercase tracking-widest text-neon-purple font-black">Última</div>
                                          <div className="text-base font-header font-black text-white">{getLastMatch(selectedTrack.id).score.toLocaleString()}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-[7px] text-gray-600 font-bold">{new Date(getLastMatch(selectedTrack.id).date).toLocaleDateString()}</div>
                                        <div className="w-3 h-3 text-gray-500">{I.chevronRight}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 text-[8px]">
                                      <div className="bg-black/30 rounded p-1.5 text-center">
                                        <div className="text-gray-500 uppercase tracking-wider flex items-center justify-center gap-0.5"><div className="w-2 h-2 text-yellow-500">{I.trophy}</div>Combo</div>
                                        <div className="text-white font-bold font-header">{getLastMatch(selectedTrack.id).maxCombo}x</div>
                                      </div>
                                      <div className="bg-black/30 rounded p-1.5 text-center">
                                        <div className="text-gray-500 uppercase tracking-wider flex items-center justify-center gap-0.5"><div className="w-2 h-2 text-neon-cyan">{I.target}</div>Precisión</div>
                                        <div className="text-neon-cyan font-bold font-header">{getLastMatch(selectedTrack.id).accuracy}%</div>
                                      </div>
                                      <div className="bg-black/30 rounded p-1.5 text-center">
                                        <div className="text-gray-500 uppercase tracking-wider flex items-center justify-center gap-0.5"><div className="w-2 h-2 text-red-400">{I.circleX}</div>Errores</div>
                                        <div className="text-neon-pink font-bold font-header">{getLastMatch(selectedTrack.id).mistakes}</div>
                                      </div>
                                      <div className="bg-black/30 rounded p-1.5 text-center">
                                        <div className="text-gray-500 uppercase tracking-wider flex items-center justify-center gap-0.5"><div className="w-2 h-2 text-neon-green">{I.zap}</div>KPS</div>
                                        <div className="text-neon-green font-bold font-header">{getLastMatch(selectedTrack.id).kps}</div>
                                      </div>
                                    </div>
                                    {getLastMatch(selectedTrack.id).hits && (
                                      <div className="flex gap-1 mt-1.5 text-[6px] uppercase tracking-widest font-black">
                                        {(['perfect','great','good','meh','bad','veryBad','miss'] as const).map(k => {
                                          const hitColors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                                          const hitIcons: Record<string, React.ReactNode> = { perfect: I.star, great: I.zap, good: I.heart, meh: I.target, bad: I.flame, veryBad: I.circleX, miss: I.about };
                                          const hitIconColors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                                          return (
                                            <div key={k} className="bg-black/20 rounded px-1.5 py-0.5 flex items-center gap-0.5 flex-1 justify-center">
                                              <span className={`font-bold font-header ${hitColors[k]}`}>{getLastMatch(selectedTrack.id).hits[k]}</span>
                                              <div className={`w-2 h-2 ${hitIconColors[k]}`}>{hitIcons[k]}</div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  )}

                                <Link href="/leaderboard" className="block w-full mt-1 py-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl text-[8px] font-black uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/20 transition-all text-center">
                                  VER LEADERBOARD COMPLETO
                                </Link>
                             </div>
                          </div>
                         </div>
                         </div>
                         <div className="shrink-0 px-5 pb-4 pt-2 flex flex-col gap-4">
                             <Button 
                               onClick={() => handleStartGame(selectedTrack)}
                              className={`w-full py-5 text-xl font-header font-black italic bg-gradient-to-r from-green-500 via-green-400 to-purple-600 text-white shadow-xl transform hover:scale-[1.02] active:scale-90 transition-all rounded-2xl group relative overflow-hidden border-0`}
                            >
                              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                              <span className="relative z-10 flex items-center justify-center gap-3" style={{ textShadow: '0 0 10px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.8)' }}>
                                <div className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{I.play}</div>
                                JUGAR AHORA
                              </span>
                            </Button>
                         </div>
                       </motion.div>
                    ) : (
                      <motion.div
                        key="branding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                         className="flex flex-col items-center justify-center h-full min-h-0 bg-black/70 backdrop-blur-sm border border-white/5 rounded-[3rem] relative overflow-hidden"
                      >
                        <div className="absolute w-64 h-64 rounded-full bg-neon-purple/5 blur-3xl animate-pulse" />
                        <div className="absolute w-48 h-48 rounded-full bg-neon-blue/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute w-80 h-80 rounded-full bg-neon-cyan/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                        
                        <div className="flex flex-col items-center justify-center px-8 text-center">
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="text-3xl md:text-5xl font-header font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple mb-6 drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                          >SOLO MODE</motion.div>
                          <motion.div className="w-32 h-auto mb-4 drop-shadow-2xl"
                            whileHover={{ scale: 1.08, filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.8))' }}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 300 } }}
                          >
                            <img src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} alt="MuzicMania" className="w-full h-full object-contain" />
                          </motion.div>
                          <motion.div className="w-56 h-auto mb-6 drop-shadow-2xl"
                            whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 25px rgba(189,0,255,0.7))' }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 300 } }}
                          >
                            <img src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')} alt="MuzicMania" className="w-full h-full object-contain" />
                          </motion.div>
                          <h1 className="text-2xl md:text-4xl font-header font-black uppercase tracking-tighter leading-none bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent">
                            SELECCIONA TU NIVEL PARA INICIAR
                          </h1>
                          <p className="mt-4 text-[10px] text-white/50 font-bold uppercase tracking-[0.3em]">
                            Elige una canción para comenzar
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Retractable right panel */}
              <AnimatePresence>
                {showRightPanel && (
                  <motion.div initial={{x:320}} animate={{x:0}} exit={{x:320}}
                    transition={{type:'spring',damping:25,stiffness:300}}
                    className="absolute top-0 right-0 bottom-0 z-50 w-80 bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col"
                  >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                      <h3 className="text-xs font-header font-black uppercase tracking-tight text-white">ÚLTIMOS CAMBIOS</h3>
                      <button onClick={() => setShowRightPanel(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">{I.close}</button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                      {[
                        {ver:'v2.0.1',date:'20 Jun 2026',changes:['Nuevo menú principal con selector de modos','Fondo animado con logos diagonales','Modo Solo con selector de canciones','Sistema de fases: Hub → Solo/Multi/Eventos/etc']},
                        {ver:'v2.0.0',date:'15 Jun 2026',changes:['Motor de juego reconstruido','Soporte para 4 flechas','Sistema de combo y precisión','Modo invitado con guardado local']},
                        {ver:'v1.0.0',date:'1 May 2026',changes:['Lanzamiento inicial','3 canciones disponibles','Modo clásico de juego']},
                      ].map((c,i)=>(
                        <div key={i} className="border border-white/5 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-neon-cyan font-black text-xs font-header">{c.ver}</span>
                            <span className="text-[7px] text-gray-600 font-bold">{c.date}</span>
                          </div>
                          <ul className="space-y-0.5">
                            {c.changes.map((ch,j)=>(
                              <li key={j} className="text-[8px] text-gray-400 font-bold flex items-start gap-1.5">
                                <span className="text-neon-cyan mt-0.5">•</span>
                                {ch}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Floating error modal - outside hub phase */}
          <AnimatePresence>
            {hubError && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
              >
                <motion.div initial={{scale:0.9,y:10}} animate={{scale:1,y:0}} exit={{scale:0.9,y:10}}
                  className="pointer-events-auto bg-[#0a0a0a]/95 border border-white/10 rounded-[2rem] p-6 max-w-sm w-full mx-4 shadow-2xl text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-header font-black uppercase tracking-tight text-white mb-2">{hubError.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold mb-5">{hubError.desc}</p>
                  <button onClick={() => setHubError(null)}
                    className="px-6 py-2.5 bg-white/10 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                  >ENTENDIDO</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- GAME & HUD PHASE --- */}
          {phase === 'game' && selectedTrack && (
            <motion.div key="game" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">

              <div className="relative w-full h-full max-w-full max-h-full aspect-video bg-black overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex items-center justify-center">
                {/* Flash de Error */}
                <AnimatePresence>
                  {gameState.mistakes > 0 && (
                    <motion.div 
                      key={gameState.mistakes}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-red-600/30 pointer-events-none z-50 border-[20px] border-red-600/50"
                    />
                  )}
                </AnimatePresence>

                {/* Canvas de juego */}
                <canvas ref={canvasRef} width={1920} height={1080} className={`absolute inset-0 w-full h-full block z-10 ${!gameState.isPlaying ? 'opacity-0' : ''}`} />

                {/* Debug overlay dentro del juego */}
                {showDebug && debugShowInfoPanel && (
                  <div ref={debugPanelRef}
                    className="absolute z-[60] bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none"
                    style={{ left: debugPanelPos.x, top: debugPanelPos.y, minWidth: 160, cursor: draggingDebug ? 'grabbing' : 'grab' }}
                    onMouseDown={(e) => {
                      setDraggingDebug(true);
                      dragOffset.current = { x: e.clientX - debugPanelPos.x, y: e.clientY - debugPanelPos.y };
                    }}
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/5 border-b border-white/10">
                      <div className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest text-neon-cyan">
                        <div className="w-2.5 h-2.5">{I.activity}</div>
                        DEBUG
                      </div>
                      <button onClick={() => setDebugShowInfoPanel(false)}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                        <div className="w-2.5 h-2.5">{I.x}</div>
                      </button>
                    </div>
                    <div className="px-2.5 py-1.5 space-y-1 text-[9px] font-bold">
                      {debugShowFps && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">FPS</span>
                          <span className="text-neon-cyan font-black">{Math.round(debugFps)}</span>
                        </div>
                      )}
                      {debugShowPing && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">PING</span>
                          <span className="text-neon-purple font-black">{debugPing}<span className="text-[7px] ml-0.5">ms</span></span>
                        </div>
                      )}
                      {debugShowLatency && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500">LATENCIA</span>
                          <span className="text-neon-pink font-black">{debugLatency}<span className="text-[7px] ml-0.5">ms</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {draggingDebug && (
                  <div className="absolute inset-0 z-[61]"
                    onMouseMove={(e) => {
                      setDebugPanelPos({ x: e.clientX - debugPanelPos.x - (gameContainerRef.current?.getBoundingClientRect().left || 0), y: e.clientY - debugPanelPos.y - (gameContainerRef.current?.getBoundingClientRect().top || 0) });
                    }}
                    onMouseUp={() => setDraggingDebug(false)}
                    onMouseLeave={() => setDraggingDebug(false)}
                  />
                )}

                {/* --- DOCKS FLOTANTES HUD --- */}

                {/* HUD Izquierdo - Dock Flotante */}
                <div className="absolute left-6 top-6 bottom-20 flex flex-col justify-between w-64 pointer-events-none z-20">
                  {/* Now Playing & Level Info Integrated Dock */}
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] space-y-4 shadow-xl">
                   <div className="flex items-center gap-3 pointer-events-auto">
                      <div className="w-14 h-14 shrink-0 relative group/disc cursor-pointer" onClick={() => router.push(`/library?track=${selectedTrack.id}`)}>
                         <img src={trackDisc(selectedTrack.id)} alt=""
                           className={`absolute inset-0 w-full h-full -translate-y-2 z-0 transition-all duration-500 ease-out group-hover/disc:-translate-y-4 group-hover/disc:z-20 ${gameState.isPlaying && !gameState.isPaused ? 'animate-spin' : ''}`}
                           style={{ animationDuration: '4s' }}
                         />
                         <img src={trackCover(selectedTrack.id)} alt=""
                           className="absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-500 ease-out z-10 shadow-lg group-hover/disc:opacity-15"
                         />
                       </div>
                       <div className="min-w-0">
                         <div className="text-[7px] text-neon-cyan font-black uppercase tracking-[0.2em]">SONANDO AHORA...</div>
                         <div className="text-white font-header font-black text-xs uppercase italic tracking-wider truncate leading-tight flex items-center gap-1.5 cursor-pointer hover:text-neon-cyan" onClick={() => router.push(`/library?track=${selectedTrack.id}`)}>
                           <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                           {selectedTrack.name}
                         </div>
                         <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                           <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                           <span className="text-gray-400 font-black uppercase text-[8px] tracking-wider">Autor:</span>
                           <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[8px] tracking-wider hover:text-neon-blue">Ciszuko Antony</Link>
                           <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                         </div>
                         <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                           <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                           <span className="text-gray-400 font-black uppercase text-[8px] tracking-wider">Subido Por:</span>
                           <Link href="/profile/@muzicmania" className="text-white font-bold text-[8px] tracking-wider hover:text-neon-cyan">MuzicMania</Link>
                           <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-blue-400 shrink-0" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                         </div>
                       </div>
                     </div>
                    
                    <div className="h-px bg-white/10" />
                    
                     {/* Score */}
                     <div>
                   <div className="text-[8px] uppercase text-white/70 font-black tracking-widest mb-0.5 flex items-center gap-1.5">
                          <div className="w-3 h-3 text-neon-cyan">{I.stats}</div>
                          Score
                        </div>
                        <div className="text-2xl font-header font-black text-white">{gameState.score.toLocaleString()}</div>
                      </div>
                      
                      {/* Combo */}
                      <div>
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest mb-0.5 flex items-center gap-1.5">
                         <div className="w-3 h-3 text-neon-pink">{I.zap}</div>
                         Combo
                       </div>
                       <div className="text-3xl font-header font-black transition-colors" style={{color: gameState.combo > 0 ? getComboColor(gameState.combo) : '#ffffff'}}>
                         {gameState.combo}x
                       </div>
                       {gameState.combo > 10 && (
                         <div className="h-1 mt-1 rounded-full transition-all" style={{background: getComboColor(gameState.combo), width: `${Math.min(gameState.combo, 100)}%`}}/>
                       )}
                     </div>
                     
                     {/* Max Combo */}
                     <div>
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest mb-0.5 flex items-center gap-1.5">
                          <div className="w-3 h-3 text-neon-pink">{I.zap}</div>
                          Combo
                        </div>
                       <div className="text-md font-header font-black text-neon-purple">{gameState.maxCombo}x</div>
                     </div>
                  </div>

                  {/* KPS / Mistakes Dock */}
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex justify-between items-center shadow-xl">
                     <div>
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest flex items-center gap-1">
                          <div className="w-2.5 h-2.5 text-neon-green">{I.target}</div>
                          KPS
                        </div>
                       <div className="text-lg font-header font-black transition-colors" style={{color: getKpsColor(gameState.kps)}}>{gameState.kps}</div>
                     </div>
                     <div className="h-8 w-px bg-white/10" />
                     <div className="text-right">
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest flex items-center gap-1 justify-end">
                          <div className="w-2.5 h-2.5 text-red-400">{I.circleX}</div>
                          Mistakes
                       </div>
                       <div className="text-lg font-header font-black transition-colors" style={{color: getMistakesColor(gameState.mistakes)}}>{gameState.mistakes}</div>
                     </div>
                  </div>
                </div>

                {/* HUD Derecho - Dock Flotante */}
                <div className="absolute right-6 top-6 bottom-20 flex flex-col justify-between w-64 pointer-events-none z-20">
                   {/* Accuracy & Hits Dock */}
                   <div className="bg-black/70 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] space-y-4 shadow-xl">
                     <div>
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest mb-0.5 flex items-center gap-1.5">
                          <div className="w-3 h-3 text-neon-cyan">{I.target}</div>
                          Precisión
                        </div>
                       <div className="text-3xl font-header font-black transition-colors" style={{color: getAccuracyColor(gameState.accuracy)}}>{gameState.accuracy}%</div>
                    </div>
                    
                    <div className="h-px bg-white/10" />
                    
                    {/* Hits Breakdown */}
                     <div className="space-y-1">
                       {[
                         { label: 'Perfect', val: gameState.hits.perfect, color: 'text-neon-cyan', icon: I.star },
                         { label: 'Great', val: gameState.hits.great, color: 'text-neon-purple', icon: I.zap },
                         { label: 'Good', val: gameState.hits.good, color: 'text-neon-green', icon: I.heart },
                         { label: 'Meh', val: gameState.hits.meh, color: 'text-yellow-400', icon: I.target },
                         { label: 'Bad', val: gameState.hits.bad, color: 'text-orange-500', icon: I.flame },
                         { label: 'Very Bad', val: gameState.hits.veryBad, color: 'text-red-400', icon: I.circleX },
                         { label: 'Miss', val: gameState.hits.miss, color: 'text-red-500', icon: I.about }
                       ].map(h => (
                         <div key={h.label} className="flex justify-between text-[10px] font-bold items-center">
                           <span className="text-gray-400 flex items-center gap-1">
                             <div className={`w-2.5 h-2.5 ${h.color}`}>{h.icon}</div>
                             {h.label}
                           </span>
                           <span className={h.color}>{h.val}</span>
                         </div>
                       ))}
                     </div>
                  </div>

                    {/* Progress & Record Dock */}
                    <div className="bg-black/70 backdrop-blur-md border border-white/10 p-4 rounded-3xl space-y-2 shadow-xl">
                      <div>
                        <div className="text-[8px] uppercase text-white/70 font-black tracking-widest mb-0.5 flex items-center gap-1.5">
                          <div className="w-3 h-3 text-neon-purple">{I.stats}</div>
                          Progreso
                        </div>
                        <div className="flex items-center justify-between">
                          <motion.div
                            className="text-md font-header font-black tabular-nums"
                            style={{ color: gameState.progress >= 95 ? '#68cfff' : gameState.progress >= 75 ? '#00ff88' : gameState.progress >= 50 ? '#ffd900' : gameState.progress >= 25 ? '#ff6600' : '#ff2244' }}
                            animate={gameState.progress >= 95 ? { scale: [1, 1.08, 1], textShadow: ['0 0 0 rgba(104,207,255,0)', '0 0 20px rgba(104,207,255,0.6)', '0 0 0 rgba(104,207,255,0)'] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            {gameState.progress}%
                          </motion.div>
                          <div className="text-[10px] font-bold text-white/60">{gameState.notesHit} / {gameState.totalNotes} notas</div>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full mt-1.5 overflow-hidden relative">
                          {/* Segment tick marks */}
                          {[20, 40, 60, 80].map(t => (
                            <div key={t} className="absolute top-0 bottom-0 w-px bg-white/20 z-10" style={{ left: `${t}%` }} />
                          ))}
                          <motion.div
                            className="h-full rounded-full relative"
                            style={{
                              width: `${gameState.progress}%`,
                              background: `linear-gradient(90deg, ${getScoreGradient(gameState.progress).join(', ')})`,
                              backgroundSize: '200% 100%',
                              boxShadow: gameState.progress >= 80 ? `0 0 12px ${getScoreGradient(gameState.progress)[0]}80, 0 0 30px ${getScoreGradient(gameState.progress)[0]}40` : 'none',
                            }}
                            animate={{
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                              boxShadow: gameState.progress >= 80
                                ? [
                                  `0 0 12px ${getScoreGradient(gameState.progress)[0]}80, 0 0 30px ${getScoreGradient(gameState.progress)[0]}40`,
                                  `0 0 18px ${getScoreGradient(gameState.progress)[0]}b0, 0 0 45px ${getScoreGradient(gameState.progress)[0]}60`,
                                  `0 0 12px ${getScoreGradient(gameState.progress)[0]}80, 0 0 30px ${getScoreGradient(gameState.progress)[0]}40`,
                                ]
                                : 'none',
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          />
                          {/* Progress tip glow */}
                          {gameState.progress > 0 && (
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                              style={{
                                left: `${gameState.progress}%`,
                                marginLeft: -4,
                                background: getScoreGradient(gameState.progress)[getScoreGradient(gameState.progress).length - 1] || '#68cfff',
                                boxShadow: `0 0 8px ${getScoreGradient(gameState.progress)[0]}cc`,
                              }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          )}
                        </div>
                      </div>
                     
                     {parseInt(getRecord(selectedTrack.id), 10) > 0 && (
                       <>
                         <div className="h-px bg-white/10" />
                         <div>
                           <div className="text-[8px] uppercase text-yellow-500 font-black tracking-widest flex items-center gap-1.5">
                             <div className="w-3 h-3 text-yellow-500">{I.trophy}</div>
                             Récord Personal
                           </div>
                           <div className="text-md font-header font-black text-white">{getRecord(selectedTrack.id).toLocaleString()}</div>
                         </div>
                       </>
                     )}
                   </div>
                </div>

                {/* Mobile HUD Overlay */}
                <div className="md:hidden absolute top-4 left-4 flex gap-6 pointer-events-none z-30">
                  <div className="flex flex-col drop-shadow-md">
                    <span className="text-[9px] uppercase text-neon-cyan font-black tracking-widest">Score</span>
                    <span className="text-lg font-header font-black text-white">{gameState.score.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col drop-shadow-md">
                    <span className="text-[9px] uppercase text-neon-purple font-black tracking-widest">Combo</span>
                    <span className={`text-lg font-header font-black ${gameState.combo > 50 ? 'text-neon-pink animate-pulse' : 'text-white'}`}>{gameState.combo}x</span>
                  </div>
                </div>

                {/* Loading Overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-50"
                    >
                      <motion.div 
                        animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-t-2 border-r-2 border-neon-cyan rounded-full mb-6"
                      />
                      <p className="text-lg font-header font-black text-white uppercase tracking-[0.3em] animate-pulse">CARGANDO NIVEL...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                  {loadError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-50"
                    >
                      <div className="max-w-md text-center space-y-6 p-8">
                        <div className="w-20 h-20 mx-auto text-red-500">{I.fileText}</div>
                        <h3 className="text-2xl font-header font-black text-red-500 uppercase tracking-wider">Error de Carga</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{loadError}</p>
                        <div className="flex gap-4 justify-center pt-4">
                          <Button onClick={() => handleStartGame(selectedTrack)} size="lg" className="!bg-white text-black font-black px-8 py-4 text-sm">
                            REINTENTAR
                          </Button>
                          <Button onClick={handleAbortGame} variant="outline" size="lg" className="border-white/20 text-white font-black px-8 py-4 text-sm">
                            VOLVER
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlay de Pausa */}
                {gameState.isPaused && selectedTrack && resumeCountdown === null && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-40 flex flex-col items-center justify-center pointer-events-auto overflow-y-auto">
                    <div className="max-w-2xl w-full mx-auto px-6 py-8">
                      <motion.h1 initial={{y:-30,opacity:0}} animate={{y:0,opacity:1}} className="text-4xl md:text-6xl font-header font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] text-center mb-1">PAUSA</motion.h1>
                      <p className="text-gray-500 uppercase tracking-[0.4em] font-bold text-xs text-center mb-6">Partida suspendida temporalmente</p>

                      {/* Track Info Compact */}
                      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
                        className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 mb-6"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 shrink-0 relative group/disc cursor-pointer" onClick={() => router.push(`/library?track=${selectedTrack.id}`)}>
                            <img src={trackDisc(selectedTrack.id)} alt="" className="absolute inset-0 w-full h-full -translate-y-1 z-0 transition-all duration-500 ease-out group-hover/disc:-translate-y-2 group-hover/disc:z-20" />
                            <img src={trackCover(selectedTrack.id)} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl transition-all duration-500 ease-out z-10 shadow-lg group-hover/disc:opacity-15" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-header font-black text-white italic uppercase truncate flex items-center gap-2 cursor-pointer hover:text-neon-cyan transition-colors" onClick={() => router.push(`/library?track=${selectedTrack.id}`)}>
                              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                              {selectedTrack.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 text-[7px] font-black text-neon-cyan uppercase tracking-widest border border-white/10">
                                <svg viewBox="0 0 24 24" className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                                {selectedTrack.album}
                              </span>
                              <div className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest backdrop-blur-md bg-black/30 px-1.5 py-0.5 rounded-md">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedTrack.difficulty === 'Expert' ? '#FF0055' : selectedTrack.difficulty === 'Hard' ? '#BD00FF' : selectedTrack.difficulty === 'Normal' ? '#00D4FF' : '#00FFA3' }} />
                                <span style={{ color: selectedTrack.difficulty === 'Expert' ? '#FF0055' : selectedTrack.difficulty === 'Hard' ? '#BD00FF' : selectedTrack.difficulty === 'Normal' ? '#00D4FF' : '#00FFA3' }}>{selectedTrack.difficulty}</span>
                              </div>
                              {Array.from({length: Math.min(Math.ceil(selectedTrack.stars / 4), 5)}).map((_, i) => (
                                <div key={i} className="w-2 h-2" style={{ color: getStarColor(selectedTrack.stars) }}>{I.star}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {selectedTrack.description && (
                          <p className="text-gray-400 text-[11px] leading-relaxed text-center mb-4">{selectedTrack.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-3 h-3 text-gray-500">{I.user}</div>
                            <div className="min-w-0">
                              <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black">Autor</div>
                              <Link href="/profile/@ciszukoantony_" className="text-[10px] font-header text-white truncate hover:text-neon-blue transition-colors flex items-center gap-1">Ciszuko Antony<div className="w-2.5 h-2.5 text-neon-cyan shrink-0">{I.verified}</div></Link>
                            </div>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-3 h-3 text-gray-500">{I.upload}</div>
                            <div className="min-w-0">
                              <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black">Subido por</div>
                              <Link href="/profile/@muzicmania" className="text-[10px] font-header text-white truncate hover:text-neon-blue transition-colors flex items-center gap-1">MuzicMania<div className="w-2.5 h-2.5 text-neon-cyan shrink-0">{I.verified}</div></Link>
                            </div>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-3 h-3 text-gray-500">{I.music}</div>
                            <div>
                              <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black">BPM</div>
                              <div className="text-[10px] font-header text-white">{selectedTrack.bpm}</div>
                            </div>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-3 h-3 text-gray-500">{I.heart}</div>
                            <div>
                              <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black">Valoración</div>
                              <div className="text-[10px] font-header text-white">{selectedTrack.likes}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Buttons */}
                      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}}
                        className="flex flex-col md:flex-row gap-4 justify-center"
                      >
                        <Button onClick={handleResume} className="!bg-green-500 text-black border-none font-black px-10 py-4 text-base hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center gap-3">
                          <div className="w-5 h-5">{I.play}</div> REANUDAR
                        </Button>
                        <Button onClick={() => handleStartGame(selectedTrack)} className="!bg-yellow-500 text-black border-none font-black px-10 py-4 text-base hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,179,8,0.6)] flex items-center gap-3">
                          <div className="w-5 h-5">{I.refresh}</div> REINTENTAR
                        </Button>
                        <Button onClick={() => setIsConfigOpen(true)} className="!bg-neon-cyan text-black border-none font-black px-10 py-4 text-base hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,212,255,0.6)] flex items-center gap-3">
                          <div className="w-5 h-5">{I.settings}</div> CONFIGURAR
                        </Button>
                        <Button onClick={handleAbortGame} variant="outline" className="!bg-red-600 text-white border-none font-black px-10 py-4 text-base hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center gap-3">
                          <div className="w-5 h-5">{I.stop}</div> ABORTAR
                        </Button>
                      </motion.div>
                    </div>
                   </div>
                )}

                {/* Overlay de desconexión */}
                {isDisconnected && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center pointer-events-auto">
                    <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="flex flex-col items-center gap-4 text-center max-w-md px-6">
                      <svg className="w-16 h-16 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414"/></svg>
                      <h2 className="text-4xl font-header font-black uppercase italic text-red-500">Sin Conexión</h2>
                      <p className="text-gray-400 text-sm">Se ha perdido la conexión a internet. La partida se ha pausado.</p>
                      <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold mt-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Reconectando... intento {disconnectRetryCount}/{disconnectMaxRetries}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <Button onClick={async () => {
                          if (disconnectTimerRef.current) { clearTimeout(disconnectTimerRef.current); disconnectTimerRef.current = null; }
                          const ok = await checkConnection();
                          if (ok) {
                            setIsDisconnected(false);
                            disconnectRetryRef.current = 0;
                            setDisconnectRetryCount(0);
                            if (resumeCountdown !== null) { resumeCountdownCancelRef.current = true; setResumeCountdown(null); }
                            handleResume();
                          }
                        }} className="!bg-green-500 text-black border-none font-black px-8 py-4 text-base hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          RECONECTAR
                        </Button>
                        <Button onClick={() => { setIsDisconnected(false); handleAbortGame(); }} variant="outline" className="!bg-red-600 text-white border-none font-black px-8 py-4 text-base hover:scale-110 active:scale-95 transition-all flex items-center gap-3">
                          <div className="w-5 h-5">{I.stop}</div> SALIR
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Countdown de reanudación */}
                <AnimatePresence mode="wait">
                  {resumeCountdown !== null && (
                    <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:2.5}}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60]"
                    >
                      <motion.div
                        key={resumeCountdown}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[200px] font-header font-black text-white italic leading-none select-none drop-shadow-[0_0_80px_rgba(255,255,255,0.4)]"
                      >
                        {resumeCountdown === 0 ? 'GO!' : resumeCountdown}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botones flotantes - esquinas */}
                <div className="absolute top-4 left-4 z-[70] pointer-events-auto">
                  <button onClick={() => { if (resumeCountdown !== null) { if (resumeCountdownTimerRef.current) { clearTimeout(resumeCountdownTimerRef.current); resumeCountdownTimerRef.current = null; } resumeCountdownCancelRef.current = true; setResumeCountdown(null); if (countdownPurposeRef.current === 'start' && pendingGameDataRef.current) { const data = pendingGameDataRef.current; startGameRef.current(data.notes); pendingGameDataRef.current = null; if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; } togglePauseRef.current(); } } else if (gameState.isPaused) { handleResume(); } else { togglePause(); } }} className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg">
                    <div className="w-4 h-4">{I.pause}</div>
                  </button>
                </div>
                <div className="absolute top-4 right-4 z-[70] pointer-events-auto">
                  <button onClick={toggleFullscreen} className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg">
                    <div className="w-4 h-4">{I.maximize}</div>
                  </button>
                </div>

                {/* Barra de Vida */}
                <div className={`absolute bottom-8 left-0 right-0 z-20 px-4 ${gameState.life <= 20 ? 'animate-glitch' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 text-red-400 shrink-0 drop-shadow-[0_0_6px_rgba(248,113,113,0.8)] ${gameState.life <= 20 ? 'animate-glitch' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{boxShadow: gameState.life <= 20 ? '0 0 12px rgba(255,0,0,0.6), 0 0 4px rgba(255,0,0,0.4) inset' : ''}}>
                      <div className="h-full rounded-full transition-all duration-150" 
                        style={{
                          width: `${gameState.life}%`,
                          background: `linear-gradient(90deg, #ff2244 0%, #ff6600 ${100 - gameState.life * 0.6}%, #ffd900 ${100 - gameState.life * 0.3}%, #00ff88 100%)`,
                          boxShadow: `0 0 8px ${gameState.life <= 20 ? 'rgba(255,0,0,0.8)' : gameState.life <= 50 ? 'rgba(255,100,0,0.4)' : 'rgba(0,255,136,0.3)'}`,
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-black tabular-nums text-gray-300 w-8 text-right">{gameState.life}%</span>
                  </div>
                </div>

                {/* Barra de Duración (abajo) */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/5 backdrop-blur-xl border-t border-white/10 px-4 py-1.5 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-3 h-3">{I.clock}</div>
                    <span className="text-[9px] font-black uppercase tracking-widest tabular-nums">{formatTime(Math.max(0, gameState.trackDuration - gameState.timeRemaining))}</span>
                  </div>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-200" style={{width:`${gameState.trackDuration > 0 ? (gameState.trackDuration - gameState.timeRemaining) / gameState.trackDuration * 100 : 0}%`}}/>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 tabular-nums">-{formatTime(gameState.timeRemaining)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- GAMEOVER PHASE --- */}
          {phase === 'gameover' && (
            <motion.div key="gameover" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="max-w-4xl mx-auto w-full text-center space-y-12 relative z-10 my-auto">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-6xl md:text-8xl font-header font-black uppercase italic tracking-tighter text-red-600 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]"
                >
                  GAME OVER
                </motion.h1>
                <p className="text-gray-500 uppercase tracking-[0.4em] font-bold text-sm">Protocolo de seguridad activado: Fallo Crítico</p>
              </div>

              <div className="bg-red-600/10 border border-red-600/30 p-12 rounded-[3rem] backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent" />
                <div className="relative z-10 grid md:grid-cols-2 gap-8">
                  <div className="text-left space-y-2">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Puntuación Final</div>
                    <div className="text-5xl font-header font-black text-white">{gameState.score.toLocaleString()}</div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Errores Registrados</div>
                    <div className="text-5xl font-header font-black text-red-500">{gameState.mistakes}</div>
                  </div>
                  <div className="col-span-2 pt-8 border-t border-red-600/20">
                    <p className="text-gray-400 text-sm italic">&quot;Tu conexión con el Nexo se ha degradado por debajo de los niveles operativos.&quot;</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-6 pt-8">
                <Button onClick={() => handleStartGame(selectedTrack)} size="lg" className="!bg-white text-black font-black px-12 py-5 text-lg hover:scale-105 transition-all flex items-center gap-3">
                  <div className="w-5 h-5">{I.refresh}</div>
                  REINTENTAR SIMULACIÓN
                </Button>
                <Button onClick={handleAbortGame} variant="outline" size="lg" className="border-white/20 text-white font-black px-12 py-5 text-lg hover:bg-white/5 transition-all flex items-center gap-3">
                  <div className="w-5 h-5">{I.menu}</div>
                  VOLVER AL MENÚ
                </Button>
              </div>
            </motion.div>
          )}

          {/* --- RESULTS PHASE --- */}
          {phase === 'results' && selectedTrack && (
            <motion.div key="results" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="max-w-5xl mx-auto w-full my-auto px-4 md:px-6">
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] blur-[100px] rounded-full -z-10"
                   style={accentColors[selectedTrack.id] ? { backgroundColor: `${accentColors[selectedTrack.id]}33` } : { backgroundColor: 'rgba(128,0,255,0.2)' }}
                 />
                 
                 <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10">
                   {/* Grade */}
                   <motion.div 
                     initial={{ scale: 0, rotate: -30 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
                     className="text-[80px] md:text-[120px] leading-none font-header font-black italic shrink-0"
                     style={{ color: getGrade(gameState.accuracy).color, textShadow: `0 0 60px ${getGrade(gameState.accuracy).color}66` }}
                   >
                     {getGrade(gameState.accuracy).rank}
                   </motion.div>
                   
                   {/* Stats Compact Grid */}
                   <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                     {[
                       { label: 'Score', val: gameState.score.toLocaleString(), cls: 'text-white', icon: I.stats, iconCls: 'text-neon-cyan' },
                       { label: 'Max Combo', val: `${gameState.maxCombo}x`, cls: 'text-neon-pink', icon: I.trophy, iconCls: 'text-yellow-500' },
                       { label: 'Precisión', val: `${gameState.accuracy}%`, cls: 'text-neon-cyan', icon: I.target, iconCls: 'text-neon-cyan' },
                       { label: 'Errores', val: gameState.hits.miss, cls: 'text-red-500', icon: I.circleX, iconCls: 'text-red-400' },
                       { label: 'Punt. Máx', val: gameState.maxPotentialScore.toLocaleString(), cls: 'text-gray-300', icon: I.star, iconCls: 'text-yellow-400' },
                       { label: 'KPS', val: `${gameState.kps}`, cls: 'text-neon-green', icon: I.zap, iconCls: 'text-neon-green' },
                       { label: 'Vida', val: `${gameState.life}%`, cls: gameState.life > 50 ? 'text-green-400' : 'text-red-400', icon: I.heart, iconCls: gameState.life > 50 ? 'text-green-400' : 'text-red-400' },
                        { label: 'Progreso', val: `${gameState.notesHit} / ${gameState.totalNotes} notas`, cls: 'text-neon-purple', icon: I.clock, iconCls: 'text-neon-purple' },
                     ].map((stat, i) => (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.2 + (i * 0.05) }}
                         key={stat.label} 
                         className="bg-black/70 backdrop-blur-sm border border-white/5 p-2 md:p-3 rounded-xl"
                       >
                         <div className="text-[7px] uppercase text-gray-500 font-black tracking-widest flex items-center gap-1">
                           <div className={`w-2 h-2 ${stat.iconCls}`}>{stat.icon}</div>
                           {stat.label}
                         </div>
                         <div className={`text-sm md:text-base font-header font-black ${stat.cls}`}>{stat.val}</div>
                       </motion.div>
                     ))}
                   </div>
                   
                   {/* Grade Label */}
                   <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                     className="hidden md:flex flex-col items-center shrink-0"
                   >
                     <div className="text-xs uppercase font-black tracking-[0.3em]"
                       style={{ color: getGrade(gameState.accuracy).color }}
                     >
                       {getGrade(gameState.accuracy).label}
                     </div>
                   </motion.div>
                 </div>

                 {/* Hits Breakdown + Buttons Row */}
                 <div className="flex flex-col md:flex-row items-center gap-3 mt-4 relative z-10">
                   <div className="grid grid-cols-7 gap-1.5 flex-1 w-full">
                     {(['perfect', 'great', 'good', 'meh', 'bad', 'veryBad', 'miss'] as const).map((key, i) => {
                       const labels: Record<string, string> = { perfect: 'PERF', great: 'GREAT', good: 'GOOD', meh: 'MEH', bad: 'BAD', veryBad: 'V.BAD', miss: 'MISS' };
                       const colors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                       const icons: Record<string, React.ReactNode> = { perfect: I.star, great: I.zap, good: I.heart, meh: I.target, bad: I.flame, veryBad: I.circleX, miss: I.about };
                       const iconColors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                       return (
                         <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.03 }}
                           className="bg-black/60 backdrop-blur-sm border border-white/5 p-1.5 rounded-lg text-center"
                         >
                           <div className={`text-xs md:text-sm font-black font-header ${colors[key]}`}>{gameState.hits[key]}</div>
                           <div className="flex items-center justify-center gap-0.5 text-[6px] uppercase text-gray-600 font-black tracking-widest">
                             <div className={`w-2 h-2 ${iconColors[key]}`}>{icons[key]}</div>
                             {labels[key]}
                           </div>
                         </motion.div>
                       );
                     })}
                   </div>

                   {/* Buttons */}
                   <div className="flex gap-2 shrink-0 w-full md:w-auto">
                     <Button onClick={() => handleStartGame(selectedTrack)} variant="outline" size="lg" className="border-white/20 text-white font-black px-4 py-3 text-xs hover:bg-white/5 transition-all flex items-center gap-2 flex-1 md:flex-initial">
                       <div className="w-4 h-4">{I.refresh}</div>
                       REINTENTAR
                     </Button>
                     <Button onClick={handleAbortGame} size="lg" className="!bg-white text-black font-black px-4 py-3 text-xs shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-all flex items-center gap-2 flex-1 md:flex-initial">
                       <div className="w-4 h-4">{I.album}</div>
                       SELECCIÓN
                     </Button>
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>

          {/* Language selector modal */}
          <AnimatePresence>
            {hubSidebarView === 'lang' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center"
                onClick={() => setHubSidebarView('main')}
              >
                <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
                  className="w-full max-w-sm mx-4"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="text-lg font-header font-black uppercase tracking-tight text-white">SELECCIONAR IDIOMA</h3>
                    <button onClick={() => setHubSidebarView('main')} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">{I.close}</button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto px-4">
                    {LANGS.map((l) => {
                      const isAvailable = l.code === 'EN-US';
                      return (
                      <button
                        key={l.code}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) { setLang(l.code); setHubSidebarView('main'); }
                          else { setHubError({title:'IDIOMA NO DISPONIBLE',desc:'Actualmente solo EN-US está disponible en esta versión. Próximamente añadiremos más idiomas.'}); }
                        }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-header font-bold transition-all ${
                          lang === l.code ? 'bg-neon-blue/20 text-neon-cyan border border-neon-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="shrink-0 transition-transform duration-300 hover:scale-110 shadow-lg ring-1 ring-white/10 rounded-full">
                          {l.flag}
                        </div>
                        <span className="flex-1 text-left">{l.label}</span>
                        {!isAvailable && <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink">BETA</span>}
                        {lang === l.code && isAvailable && (
                          <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- CONFIG MODAL (TABBED) --- */}
          <AnimatePresence>
            {isConfigOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl relative">
                  
                  {/* Header fijo */}
                  <div className="shrink-0 px-8 pt-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-header font-black text-white italic uppercase flex items-center gap-3">
                        <div className="w-5 h-5 text-neon-cyan">{I.settings}</div> Preferencias
                      </h3>
                      <button onClick={() => setIsConfigOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                        <div className="w-4 h-4">{I.circleX}</div>
                      </button>
                    </div>
                    {/* Navegación de pestañas */}
                    <div className="flex items-center gap-1 border-b border-white/5 pb-0">
                      <button onClick={() => {
                        const tabs = ['general','visuals','audio','controls','offset','accessibility','debug'];
                        const idx = tabs.indexOf(configTab);
                        setConfigTab(tabs[(idx - 1 + tabs.length) % tabs.length] as any);
                      }} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        <div className="w-3.5 h-3.5">{I.arrowLeft}</div>
                      </button>
                      <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {([
                          { id: 'general', label: 'General', icon: I.settings },
                          { id: 'visuals', label: 'Visuales', icon: I.eye },
                          { id: 'audio', label: 'Audio', icon: I.volume },
                          { id: 'controls', label: 'Controles', icon: I.keyboard },
                          { id: 'offset', label: 'Offset', icon: I.clock },
                          { id: 'accessibility', label: 'Accesibilidad', icon: I.accessibility },
                          { id: 'debug', label: 'Debug', icon: I.activity },
                        ] as const).map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setConfigTab(tab.id)}
                            className={`shrink-0 flex items-center gap-2 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-t-xl border-t border-l border-r transition-all ${
                              configTab === tab.id
                                ? 'bg-white/5 border-white/10 text-white -mb-px'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-3.5 h-3.5">{tab.icon}</div>
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => {
                        const tabs = ['general','visuals','audio','controls','offset','accessibility','debug'];
                        const idx = tabs.indexOf(configTab);
                        setConfigTab(tabs[(idx + 1) % tabs.length] as any);
                      }} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        <div className="w-3.5 h-3.5">{I.chevronRight}</div>
                      </button>
                    </div>
                  </div>

                  {/* Contenedor scrolleable con el contenido activo */}
                  <div className="flex-1 overflow-y-auto px-8 pb-6 pt-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff22 transparent' }}>
                  {configTab === 'general' && (
                    <motion.div key="general" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      {/* Welcome description */}
                      <div className="bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-purple/10 p-6 rounded-xl border border-white/5 text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                          <div className="w-7 h-7 text-neon-cyan">{I.settings}</div>
                        </div>
                        <h4 className="text-lg font-header font-black text-white uppercase tracking-tight mb-2">Preferencias Generales</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                          Configura tu experiencia en MuzicMania. Ajusta pantalla, idioma y apariencia a tu gusto.
                        </p>
                      </div>
                      {/* Fullscreen Toggle */}
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                          <div className="w-4 h-4">{I.maximize}</div>
                          <span>Pantalla</span>
                        </div>
                        <button
                          onClick={toggleFullscreen}
                          className="w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all flex items-center justify-center gap-3"
                        >
                          <div className="w-4 h-4">{isFullscreen ? I.minimize : I.maximize}</div>
                          {isFullscreen ? 'SALIR DE PANTALLA COMPLETA' : 'ACTIVAR PANTALLA COMPLETA'}
                        </button>
                      </div>
                      {/* Language - full list, only EN-US usable */}
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                          <div className="w-4 h-4">{I.globe}</div>
                          <span>Idioma</span>
                        </div>
                        <div className="space-y-1">
                          {LANGS.map((l) => {
                            const isAvailable = l.code === 'EN-US';
                            return (
                            <button key={l.code}
                              disabled={!isAvailable}
                              onClick={() => {
                                if (isAvailable) { setLang(l.code); }
                                else { setHubError({title:'IDIOMA NO DISPONIBLE',desc:'Actualmente solo EN-US está disponible en esta versión. Próximamente añadiremos más idiomas.'}); }
                              }}
                              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-header font-bold transition-all ${
                                lang === l.code ? 'bg-neon-blue/20 text-neon-cyan border border-neon-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                              } ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="w-6 h-6 shrink-0 flex items-center justify-center">{l.flag}</div>
                              <span className="flex-1 text-left">{l.label}</span>
                              {!isAvailable && <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink">BETA</span>}
                              {lang === l.code && isAvailable && (
                                <svg className="w-3.5 h-3.5 text-neon-cyan shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Theme Toggle - Auto (oscuro) default, Claro disabled */}
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                          <div className="w-4 h-4">{I.contrast}</div>
                          <span>Tema</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => {}}
                            className="w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan flex items-center justify-center gap-3 cursor-default"
                          >
                            <div className="w-4 h-4">{I.moon}</div>
                            Automático (oscuro)
                            <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </button>
                          <button onClick={() => setHubError({title:'FUNCIÓN BETA',desc:'El cambio de tema no está disponible en esta versión. Por defecto el juego está en modo oscuro.'})}
                            className="w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl border border-white/10 bg-white/5 text-gray-500 flex items-center justify-center gap-3 cursor-not-allowed opacity-40"
                          >
                            <div className="w-4 h-4">{I.sun}</div>
                            Claro
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {configTab === 'accessibility' && (
                    <motion.div key="accessibility" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-5">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.fingerprint}</div>
                            <span>Modo Daltonismo</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'none', label: 'Ninguno', icon: I.eye, color: 'border-white/30 bg-white/10' },
                              { id: 'protanopia', label: 'Protanop&iacute;a', icon: I.eyeOff, color: 'border-green-500/60 bg-green-500/20' },
                              { id: 'deuteranopia', label: 'Deuteranopía', icon: I.eyeOff, color: 'border-yellow-500/60 bg-yellow-500/20' },
                              { id: 'tritanopia', label: 'Tritanopía', icon: I.eyeOff, color: 'border-blue-500/60 bg-blue-500/20' },
                              { id: 'achromatopsia', label: 'Acromatopsia', icon: I.contrast, color: 'border-gray-400/60 bg-gray-400/20' },
                            ].map(m => (
                              <button key={m.id} onClick={() => { setColorblindMode(m.id); localStorage.setItem('display_colorblind_mode', m.id); }}
                                className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all flex items-center gap-1.5 ${
                                  colorblindMode === m.id
                                    ? `${m.color} text-white`
                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                }`}>
                                <div className="w-3.5 h-3.5">{m.icon}</div>
                                <span>{m.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-white/5 pt-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                              <div className="w-4 h-4">{I.contrast}</div>
                              <span>Alto Contraste</span>
                            </div>
                            <button onClick={() => { setHighContrast(!highContrast); localStorage.setItem('display_high_contrast', String(!highContrast)); }}
                              className={`relative w-12 h-6 rounded-full transition-all border ${highContrast ? 'bg-yellow-500 border-yellow-400' : 'bg-white/10 border-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${highContrast ? 'left-[26px]' : 'left-[1px]'}`} />
                            </button>
                          </div>
                          <p className="mt-2 text-[9px] text-gray-600 leading-relaxed">Aumenta el contraste de colores para mejorar la legibilidad de notas y elementos del juego.</p>
                        </div>

                      </div>
                    </motion.div>
                  )}
                  {configTab === 'debug' && (
                    <motion.div key="debug" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-5">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                            <div className="w-4 h-4">{I.bug}</div>
                            <span>Modo Debug</span>
                          </div>
                          <button onClick={() => {
                            const next = !showDebug;
                            setShowDebug(next);
                            localStorage.setItem('debug_enabled', String(next));
                            if (!next) setDebugShowInfoPanel(false);
                          }} className={`relative w-12 h-6 rounded-full transition-all border ${showDebug ? 'bg-neon-cyan border-neon-cyan' : 'bg-white/10 border-white/20'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${showDebug ? 'left-[26px]' : 'left-[1px]'}`} />
                          </button>
                        </div>
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider">Activa el panel de informaci&oacute;n superpuesto en pantalla</p>

                        {showDebug && (
                          <>
                            <div className="border-t border-white/5 pt-5 space-y-4">
                              <div className="flex items-center gap-2 text-[10px] text-neon-cyan uppercase font-black tracking-widest">
                                <div className="w-4 h-4">{I.sliders}</div>
                                <span>Mostrar en Panel</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                  <div className="w-3 h-3">{I.activity}</div>
                                  <span>FPS</span>
                                </div>
                                <button onClick={() => { setDebugShowFps(!debugShowFps); localStorage.setItem('debug_show_fps', String(!debugShowFps)); }}
                                  className={`relative w-12 h-6 rounded-full transition-all border ${debugShowFps ? 'bg-neon-cyan border-neon-cyan' : 'bg-white/10 border-white/20'}`}>
                                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${debugShowFps ? 'left-[26px]' : 'left-[1px]'}`} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                  <div className="w-3 h-3">{I.wifi}</div>
                                  <span>Ping</span>
                                </div>
                                <button onClick={() => { setDebugShowPing(!debugShowPing); localStorage.setItem('debug_show_ping', String(!debugShowPing)); }}
                                  className={`relative w-12 h-6 rounded-full transition-all border ${debugShowPing ? 'bg-neon-purple border-neon-purple' : 'bg-white/10 border-white/20'}`}>
                                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${debugShowPing ? 'left-[26px]' : 'left-[1px]'}`} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                  <div className="w-3 h-3">{I.radio}</div>
                                  <span>Latencia</span>
                                </div>
                                <button onClick={() => { setDebugShowLatency(!debugShowLatency); localStorage.setItem('debug_show_latency', String(!debugShowLatency)); }}
                                  className={`relative w-12 h-6 rounded-full transition-all border ${debugShowLatency ? 'bg-neon-pink border-neon-pink' : 'bg-white/10 border-white/20'}`}>
                                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${debugShowLatency ? 'left-[26px]' : 'left-[1px]'}`} />
                                </button>
                              </div>
                            </div>

                            {/* Toggle panel overlay */}
                            <div className="border-t border-white/5 pt-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                  <div className="w-4 h-4">{I.monitor}</div>
                                  <span>Panel Superpuesto</span>
                                </div>
                                <button onClick={() => setDebugShowInfoPanel(!debugShowInfoPanel)}
                                  className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all flex items-center gap-1.5 ${debugShowInfoPanel ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                                  <div className="w-3 h-3">{debugShowInfoPanel ? I.eye : I.eyeOff}</div>
                                  {debugShowInfoPanel ? 'ACTIVO' : 'INACTIVO'}
                                </button>
                              </div>
                              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider mt-2">Panel arrastrable con la informaci&oacute;n seleccionada</p>
                            </div>

                            {/* Staff options */}
                            {(user?.role === 'staff' || user?.role === 'admin') && (
                              <div className="border-t border-white/5 pt-5 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] text-neon-cyan uppercase font-black tracking-widest">
                                  <div className="w-4 h-4">{I.shield}</div>
                                  <span>Staff — Opciones Avanzadas</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                    <div className="w-3 h-3">{I.grid}</div>
                                    <span>Overlay de Colisi&oacute;n</span>
                                  </div>
                                  <button className={`relative w-12 h-6 rounded-full transition-all border bg-white/10 border-white/20`}>
                                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md left-[1px]" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                    <div className="w-3 h-3">{I.fileText}</div>
                                    <span>Log de Eventos</span>
                                  </div>
                                  <button className={`relative w-12 h-6 rounded-full transition-all border bg-white/10 border-white/20`}>
                                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md left-[1px]" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                    <div className="w-3 h-3">{I.zap}</div>
                                    <span>Simular Lag</span>
                                  </div>
                                  <button className={`relative w-12 h-6 rounded-full transition-all border bg-white/10 border-white/20`}>
                                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md left-[1px]" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="border-t border-white/5 pt-5">
                              <button onClick={() => {
                                setShowDebug(false); setDebugShowInfoPanel(false);
                                localStorage.removeItem('debug_enabled');
                              }} className="w-full py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                                <div className="w-3 h-3">{I.trash}</div>
                                DESACTIVAR DEBUG
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {configTab === 'audio' && (
                    <motion.div key="audio" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-5">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-white mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4">{I.music}</div>
                              <span>M&uacute;sica</span>
                            </div>
                            <span className="text-neon-cyan">{musicVol}%</span>
                          </div>
                          <div className="relative h-8 flex items-center">
                            <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: `linear-gradient(to right, #0891b2 0%, #06b6d4 ${musicVol}%, #374151 ${musicVol}%, #374151 100%)` }} />
                            <input type="range" min="0" max="100" value={musicVol} onChange={e => setMusicVol(Number(e.target.value))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="absolute left-2 flex items-center gap-1 z-0 pointer-events-none">
                              <div className={`w-2 h-2 rounded-full transition-colors ${musicVol === 0 ? 'bg-gray-500' : 'bg-neon-cyan'}`} />
                              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${musicVol < 30 ? 'bg-gray-500' : musicVol < 70 ? 'bg-neon-cyan' : 'bg-cyan-300'}`} />
                              <div className={`w-3 h-3 rounded-full transition-colors ${musicVol < 60 ? 'bg-gray-500' : musicVol < 90 ? 'bg-neon-cyan' : 'bg-cyan-200'}`} />
                            </div>
                            <div className="absolute right-2 text-[8px] font-bold text-white/40 z-0 pointer-events-none">{musicVol}%</div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold text-white mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4">{I.volume}</div>
                              <span>Efectos (SFX)</span>
                            </div>
                            <span className="text-neon-pink">{sfxVol}%</span>
                          </div>
                          <div className="relative h-8 flex items-center">
                            <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: `linear-gradient(to right, #be185d 0%, #ec4899 ${sfxVol}%, #374151 ${sfxVol}%, #374151 100%)` }} />
                            <input type="range" min="0" max="100" value={sfxVol} onChange={e => setSfxVol(Number(e.target.value))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="absolute right-2 text-[8px] font-bold text-white/40 z-0 pointer-events-none">{sfxVol}%</div>
                          </div>
                        </div>
                        {/* 1. Entrada de Audio (Micrófono) */}
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.mic}</div>
                            <span>1. Entrada de Audio (Micr&oacute;fono)</span>
                          </div>
                          <div className="space-y-3">
                            {/* Volumen micrófono */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[9px] text-gray-500 uppercase font-black tracking-widest">
                                <span>Volumen Micr&oacute;fono</span>
                                <span className={!audioInputDevice ? 'text-gray-600' : 'text-neon-cyan'}>{micVolume}%</span>
                              </div>
                              <input type="range" min="0" max="100" value={micVolume}
                                disabled={!audioInputDevice}
                                onChange={e => { const v = Number(e.target.value); setMicVolume(v); localStorage.setItem('audio_mic_vol', String(v)); }}
                                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-neon-cyan ${!audioInputDevice ? 'opacity-30 cursor-not-allowed' : ''}`}
                              />
                              {!audioInputDevice && (
                                <p className="text-[7px] text-gray-600 font-bold uppercase tracking-wider">Selecciona un micr&oacute;fono para ajustar el volumen</p>
                              )}
                            </div>
                            <div className="relative">
                              <button onClick={() => setShowInputDeviceDropdown(!showInputDeviceDropdown)}
                                className="w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 transition-all flex items-center justify-center gap-2">
                                <div className="w-4 h-4">{I.mic}</div>
                                {audioInputDevice ? inputDeviceList.find(d => d.deviceId === audioInputDevice)?.label?.replace(/\(.*\)/g,'').trim() || 'Micrófono seleccionado' : 'SELECCIONAR MICRÓFONO'}
                                <div className="w-3 h-3 ml-auto">{showInputDeviceDropdown ? I.chevronUp : I.chevronDown}</div>
                              </button>
                              {showInputDeviceDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                                  {inputDeviceList.length === 0 ? (
                                    <div className="px-4 py-3 text-[9px] text-gray-500 text-center space-y-2">
                                      <p>No se detectaron micr&oacute;fonos</p>
                                      <button onClick={async () => {
                                        try {
                                          await navigator.mediaDevices.getUserMedia({ audio: true });
                                          const devices = await navigator.mediaDevices.enumerateDevices();
                                          setInputDeviceList(devices.filter(d => d.kind === 'audioinput'));
                                        } catch { setHubError({title:'ERROR DE PERMISOS',desc:'No se pudo acceder al micrófono. Verifica los permisos del navegador.'}); }
                                      }} className="mt-2 text-neon-cyan hover:underline flex items-center justify-center gap-1">
                                        <div className="w-3 h-3">{I.refresh}</div> Solicitar permisos
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={async () => {
                                        try {
                                          await navigator.mediaDevices.getUserMedia({ audio: true });
                                          const devices = await navigator.mediaDevices.enumerateDevices();
                                          setInputDeviceList(devices.filter(d => d.kind === 'audioinput'));
                                        } catch {}
                                      }} className="w-full px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-neon-cyan hover:bg-white/5 transition-all flex items-center justify-center gap-1 border-b border-white/5">
                                        <div className="w-3 h-3">{I.refresh}</div> RE-ESCANEAR
                                      </button>
                                      {inputDeviceList.map(d => (
                                        <button key={d.deviceId} onClick={() => {
                                          setAudioInputDevice(d.deviceId); localStorage.setItem('audio_input_device', d.deviceId);
                                          setShowInputDeviceDropdown(false);
                                        }} className={`w-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-left hover:bg-white/5 transition-all flex items-center gap-2 ${audioInputDevice === d.deviceId ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-400'}`}>
                                          <div className="w-3 h-3 shrink-0">{I.mic}</div>
                                          <span className="truncate">{d.label || 'Micrófono'}</span>
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* 2. Salida de Audio */}
                        <div className="border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.monitorSpeaker}</div>
                            <span>2. Salida de Audio</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setAudioOutput('stereo'); localStorage.setItem('audio_output', 'stereo'); }}
                                className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                                  audioOutput === 'stereo'
                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                }`}>
                                <div className="w-4 h-4">{I.radio}</div>
                                Est&eacute;reo
                              </button>
                              <button onClick={() => { setAudioOutput('mono'); localStorage.setItem('audio_output', 'mono'); }}
                                className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${
                                  audioOutput === 'mono'
                                    ? 'bg-neon-purple/20 border-neon-purple text-neon-purple' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                }`}>
                                <div className="w-4 h-4">{I.circle}</div>
                                Mono
                              </button>
                            </div>
                            <div className="relative">
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Dispositivo de Salida</div>
                              <button onClick={() => setShowAudioDeviceDropdown(!showAudioDeviceDropdown)}
                                className="w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 transition-all flex items-center justify-center gap-2">
                                <div className="w-4 h-4">{I.monitorSpeaker}</div>
                                {audioDevice ? audioDeviceList.find(d => d.deviceId === audioDevice)?.label?.replace(/\(.*\)/g,'').trim() || 'Dispositivo seleccionado' : 'SELECCIONAR DISPOSITIVO'}
                                <div className="w-3 h-3 ml-auto">{showAudioDeviceDropdown ? I.chevronUp : I.chevronDown}</div>
                              </button>
                              {showAudioDeviceDropdown && (
                                <div className="absolute z-20 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                                  {audioDeviceList.length === 0 ? (
                                    <div className="px-4 py-3 text-[9px] text-gray-500 text-center space-y-2">
                                      <p>No se detectaron dispositivos de salida</p>
                                      <button onClick={async () => {
                                        try {
                                          const devices = await navigator.mediaDevices.enumerateDevices();
                                          setAudioDeviceList(devices.filter(d => d.kind === 'audiooutput'));
                                        } catch {}
                                      }} className="mt-2 text-neon-cyan hover:underline flex items-center justify-center gap-1">
                                        <div className="w-3 h-3">{I.refresh}</div> Actualizar
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={async () => {
                                        try {
                                          const devices = await navigator.mediaDevices.enumerateDevices();
                                          setAudioDeviceList(devices.filter(d => d.kind === 'audiooutput'));
                                        } catch {}
                                      }} className="w-full px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-neon-cyan hover:bg-white/5 transition-all flex items-center justify-center gap-1 border-b border-white/5">
                                        <div className="w-3 h-3">{I.refresh}</div> RE-ESCANEAR
                                      </button>
                                      {audioDeviceList.map(d => (
                                        <button key={d.deviceId} onClick={() => {
                                          setAudioDevice(d.deviceId); localStorage.setItem('audio_device', d.deviceId);
                                          setShowAudioDeviceDropdown(false);
                                        }} className={`w-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-left hover:bg-white/5 transition-all flex items-center gap-2 ${audioDevice === d.deviceId ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-400'}`}>
                                          <div className="w-3 h-3 shrink-0">{I.monitorSpeaker}</div>
                                          <span className="truncate">{d.label || 'Dispositivo de audio'}</span>
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Sonido de Acierto */}
                        <div className="border-t border-white/5 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                              <div className="w-4 h-4">{I.zap}</div>
                              <span>Sonido de Acierto</span>
                            </div>
                            <button onClick={() => {
                              setHitSound(!hitSound);
                            }} className={`relative w-12 h-6 rounded-full transition-all border ${hitSound ? 'bg-neon-cyan border-neon-cyan' : 'bg-white/10 border-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${hitSound ? 'left-[26px]' : 'left-[1px]'}`} />
                            </button>
                          </div>
                          <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider mt-2">Al activarse, sonar&aacute; un &quot;tick&quot; al acertar una nota</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {configTab === 'controls' && (
                    <motion.div key="controls" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-4">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">Tipo de Input</div>
                          <div className="flex gap-2">
                            <button onClick={() => saveInputMode('arrows')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${inputMode === 'arrows' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon-cyan/20' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                              Flechas
                            </button>
                            <button onClick={() => saveInputMode('wasd')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${inputMode === 'wasd' ? 'bg-neon-pink/20 border-neon-pink text-neon-pink shadow-neon-pink/20' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                              W A S D
                            </button>
                            <button onClick={() => saveInputMode('custom')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${inputMode === 'custom' ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-neon-purple/20' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                              Custom
                            </button>
                          </div>
                          {inputMode === 'custom' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mt-4">
                              {customKeys.map((key, i) => (
                                <button
                                  key={i}
                                  onClick={() => setEditingKeyIndex(i)}
                                  className={`py-3 text-center rounded-xl border-2 font-black transition-all ${
                                    editingKeyIndex === i
                                    ? 'bg-neon-purple border-white text-white shadow-neon-purple animate-pulse'
                                    : 'bg-black/50 border-neon-purple/30 text-neon-purple hover:border-neon-purple'
                                  }`}
                                >
                                  {editingKeyIndex === i ? '...' : key.replace('Key', '').replace('Arrow', '').toUpperCase()}
                                </button>
                              ))}
                              <p className="col-span-4 text-[9px] text-gray-500 uppercase text-center mt-2 font-bold tracking-widest">Haz clic en un carril para reasignar tecla</p>
                            </motion.div>
                          )}
                        </div>
                        <div className="border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.smartphone}</div>
                            <span>Controles T&aacute;ctiles</span>
                          </div>
                          <button onClick={() => { setTactileControls(!tactileControls); localStorage.setItem('display_tactile', String(!tactileControls)); }}
                            className={`w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 ${
                              tactileControls ? 'bg-neon-purple/20 border-neon-purple text-neon-purple' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            }`}>
                            <div className="w-4 h-4">{I.smartphone}</div>
                            {tactileControls ? 'ACTIVADOS' : 'DESACTIVADOS'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {configTab === 'visuals' && (
                    <motion.div key="visuals" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-5">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.target}</div>
                            <span>Zonas de Acierto</span>
                          </div>
                          <button
                            onClick={() => { setShowHitZoneVisuals(!showHitZoneVisuals); setShowHitZones(!showHitZoneVisuals); }}
                            className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-3 ${
                              showHitZoneVisuals
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-4 h-4">{showHitZoneVisuals ? I.eye : I.eyeOff}</div>
                            {showHitZoneVisuals ? 'ACTIVADO' : 'DESACTIVADO'}
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.clock}</div>
                            <span>Precisi&oacute;n MS</span>
                          </div>
                          <button
                            onClick={() => setShowPrecisionMSState(!showPrecisionMS)}
                            className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-3 ${
                              showPrecisionMS
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-4 h-4">{I.clock}</div>
                            {showPrecisionMS ? 'MS ACTIVADO (±0.00ms)' : 'MS DESACTIVADO'}
                          </button>
                        </div>
                        {/* Gráficos */}
                        <div className="border-t border-white/5 pt-5">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-4 h-4">{I.layers}</div>
                            <span>Calidad Gr&aacute;fica</span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { id: 'very_low', label: 'Muy Baja', icon: I.circle, color: 'text-gray-500' },
                                { id: 'low', label: 'Baja', icon: I.circle, color: 'text-yellow-600' },
                                { id: 'medium', label: 'Media', icon: I.circle, color: 'text-yellow-400' },
                                { id: 'high', label: 'Alta', icon: I.circle, color: 'text-green-400' },
                                { id: 'ultra', label: 'Ultra', icon: I.sparkles, color: 'text-neon-cyan' },
                              ].map(q => (
                                <button key={q.id} onClick={() => {
                                  setGraphicsQuality(q.id as any);
                                  localStorage.setItem('graphics_quality', q.id);
                                  if (q.id === 'very_low') { setDisableGlow(true); setDisableBgEffects(true); setDisableFloatingIcons(true); }
                                  else if (q.id === 'low') { setDisableGlow(true); setDisableBgEffects(true); setDisableFloatingIcons(false); }
                                  else if (q.id === 'medium') { setDisableGlow(false); setDisableBgEffects(true); setDisableFloatingIcons(false); }
                                  else if (q.id === 'high') { setDisableGlow(false); setDisableBgEffects(false); setDisableFloatingIcons(false); }
                                  else { setDisableGlow(false); setDisableBgEffects(false); setDisableFloatingIcons(false); }
                                }} className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all flex items-center gap-1.5 ${
                                  graphicsQuality === q.id ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                }`}>
                                  <div className="w-3 h-3">{q.icon}</div>
                                  {q.label}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => {
                              setGraphicsAutoDetecting(true);
                              setTimeout(() => {
                                const canvas = document.createElement('canvas');
                                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                                const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
                                const mem = (navigator as any).deviceMemory || 4;
                                let detected: string;
                                if (!gl || mem < 2) { detected = 'very_low'; setDisableGlow(true); setDisableBgEffects(true); setDisableFloatingIcons(true); }
                                else if (isMobile || mem < 4) { detected = 'low'; setDisableGlow(true); setDisableBgEffects(true); setDisableFloatingIcons(false); }
                                else if (mem < 8) { detected = 'medium'; setDisableGlow(false); setDisableBgEffects(true); setDisableFloatingIcons(false); }
                                else { detected = 'high'; setDisableGlow(false); setDisableBgEffects(false); setDisableFloatingIcons(false); }
                                setGraphicsQuality(detected as any);
                                localStorage.setItem('graphics_quality', detected);
                                localStorage.setItem('graphics_disable_glow', String(disableGlow));
                                localStorage.setItem('graphics_disable_bg', String(disableBgEffects));
                                localStorage.setItem('graphics_disable_floating', String(disableFloatingIcons));
                                setGraphicsAutoDetecting(false);
                              }, 1500);
                            }} className="w-full py-2.5 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                              <div className="w-3 h-3">{graphicsAutoDetecting ? I.refresh : I.zap}</div>
                              {graphicsAutoDetecting ? 'DETECTANDO...' : 'DETECTAR AUTOMÁTICAMENTE'}
                            </button>
                          </div>
                        </div>
                        {/* Toggles individuales */}
                        <div className="border-t border-white/5 pt-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                              <div className="w-4 h-4">{I.sparkles}</div>
                              <span>Efectos Glow</span>
                            </div>
                            <button onClick={() => { setDisableGlow(!disableGlow); localStorage.setItem('graphics_disable_glow', String(!disableGlow)); }}
                              className={`relative w-12 h-6 rounded-full transition-all border ${!disableGlow ? 'bg-neon-cyan border-neon-cyan' : 'bg-white/10 border-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${!disableGlow ? 'left-[26px]' : 'left-[1px]'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                              <div className="w-4 h-4">{I.grid}</div>
                              <span>Efectos de Fondo</span>
                            </div>
                            <button onClick={() => { setDisableBgEffects(!disableBgEffects); localStorage.setItem('graphics_disable_bg', String(!disableBgEffects)); }}
                              className={`relative w-12 h-6 rounded-full transition-all border ${!disableBgEffects ? 'bg-neon-purple border-neon-purple' : 'bg-white/10 border-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${!disableBgEffects ? 'left-[26px]' : 'left-[1px]'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                              <div className="w-4 h-4">{I.star}</div>
                              <span>Iconos Flotantes</span>
                            </div>
                            <button onClick={() => { setDisableFloatingIcons(!disableFloatingIcons); localStorage.setItem('graphics_disable_floating', String(!disableFloatingIcons)); }}
                              className={`relative w-12 h-6 rounded-full transition-all border ${!disableFloatingIcons ? 'bg-neon-pink border-neon-pink' : 'bg-white/10 border-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${!disableFloatingIcons ? 'left-[26px]' : 'left-[1px]'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {configTab === 'offset' && (
                    <motion.div key="offset" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                            <div className="w-4 h-4">{I.zap}</div>
                            Indicador Early / Late
                          </span>
                          <button
                            onClick={() => setShowEarlyLateState(!showEarlyLate)}
                            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center gap-1.5 ${
                              showEarlyLate
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <div className="w-3 h-3">{showEarlyLate ? I.eye : I.eyeOff}</div>
                            {showEarlyLate ? 'ACTIVADO' : 'DESACTIVADO'}
                          </button>
                        </div>

                        {!isCalibrating ? (
                          <>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                <div className="w-4 h-4">{I.radio}</div>
                                Prueba de Audio
                              </div>
                              <button
                                onClick={() => {
                                  try {
                                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                    if (ctx.state === 'suspended') ctx.resume();
                                    const osc = ctx.createOscillator();
                                    const gain = ctx.createGain();
                                    osc.type = 'sine';
                                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                                    const sfxFactor = sfxVol / 100;
                                    gain.gain.setValueAtTime(0.3 * sfxFactor, ctx.currentTime);
                                    gain.gain.exponentialRampToValueAtTime(0.01 * sfxFactor, ctx.currentTime + 0.5);
                                    osc.connect(gain);
                                    gain.connect(ctx.destination);
                                    osc.start(ctx.currentTime);
                                    osc.stop(ctx.currentTime + 0.5);
                                  } catch (e) { console.error('Audio test error:', e); }
                                }}
                                className="w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 transition-all flex items-center justify-center gap-2"
                              >
                                <div className="w-4 h-4">{I.headphones}</div>
                                PROBAR TONO DE REFERENCIA (440Hz)
                              </button>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                <div className="w-4 h-4">{I.sliders}</div>
                                Calibraci&oacute;n de Offset
                              </div>
                              <p className="text-[8px] text-gray-600 font-bold uppercase tracking-wider mb-3">Presiona la barra espaciadora al ritmo del pulso visual para calibrar tu offset autom&aacute;ticamente</p>
                              <button
                                onClick={() => {
                                  setCalibrationHits(0);
                                  setCalibrationOffsets([]);
                                  setDetectedOffset(null);
                                  setIsCalibrating(true);
                                }}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-neon-purple/30 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple transition-all flex items-center justify-center gap-2"
                              >
                                <div className="w-4 h-4">{I.zap}</div>
                                INICIAR CALIBRACI&Oacute;N
                              </button>
                            </div>
                            {detectedOffset !== null && (
                              <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl p-4 space-y-3">
                                <div className="text-center">
                                  <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Offset detectado</div>
                                  <div className="text-xl font-header font-black text-neon-cyan">{detectedOffset > 0 ? `+${detectedOffset}` : detectedOffset} ms</div>
                                </div>
                                <div>
                                  <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center gap-1">
                                    <div className="w-3 h-3">{I.sliders}</div>
                                    Ajuste manual
                                  </div>
                                  <input
                                    type="range"
                                    min="-200"
                                    max="200"
                                    value={audioOffset}
                                    onChange={e => setAudioOffsetState(Number(e.target.value))}
                                    className="w-full accent-neon-cyan h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="text-center text-[10px] font-bold text-gray-400 mt-1">{audioOffset > 0 ? `+${audioOffset}` : audioOffset} ms</div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setAudioOffsetState(detectedOffset); }}
                                    className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 transition-all flex items-center justify-center gap-1"
                                  >
                                    <div className="w-3 h-3">{I.check}</div>
                                    APLICAR
                                  </button>
                                  <button
                                    onClick={() => setDetectedOffset(null)}
                                    className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1"
                                  >
                                    <div className="w-3 h-3">{I.circleX}</div>
                                    DESCARTAR
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center justify-center gap-2">
                                <div className="w-4 h-4">{I.zap}</div>
                                Calibrando... Presiona ESPACIO al ritmo del pulso
                              </div>
                              <div className="flex justify-center gap-1 mb-4">
                                {[0,1,2,3,4].map(i => (
                                  <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < calibrationHits ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.8)]' : 'bg-white/10'}`} />
                                ))}
                              </div>
                              <div className="text-[8px] text-gray-600 font-bold uppercase">{calibrationHits}/5 golpes</div>
                            </div>

                            {/* Barra de pulso infinita */}
                            <div className="relative h-16 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                              <motion.div
                                key={calibrationHits}
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent blur-sm"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-0.5 h-full bg-white/20" />
                              </div>
                              <button
                                onClick={() => {
                                  if (calibrationHits >= 5) return;
                                  const now = performance.now();
                                  setCalibrationOffsets(prev => [...prev, now % 1000]);
                                  setCalibrationHits(prev => prev + 1);
                                  // Play calibration tone on hit
                                  try {
                                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                    if (ctx.state === 'suspended') ctx.resume();
                                    const osc = ctx.createOscillator();
                                    const gain = ctx.createGain();
                                    osc.type = 'square';
                                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                                    const sfxFactor = sfxVol / 100;
                                    gain.gain.setValueAtTime(0.15 * sfxFactor, ctx.currentTime);
                                    gain.gain.exponentialRampToValueAtTime(0.01 * sfxFactor, ctx.currentTime + 0.2);
                                    osc.connect(gain);
                                    gain.connect(ctx.destination);
                                    osc.start(ctx.currentTime);
                                    osc.stop(ctx.currentTime + 0.2);
                                  } catch {}
                                  // Flash visual
                                  const flash = document.createElement('div');
                                  flash.className = 'fixed inset-0 z-[200] bg-white pointer-events-none';
                                  document.body.appendChild(flash);
                                  setTimeout(() => { flash.style.transition = 'opacity 0.3s'; flash.style.opacity = '0'; }, 80);
                                  setTimeout(() => flash.remove(), 400);

                                  if (calibrationHits >= 4) {
                                    // Calculate average offset after 5 hits
                                    setTimeout(() => {
                                      const avg = Math.round((now % 200) - 100);
                                      setDetectedOffset(avg);
                                      setIsCalibrating(false);
                                    }, 500);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full cursor-pointer z-10"
                              />
                            </div>

                            <button
                              onClick={() => setIsCalibrating(false)}
                              className="w-full py-2 text-[8px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                            >
                              CANCELAR CALIBRACI&Oacute;N
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- HELP MODAL --- */}
          <AnimatePresence>
            {isHelpOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsHelpOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] max-w-3xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative p-8"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button onClick={() => setIsHelpOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10">
                    <div className="w-5 h-5">{I.circleX}</div>
                  </button>
                  <div className="text-center space-y-4 mb-8">
                    <h2 className="text-2xl font-header font-black uppercase italic tracking-tighter text-white">
                      GU&Iacute;A DE <span className="text-neon-cyan">MUZICMANIA</span>
                    </h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xl mx-auto">Domina el ritmo y alcanza la sincronizaci&oacute;n perfecta.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <h3 className="text-sm font-header font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 text-neon-cyan">{I.keyboard}</div> Controles
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        {[
                          { mode: 'FLECHAS', keys: ['←', '↓', '↑', '→'] },
                          { mode: 'WASD', keys: ['A', 'S', 'W', 'D'] },
                        ].map(group => (
                          <div key={group.mode} className="col-span-2">
                            <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-2">{group.mode}</div>
                            <div className="flex justify-center gap-2">
                              {group.keys.map((k, i) => (
                                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white/10 flex items-center justify-center font-black text-white/70 bg-black/30 text-sm">{k}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-[9px] text-gray-500 font-bold text-center">Usa FLECHAS o WASD para golpear las notas. Mant&eacute;n presionado para notas largas (holds).</div>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <h3 className="text-sm font-header font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 text-neon-purple">{I.target}</div> Puntuaci&oacute;n
                      </h3>
                      <div className="space-y-2">
                        {[
                          { grade: 'PERFECT', desc: '+100pts - Sincronizaci&oacute;n exacta (±20ms)', color: 'text-neon-cyan' },
                          { grade: 'GREAT', desc: '+70pts - Ligeramente desviado (±50ms)', color: 'text-neon-purple' },
                          { grade: 'GOOD', desc: '+40pts - Notable pero aceptado (±90ms)', color: 'text-green-400' },
                          { grade: 'MISS', desc: '+0pts - Rompe el combo', color: 'text-red-500' },
                        ].map(item => (
                          <div key={item.grade} className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-white/5">
                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-black/50 border border-white/10 w-[120px] text-center shrink-0 ${item.color}`}>{item.grade}</div>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[9px]">
                        <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                          <span className="text-neon-cyan font-black">Combo</span>
                          <p className="text-gray-500 font-bold">Multiplica tu puntuaci&oacute;n por hasta 8x</p>
                        </div>
                        <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                          <span className="text-neon-pink font-black">KPS</span>
                          <p className="text-gray-500 font-bold">Notas por segundo — mide tu velocidad</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/help"
                      className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    >BUSCAR M&Aacute;S AYUDA</Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>



          {/* CREDITS MODAL */}
          <AnimatePresence>
            {isCreditsOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsCreditsOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] p-10 max-w-xl w-full text-center relative shadow-2xl"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button onClick={() => setIsCreditsOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white w-6 h-6">{I.circleX}</button>
                  <div className="w-16 h-16 bg-neon-pink/10 rounded-full flex items-center justify-center text-neon-pink mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,255,0.1)]">
                    <div className="w-8 h-8">{I.starOutline}</div>
                  </div>
                  <h2 className="text-3xl font-header font-black italic uppercase tracking-tighter text-white mb-1">Créditos</h2>
                  <p className="text-neon-pink text-[9px] font-black uppercase tracking-[0.4em] mb-8 italic">EL EQUIPO DETRÁS DEL BIT</p>
                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Fundador & Desarrollador Principal</h3>
                      <p className="text-white font-bold text-lg">Ciszuko Antony</p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Diseño & UI/UX</h3>
                      <p className="text-white font-bold text-sm">CiszuNetwork Studio</p>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Motor de Juego</h3>
                      <p className="text-white font-bold text-sm">Custom Canvas Engine v2.0</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">&copy; 2026 CiszuNetwork. MuzicMania.</p>
                    </div>
                  </div>
                  <Link href="/credits"
                    className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >VER CRÉDITOS COMPLETOS</Link>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* REDES SOCIALES MODAL */}
          <AnimatePresence>
            {isRedesOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsRedesOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center relative shadow-2xl"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button onClick={() => setIsRedesOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                    <div className="w-5 h-5">{I.circleX}</div>
                  </button>
                  <h3 className="text-lg font-header font-black text-white italic uppercase flex items-center gap-2 mb-6 justify-center">
                    <div className="w-5 h-5 text-neon-green">{I.discord}</div> Redes Sociales
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                      {[
                        { href: '/', icon: I.globe, label: 'Inicio', color: 'hover:text-neon-cyan hover:border-neon-cyan/50' },
                        { href: 'https://discord.gg/W3kMtMMj6E', icon: I.discord, label: 'Discord', color: 'hover:text-[#5865F2] hover:border-[#5865F2]/50' },
                        { href: 'https://wa.me/584126858111', icon: I.whatsapp, label: 'WhatsApp', color: 'hover:text-[#25D366] hover:border-[#25D366]/50' },
                        { href: 'https://www.instagram.com/ciszunetwork/', icon: I.instagram, label: 'Instagram', color: 'hover:text-neon-pink hover:border-neon-pink/50' },
                        { href: 'https://www.tiktok.com/@ciszunetwork', icon: I.tiktok, label: 'TikTok', color: 'hover:text-white hover:border-white/50' },
                        { href: 'https://www.youtube.com/@CiszuNetwork', icon: I.youtube, label: 'YouTube', color: 'hover:text-[#FF0000] hover:border-[#FF0000]/50' },
                        { href: 'https://x.com/CiszukoAntony', icon: I.x, label: 'X (Twitter)', color: 'hover:text-white hover:border-white/50' },
                      ].map(social => (
                      <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                        className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 text-gray-400 ${social.color} transition-all hover:scale-110 hover:bg-white/10`}
                      >
                        <div className="w-6 h-6">{social.icon}</div>
                        <span className="text-[6px] font-black uppercase tracking-widest">{social.label}</span>
                      </a>
                    ))}
                  </div>
                  <p className="text-center text-[8px] text-gray-700 font-bold uppercase tracking-widest mt-6">&iexcl;S&iacute;guenos en todas las plataformas!</p>
                  <Link href="/contact"
                    className="block w-full text-center mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >CONTACTO</Link>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* INFO MODAL */}
          <AnimatePresence>
            {isInfoOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsInfoOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button onClick={() => setIsInfoOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white w-6 h-6">{I.circleX}</button>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 bg-neon-blue/10 rounded-2xl flex items-center justify-center text-neon-blue shadow-[0_0_30px_rgba(0,212,255,0.1)]">
                      <div className="w-7 h-7">{I.about}</div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-header font-black italic uppercase tracking-tighter text-white">Acerca de</h2>
                      <p className="text-neon-blue text-[9px] font-black uppercase tracking-widest italic">MUZICMANIA v2.0</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-gray-400 text-xs leading-relaxed mb-8">
                    <p>MuzicMania es un juego r&iacute;tmico desarrollado por CiszuNetwork que combina m&uacute;sica electr&oacute;nica con mec&aacute;nicas de ritmo precisas. Inspirado en los cl&aacute;sicos del g&eacute;nero, ofrece una experiencia &uacute;nica con skins personalizables, part&iacute;culas din&aacute;micas y un sistema de puntuaci&oacute;n avanzado.</p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-gray-500">Versi&oacute;n</span>
                        <span className="text-white">2.0.0</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-gray-500">Plataforma</span>
                        <span className="text-white">Web / PDWA</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-gray-500">Motor</span>
                        <span className="text-white">Next.js + Canvas</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-gray-500">Base de Datos</span>
                        <span className="text-neon-cyan">Supabase</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/information"
                    className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >M&Aacute;S INFORMACI&Oacute;N</Link>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* --- PLAYLIST MODAL --- */}
          <AnimatePresence>
            {isPlaylistModalOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
                  <button onClick={() => setIsPlaylistModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <div className="w-5 h-5">{I.circleX}</div>
                  </button>
                  <h3 className="text-lg font-header font-black text-white italic uppercase flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 text-neon-green">{I.album}</div> Mis Playlists
                  </h3>

                  {/* Create new playlist */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder="NOMBRE DE PLAYLIST"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white placeholder-gray-700 focus:outline-none focus:border-neon-green/50 uppercase tracking-widest"
                      onKeyDown={e => { if (e.key === 'Enter') createPlaylist(newPlaylistName); }}
                    />
                    <button
                      onClick={() => createPlaylist(newPlaylistName)}
                      disabled={!newPlaylistName.trim()}
                      className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-neon-green hover:text-black transition-all disabled:opacity-30"
                    >
                      CREAR
                    </button>
                  </div>

                  {/* Playlist list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {playlists.length === 0 ? (
                      <p className="text-center text-[10px] text-gray-600 font-bold uppercase py-8">No hay playlists aún</p>
                    ) : (
                      playlists.map(pl => (
                        <div key={pl.name} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5 group/pl">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green shrink-0">
                              <div className="w-4 h-4">{I.music}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white uppercase tracking-wider truncate">{pl.name}</div>
                              <div className="text-[8px] text-gray-600 font-bold uppercase">{pl.tracks.length} tracks</div>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePlaylist(pl.name)}
                            className="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover/pl:opacity-100 transition-all"
                          >
                            <div className="w-4 h-4">{I.x}</div>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- LEADERBOARD MODAL --- */}
          <AnimatePresence>
            {isLeaderboardOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
                  <button onClick={() => setIsLeaderboardOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <div className="w-5 h-5">{I.circleX}</div>
                  </button>
                  <h3 className="text-lg font-header font-black text-white italic uppercase flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 text-neon-cyan">{I.trophy}</div> Leaderboard
                  </h3>
                   <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-4">{selectedTrack?.name}</p>
                  {leaderboardData.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 text-gray-700">{I.trophy}</div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sin puntuaciones registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboardData.map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          i === 0 ? 'bg-neon-cyan/10 border-neon-cyan/30' : 'bg-white/5 border-white/5'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black ${
                              i === 0 ? 'bg-neon-cyan/20 text-neon-cyan' :
                              i === 1 ? 'bg-white/10 text-gray-300' :
                              i === 2 ? 'bg-neon-pink/10 text-neon-pink' :
                              'bg-white/5 text-gray-500'
                            }`}>
                              #{i + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white truncate max-w-[200px]">{entry.user}</div>
                              <div className="text-[7px] text-gray-600 font-bold uppercase">{new Date(entry.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-lg font-header font-black text-white">{entry.score.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- LAST MATCH DETAIL MODAL --- */}
          <AnimatePresence>
            {showLastMatchDetail && selectedTrack && getLastMatch(selectedTrack.id) && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowLastMatchDetail(null)}
                className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm uppercase tracking-widest font-black text-neon-purple">Detalles de Última Partida</h3>
                    <button onClick={() => setShowLastMatchDetail(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                      <div className="w-3 h-3">{I.close}</div>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const lm = getLastMatch(selectedTrack.id);
                      const modalIcons: Record<string, React.ReactNode> = { 'Puntuación': I.stats, 'Punt. Máxima': I.star, 'Max Combo': I.trophy, 'Precisión': I.target, 'Errores': I.circleX, 'KPS': I.zap, 'Vida Final': I.heart, 'Progreso': I.clock, 'Muertes': I.flame };
                      const modalIconColors: Record<string, string> = { 'Puntuación': 'text-neon-cyan', 'Punt. Máxima': 'text-yellow-400', 'Max Combo': 'text-yellow-500', 'Precisión': 'text-neon-cyan', 'Errores': 'text-red-400', 'KPS': 'text-neon-green', 'Vida Final': 'text-green-400', 'Progreso': 'text-neon-purple', 'Muertes': 'text-red-500' };
                      return [
                        { label: 'Puntuación', val: lm.score.toLocaleString(), cls: 'text-white' },
                        { label: 'Punt. Máxima', val: lm.maxPotentialScore?.toLocaleString() || '-', cls: 'text-yellow-400' },
                        { label: 'Max Combo', val: `${lm.maxCombo}x`, cls: 'text-white' },
                        { label: 'Precisión', val: `${lm.accuracy}%`, cls: 'text-neon-cyan' },
                        { label: 'Errores', val: lm.mistakes, cls: 'text-neon-pink' },
                        { label: 'KPS', val: lm.kps, cls: 'text-neon-green' },
                        { label: 'Vida Final', val: `${lm.life}%`, cls: lm.life > 50 ? 'text-green-400' : 'text-red-400' },
                        { label: 'Progreso', val: `${lm.notesHit || 0} / ${lm.totalNotes || 0} notas`, cls: 'text-neon-purple' },
                        { label: 'Muertes', val: lm.deaths || 0, cls: 'text-red-500' },
                      ].map(s => (
                        <div key={s.label} className="bg-black/30 rounded-xl p-3 text-center">
                          <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black flex items-center justify-center gap-1">
                            <div className={`w-2 h-2 ${modalIconColors[s.label]}`}>{modalIcons[s.label]}</div>
                            {s.label}
                          </div>
                          <div className={`text-lg font-header font-black ${s.cls}`}>{s.val}</div>
                        </div>
                      ));
                    })()}
                  </div>
                  {getLastMatch(selectedTrack.id).hits && (
                    <div className="mt-3 bg-black/30 rounded-xl p-3">
                      <div className="text-[7px] uppercase tracking-widest text-gray-500 font-black mb-2">Aciertos por tipo</div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(['perfect','great','good','meh','bad','veryBad','miss'] as const).map(k => {
                          const dColors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                          const dIcons: Record<string, React.ReactNode> = { perfect: I.star, great: I.zap, good: I.heart, meh: I.target, bad: I.flame, veryBad: I.circleX, miss: I.about };
                          const dIconColors: Record<string, string> = { perfect: 'text-neon-cyan', great: 'text-neon-purple', good: 'text-green-400', meh: 'text-yellow-400', bad: 'text-orange-400', veryBad: 'text-red-400', miss: 'text-red-600' };
                          return (
                            <div key={k}>
                              <div className={`text-xs font-header font-black ${dColors[k]}`}>{getLastMatch(selectedTrack.id).hits[k]}</div>
                              <div className={`w-3 h-3 mx-auto ${dIconColors[k]}`}>{dIcons[k]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="text-[7px] text-gray-600 text-center mt-3">
                    {new Date(getLastMatch(selectedTrack.id).date).toLocaleString()}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- INVENTARIO MODAL --- */}
          <AnimatePresence>
            {isInventarioOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsInventarioOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <div className="shrink-0 p-6 pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-header font-black text-white italic uppercase flex items-center gap-3">
                        <div className="w-5 h-5 text-yellow-500">{I.backpack}</div> Inventario
                      </h3>
                      <button onClick={() => setIsInventarioOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                        <div className="w-4 h-4">{I.circleX}</div>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Arrow Skins */}
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                        <div className="w-4 h-4">{I.chevronUp}</div>
                        <span>Skin de Flechas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(user ? getSkinList() : getSkinList().filter(s => s.id === 'default')).map(skin => (
                          <button key={skin.id}
                            onClick={() => { setCurrentArrowSkin(skin.id); setArrowSkin(skin.id); }}
                            className={`py-3 text-xs font-bold uppercase rounded-xl border transition-all ${
                              currentArrowSkin === skin.id
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon-cyan/20'
                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {skin.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Particle Skins */}
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                        <div className="w-4 h-4">{I.sparkles}</div>
                        <span>Skin de Partículas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(user ? getParticleSkinList() : getParticleSkinList().filter(s => s.id === 'default')).map(skin => (
                          <button key={skin.id}
                            onClick={() => { setCurrentParticleSkin(skin.id); setParticleSkin(skin.id); }}
                            className={`py-3 text-xs font-bold uppercase rounded-xl border transition-all ${
                              currentParticleSkin === skin.id
                                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-neon-purple/20'
                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {skin.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Character Skins */}
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">
                        <div className="w-4 h-4">{I.user}</div>
                        <span>Skin de Personajes</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        Próximamente — Consigue skins exclusivas en eventos y la tienda.
                      </div>
                    </div>
                    {user ? (
                      <Link href="/profile"
                        className="block w-full text-center px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all"
                      >IR AL INVENTARIO COMPLETO</Link>
                    ) : (
                      <>
                        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                          <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">MODO INVITADO — Solo tienes acceso a la skin Clásica</p>
                          <p className="text-[8px] text-gray-500 font-bold mt-1">Regístrate o inicia sesión para desbloquear más skins y personalización.</p>
                        </div>
                        <div className="flex gap-3">
                          <Link href="/login" className="flex-1 px-5 py-3 bg-gradient-to-r from-neon-cyan/30 to-neon-blue/30 border border-neon-cyan/40 rounded-2xl text-[9px] font-black uppercase tracking-widest text-neon-cyan hover:from-neon-cyan/50 hover:to-neon-blue/50 transition-all text-center">INICIAR SESIÓN</Link>
                          <Link href="/register" className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/15 transition-all text-center">REGISTRARSE</Link>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* --- CHANGELOG MODAL --- */}
          <AnimatePresence>
            {isChangelogOpen && (
              <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsChangelogOpen(false)}
              >
                <motion.div initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
                  className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-[#0f0f0f] to-black border border-white/10 rounded-3xl shadow-2xl"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff22 transparent' }}
                >
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-[#0f0f0f]/90 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
                        <div className="w-4 h-4 text-orange-400">{I.clock}</div>
                      </div>
                      <div>
                        <h3 className="text-sm font-header font-black text-white italic uppercase tracking-wider">Registro de Cambios</h3>
                        <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">Últimas actualizaciones</p>
                      </div>
                    </div>
                    <button onClick={() => setIsChangelogOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                      <div className="w-3.5 h-3.5">{I.x}</div>
                    </button>
                  </div>

                  {/* Content */}
                  {(() => {
                    const sorted = [...CHANGELOG_DATA].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const top3 = sorted.slice(0, 3);
                    const latest = top3[0];
                    if (!latest) return <div className="p-6 text-[9px] text-gray-500 text-center font-bold">No hay cambios registrados</div>;

                    return (
                      <div className="p-6 space-y-5">
                        {/* Featured - Latest */}
                        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/[0.08] via-amber-500/[0.03] to-transparent">
                          {/* Glow accent */}
                          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-500/10 blur-[60px] pointer-events-none" />
                          <div className="relative p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">MÁS RECIENTE</span>
                              <span className="text-[7px] text-gray-600 font-bold">{latest.date}</span>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center text-lg">
                                {(() => { const pt = latest.types[0]; const tc = pt ? CHANGELOG_TAGS[pt] : null; return tc ? <div className="w-6 h-6" style={{color: tc.color.replace('text-', '')}}>{tc.icon}</div> : <div className="w-6 h-6 text-orange-400">{CHANGELOG_I.clock}</div>; })()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-header font-black text-white">{latest.version}</span>
                                  <span className="text-[6px] text-gray-600 font-bold bg-white/5 px-1.5 py-0.5 rounded">{latest.code}</span>
                                </div>
                                <h4 className="text-white font-black text-xs uppercase tracking-wider mb-1">{latest.title}</h4>
                                <p className="text-[8px] text-gray-400 font-bold leading-relaxed">{latest.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {latest.types.map(type => {
                                    const tCfg = CHANGELOG_TAGS[type];
                                    return tCfg ? (
                                      <span key={type} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest ${tCfg.color} bg-white/5 border border-white/10`}>
                                        <div className="w-2 h-2">{tCfg.icon}</div>{tCfg.label}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                                <ul className="space-y-1 mt-3">
                                  {latest.details.slice(0, 5).map((d, j) => {
                                    const dtCfg = CHANGELOG_TAGS[d.type];
                                    return (
                                      <li key={j} className="text-[8px] text-gray-400 font-bold flex items-start gap-1.5">
                                        <span className={`shrink-0 w-2 h-2 mt-0.5 ${dtCfg?.color || 'text-orange-400'}`}>{dtCfg?.icon || <div className="w-2 h-2 rounded-full bg-orange-400/50" />}</span>
                                        {d.text}
                                      </li>
                                    );
                                  })}
                                </ul>
                                <Link href={`/changelog/${latest.id}`}
                                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-xl text-[7px] font-black uppercase tracking-widest text-orange-300 hover:text-orange-200 hover:from-orange-500/30 transition-all"
                                ><div className="w-2.5 h-2.5">{CHANGELOG_I.eye}</div> EXPLORAR ESTA VERSIÓN <div className="w-2.5 h-2.5">{I.arrowRight}</div></Link>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Previous Updates */}
                        <div>
                          <div className="flex items-center gap-2 text-[8px] text-gray-500 uppercase font-black tracking-widest mb-3">
                            <div className="w-3 h-3">{I.clock}</div>
                            <span>Actualizaciones Anteriores</span>
                          </div>
                          <div className="space-y-2">
                            {top3.slice(1).map((item) => {
                              const primaryType = item.types[0];
                              const tagCfg = primaryType ? CHANGELOG_TAGS[primaryType] : null;
                              return (
                                <Link key={item.id} href={`/changelog/${item.id}`}
                                  className="group block bg-white/5 hover:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${tagCfg?.color || 'text-orange-400'} bg-white/5 border border-white/5`}>
                                      <div className="w-4 h-4">{tagCfg?.icon || CHANGELOG_I.clock}</div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[10px] font-black font-header ${tagCfg?.color || 'text-orange-400'}`}>{item.version}</span>
                                        <span className="text-[6px] text-gray-600 font-bold">{item.date}</span>
                                        <span className="text-[6px] text-gray-600 font-bold bg-white/5 px-1 py-0.5 rounded">{item.code}</span>
                                      </div>
                                      <h4 className="text-white font-black text-[9px] uppercase tracking-wider truncate group-hover:text-orange-200 transition-colors">{item.title}</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.types.slice(0, 3).map(type => {
                                          const tCfg = CHANGELOG_TAGS[type];
                                          return tCfg ? (
                                            <span key={type} className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[5px] font-black uppercase tracking-widest ${tCfg.color} bg-white/5`}>
                                              <div className="w-1.5 h-1.5">{tCfg.icon}</div>{tCfg.label}
                                            </span>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                    <div className="w-3 h-3 text-gray-600 group-hover:text-orange-400 transition-colors shrink-0 mt-1">{I.arrowRight}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* CTA to full changelog */}
                        <Link href="/changelog"
                          className="block w-full text-center py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        ><div className="flex items-center justify-center gap-2"><div className="w-3 h-3">{I.clock}</div> VER HISTORIAL COMPLETO <div className="w-3 h-3">{I.arrowRight}</div></div></Link>
                      </div>
                    );
                  })()}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* --- OTROS MODAL --- */}
          <AnimatePresence>
            {isOtrosOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={() => setIsOtrosOpen(false)}
              >
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
                  className="bg-black border border-white/10 rounded-[2rem] max-w-sm w-full shadow-2xl relative p-8"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button onClick={() => setIsOtrosOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                    <div className="w-5 h-5">{I.circleX}</div>
                  </button>
                  <h3 className="text-lg font-header font-black text-white italic uppercase flex items-center gap-2 mb-6 justify-center">
                    <div className="w-5 h-5 text-neon-purple">{I.sliders}</div> Otras Secciones
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { href: '/team', icon: I.user, label: 'EQUIPO', color: 'hover:text-neon-cyan hover:border-neon-cyan/50' },
                      { href: '/faq', icon: I.help, label: 'FAQ', color: 'hover:text-neon-blue hover:border-neon-blue/50' },
                      { href: '/rules', icon: I.book, label: 'REGLAS', color: 'hover:text-neon-pink hover:border-neon-pink/50' },
                      { href: '/reviews', icon: I.eye, label: 'REVIEWS', color: 'hover:text-neon-green hover:border-neon-green/50' },
                      { href: '/library', icon: I.music, label: 'LIBRERÍA', color: 'hover:text-yellow-500 hover:border-yellow-500/50' },
                      { href: '/support', icon: I.headphones, label: 'SOPORTE', color: 'hover:text-orange-500 hover:border-orange-500/50' },
                      { href: '/contact', icon: I.contact, label: 'CONTACTO', color: 'hover:text-neon-purple hover:border-neon-purple/50' },
                      { href: '/guidelines', icon: I.book, label: 'LINEAMIENTOS', color: 'hover:text-indigo-400 hover:border-indigo-400/50' },
                      { href: '/', icon: I.globe, label: 'INICIO', color: 'hover:text-neon-cyan hover:border-neon-cyan/50' },
                    ].map(item => (
                      <Link key={item.label} href={item.href}
                        className={`w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 text-gray-400 ${item.color} transition-all hover:scale-105 hover:bg-white/10`}
                      >
                        <div className="w-6 h-6">{item.icon}</div>
                        <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
      <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />

      <AnimatePresence>
        {externalLinkUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setExternalLinkUrl(null)}
          >
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] max-w-sm w-full shadow-2xl relative p-8 text-center"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </div>
              <h3 className="text-lg font-header font-black text-white uppercase italic tracking-tight mb-2">ENLACE EXTERNO</h3>
              <p className="text-[10px] text-gray-400 font-bold mb-2">Vas a salir de MuzicMania hacia:</p>
              <p className="text-[9px] text-neon-cyan font-black truncate max-w-full mb-6 px-4 py-2 bg-white/5 rounded-xl border border-white/5">{externalLinkUrl}</p>
              <div className="flex gap-3">
                <button onClick={() => setExternalLinkUrl(null)}
                  className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/15 transition-all"
                >CANCELAR</button>
                <button onClick={() => { window.open(externalLinkUrl, '_blank'); setExternalLinkUrl(null); }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-2xl text-[9px] font-black uppercase tracking-widest text-black hover:scale-105 transition-all"
                >CONTINUAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </MainLayout>
  );
}

export default function PlayPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PlayPageContent />
    </React.Suspense>
  );
}

