'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, Icon, Modal, captureEvent, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import CvPreview from '@/components/curriculum/CvPreview';
import { CERTIFICATES } from '@/data/certificates';
import type { CvDocument, CurriculumData } from '@/data/curriculum';

const THEME: InfoTheme = {
  accent: 'text-neon-purple',
  accentBg: 'bg-neon-purple/10',
  accentBorder: 'border-neon-purple/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-neon-purple',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fmtDate = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  const [year, month] = iso.split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};

/**
 * Logos oficiales (simplificados) de lenguajes/tecnologías para la sección de
 * habilidades. Se renderizan inline para no depender de fuentes externas.
 */
const SKILL_LOGO: Record<string, string> = {
  python: 'M6.6 20.3c0-.3 0-.6.1-.9L11 5.9c.2-.8.5-1.2 1-1.2.5 0 .8.4 1 1.2l4.3 13.5c0 .3.1.6.1.9 0 .4-.1.8-.3 1.1l.9-.5 2.6 1.6c.7.4 1.2.9 1.5 1.4-1.2 1.5-3.4 2.4-5.7 2.4-1.3 0-2.5-.3-3.6-.8-.9-.4-1.8-.9-2.6-1.5l-1.1.7c-.4.2-.8.4-1.2.4-.8 0-1.4-.5-1.4-1.3zm1-1.1c0 .2.1.4.3.5.2.2.4.2.7.2.3 0 .5-.1.8-.2l1-.6-.5-.3-2.3 1.4v1zm5.4-7.4c.3.3.7.5 1.2.5.5 0 .9-.2 1.2-.5l-2.4 2.9-2.4-2.9c.3.3.7.5 1.2.5.5 0 .9-.2 1.2-.5zm3.6 8.5l-.2.1-1.5.9 1.2.7c.3.2.6.2.9.2.3 0 .5-.1.7-.2.2-.2.3-.4.3-.6 0-.3-.1-.5-.4-.7l-1-.4zM4.4 19.8c.1.1.2.1.3.1.2 0 .3-.1.5-.3l.1-.1-.3-.2-1 .6.4-.1z',
  javascript: 'M0 0h24v24H0V0zm19.1 20.4c.7-1.1 1.4-2.5 1.4-3.7 0-.9-.4-1.4-1.1-1.4-.8 0-1.9 1-2.8 2.1l-.9-.6c.8-1.1 2-2.8 2-4.3 0-2.1-1.5-3.6-3.9-3.6-1.5 0-2.8.6-3.7 1.4l.8 1c.6-.6 1.4-1.1 2.4-1.1 1.1 0 1.8.6 1.8 1.6 0 1.3-1.1 2.8-2.6 4.3l2.9 1.9-.9 1.4-3.3-2.1c-.2.2-.4.4-.7.6l1 2.9c.9 1.4 2.4 1.7 3.8 1.7 1.8 0 3.3-.9 4.3-2.4z',
  typescript: 'M0 0h24v24H0V0zm15.3 12.7c.8 1.2 2 2 3.7 2 1.5 0 2.5-.7 2.5-1.8 0-1-.6-1.6-2-2l-1-.3c-1.2-.4-2-1-2-2 0-1.2 1.1-2.1 2.8-2.1 1.3 0 2.3.4 3 1.2l-1.3 1.2c-.5-.5-1-.8-1.7-.8-.8 0-1.3.4-1.3 1 0 .6.5 1 1.7 1.3l1 .3c1.5.5 2.4 1.1 2.4 2.3 0 1.4-1.2 2.3-3.1 2.3-1.7 0-3-.7-3.7-1.7l1.7-1.5zM3.5 12.4h4l1-1.4H1.5v1.4h3.2v7h1.8v-7z',
  html: 'M0 0h24v24H0V0zm3.5 2l1.5 16 7 2 7-2L20.5 2h-17zm5.2 6.6l.1 1H15l-.3 3.4H8.7l.1 1H14.7l-.4 3.6-5.1 1.4H9l-3.7-1-.3-3h1.3l.2 1.9 2.5.7v-.1l2.5-.7.3-3.4H6l-.4-4.6H16l.1-1.1h-7.4z',
  css: 'M0 0h24v24H0V0zm3.5 2l1.5 16 7 2 7-2L20.5 2h-17zm6 11l-.4-4h2.3l.4 4 1.7.7L9.5 11h-3l3 2 3.5 1.2 1.6 3.4 1.9 1.9L15.9 19l-2.2-5.2-2.6 1.5z',
  xml: 'M0 0h24v24H0V0zm9.9 6.8l-3.5 5.2 3.5 5.2 1.2-1.3-3.5-3.9 3.5-3.9-1.2-1.3zm4.2 0l-1.2 1.3 3.5 3.9-3.5 3.9 1.2 1.3 3.5-5.2-3.5-5.2z',
  sass: 'M0 0h24v24H0V0zm12 2c-5.5 0-10 3.6-10 8 0 4.4 4.5 8 10 8 5.5 0 10-3.6 10-8 0-4.4-4.5-8-10-8zm0 2c1.3 0 2.5.6 3.4 1.7 1.3 1.7 2 4.1 2.6 4.1.2 0 2-2 2-2-1.6-2.8-4.5-5.3-8-5.3-4.4 0-8 2.7-8 6 0 1.6 1.1 3.1 2.7 4.1-.1-.2-.2-.4-.3-.6-.7-1.5-.7-3.6 1.2-6.2.8-1.1 2-2.5 2.9-3.5-.7 1.7-1.1 3.4-.7 4.7.4 1.2 1.4 1.9 1.4 1.9s.6 2.6 1.5 3.4c.9.8 2 .6 2.5.2 0 0 .1.6.7.7.6.1.9-.4.9-.4s1.7-1.5 2.3-2.3c.5-.7-.1-1.3-.9-1.1-1.3.3-1.3-.8-1.4-1.3-.2-1.7-.2-2.8-.2-2.8.3-2.3-.6-3.9-2.3-5.1-.6-.5-1.3-.7-2-.7z',
  react: 'M0 0h24v24H0V0zm12 9.9c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm0-2.9c1.8 0 3.4.4 4.7 1.1 1.4.7 2.3 1.7 2.3 2.8s-.9 2.1-2.3 2.8c-1.3.7-2.9 1.1-4.7 1.1s-3.4-.4-4.7-1.1C6 13.9 5.1 12.9 5.1 11.8s.9-2.1 2.2-2.8c1.3-.7 2.9-1.1 4.7-1.1zm-3.2 4.2c.5 1.2 1.2 2.3 2 3.2-1.6-.2-2.9-.7-3.9-1.4-.7-.5-1.2-1.1-1.2-1.8s.5-1.3 1.2-1.8c.4-.3.9-.6 1.4-.8-.4.9-.6 1.8-.5 2.6zm6.4 0c.1-.8-.1-1.7-.5-2.6.5.2 1 .5 1.4.8.7.5 1.2 1.1 1.2 1.8s-.5 1.3-1.2 1.8c-1 .7-2.3 1.2-3.9 1.4.8-.9 1.5-2 2-3.2zm-3.2 2.6c-1.6 0-2.9-.3-4-1 .8-.4 1.6-.6 2.4-.7.5.6 1.1 1.1 1.6 1.6v.1zm.2-1.7c-.6-.4-1.1-.9-1.6-1.5.5.1 1.1.2 1.6.2s1.1-.1 1.6-.2c-.5.6-1 1.1-1.6 1.5z',
  java: 'M0 0h24v24H0V0zm8.8 13.1s-.5 1.1 1.1 1.2c1.6.1 2.4-.9 2.4-.9s-.9-.3-1.8-.7c-1.1-.5-1.7-1.9-1.7-1.9s-.9 1.3.8 1.9zm-2.2 1.6s.9 1.3 2.6 1.3c1.7 0 2.6-1.1 2.6-1.1s-.9-.5-2.2-.9c-1.5-.5-2-1.3-2-1.3s-.3 1.3 1 2zm6.9-3.4c1 .8 1.6 1.5 1.6 2.5 0 1.2-1 2.2-1 2.2s.9-.6.9-1.9c0-1.2-1.2-2.1-2.2-3-.7-.6-1.6-1.3-1.6-1.3s.9-.2 2.3 1.5zM9.5 9.9c.3.6 1.3 1.1 1.3 1.1s-.5-.5-.9-1.3c-.4-.8-1-1.7-1-1.7s.3.7.6 1.9zm3.9-1.6c.9 1 1.9 1.7 1.9 2.7 0 1.1-1.2 1.6-1.2 1.6s1-.3 1-1.6c0-1.1-1-2-2.1-3-.9-.8-1.9-1.5-1.9-1.5s.7-.2 2.3 1.8zM12.6 3.7s3 1.1 3 4.5c0 2.2-1.2 3.6-2.1 4.3.4-.9.2-2.3-1.4-3.7-1.1-1-2-1.8-2-2.6 0-.9.8-2.5 2.5-2.5z',
  c: 'M0 0h24v24H0V0zm12 2.5c-.5 0-1 .1-1.4.2L5 4.9c-.6.2-1 .7-1 1.3V17.8c0 .6.4 1.1 1 1.3l5.6 2.2c.4.2 1 .2 1.4 0L18 19.1c.6-.2 1-.7 1-1.3V6.2c0-.6-.4-1.1-1-1.3l-4.6-2.2c-.4-.1-.8-.2-1.4-.2zm0 4.5c1.7 0 3.2.9 4.1 2.2l-2.1 1.2c-.5-.8-1.4-1.4-2-1.4-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5c.6 0 1.5-.6 2-1.4l2.1 1.2c-.9 1.3-2.4 2.2-4.1 2.2-2.8 0-5-2.2-5-5s2.2-5 5-5z',
  cpp: 'M0 0h24v24H0V0zm12 2.5c-.5 0-1 .1-1.4.2L5 4.9c-.6.2-1 .7-1 1.3V17.8c0 .6.4 1.1 1 1.3l5.6 2.2c.4.2 1 .2 1.4 0L18 19.1c.6-.2 1-.7 1-1.3V6.2c0-.6-.4-1.1-1-1.3l-4.6-2.2c-.4-.1-.8-.2-1.4-.2zm0 4.5c1.7 0 3.2.9 4.1 2.2l-2.1 1.2c-.5-.8-1.4-1.4-2-1.4-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5c.6 0 1.5-.6 2-1.4l2.1 1.2c-.9 1.3-2.4 2.2-4.1 2.2-2.8 0-5-2.2-5-5s2.2-5 5-5zm5.5 3.2c.4 0 .7.3.7.7v.3h1.5v-1.5h1v1.5H21v1h-1.5v1.5H21v1h-1.3v1.5h-1v-1.5H16v-1.5h1.5v-1.5H16v-1h1.5V11c0-.4.3-.7.7-.7h-.5z',
  csharp: 'M0 0h24v24H0V0zm12 2.5c-.5 0-1 .1-1.4.2L5 4.9c-.6.2-1 .7-1 1.3V17.8c0 .6.4 1.1 1 1.3l5.6 2.2c.4.2 1 .2 1.4 0L18 19.1c.6-.2 1-.7 1-1.3V6.2c0-.6-.4-1.1-1-1.3l-4.6-2.2c-.4-.1-.8-.2-1.4-.2zm0 4.5c1.7 0 3.2.9 4.1 2.2l-2.1 1.2c-.5-.8-1.4-1.4-2-1.4-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5c.6 0 1.5-.6 2-1.4l2.1 1.2c-.9 1.3-2.4 2.2-4.1 2.2-2.8 0-5-2.2-5-5s2.2-5 5-5zm5.5 3.2c.4 0 .7.3.7.7v.3h1.5v-1.5h1v1.5H21v1h-1.5v1.5H21v1h-1.3v1.5h-1v-1.5H16v-1.5h1.5v-1.5H16v-1h1.5V11c0-.4.3-.7.7-.7h-.5zm-8 3.6v1h1v-1h-1zm2 0v1h1v-1h-1z',
  lua: 'M0 0h24v24H0V0zm8.9 4c-3.4 0-6.4 2.4-6.4 6.3 0 1.9.7 3.5 2.1 4.8.4.4 1.1.9 1.1 1.6 0 .5-.2.9-.5 1.3-.4.5-.9.7-1.4.5-.7-.2-1.1-.8-1.4-1.4-.4-.7-.8-1-1.5-.8-.6.2-.9.7-.7 1.2.4 1.2 1.1 2.1 2.4 2.5 2 .7 4.4-.7 5.3-2.6.5-1.1.4-2.4-.2-3.4-1-1.5-2.4-2.4-2.4-4.5 0-2.3 2.1-3.8 4.2-3.8 2.7 0 4.4 2 4.4 4.6 0 2.6-1.5 4.9-4.6 4.9-.8 0-1.5-.2-1.5-.2v-1c1 .1 1.7-.8 1.7-2.1 0-1.2-.8-2.2-2-2.2z',
  julia: 'M0 0h24v24H0V0zm7.9 4.7c-.4 0-.7.3-.7.7 0 .4.3.7.7.7.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7zm4.1 0c-.4 0-.7.3-.7.7 0 .4.3.7.7.7.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7zm4.1 0c-.4 0-.7.3-.7.7 0 .4.3.7.7.7.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7zM4.9 8.6c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm5.5 0c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm5.5 0c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm-9.3 3.8c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm5.5 0c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm5.5 0c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zM8 16.1c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6zm5.5 0c.4.4.8.6 1.5.6.7 0 1.3-.2 1.7-.6-.4-.4-.8-.6-1.5-.6-.7 0-1.3.2-1.7.6z',
  ruby: 'M0 0h24v24H0V0zm8.1 3.4L3.4 12l4.7 8.6h7.8L20.6 12l-4.7-8.6H8.1zm1.3 1.4h5.2l3.9 7.2-3.9 7.2H9.4l-3.9-7.2 3.9-7.2zm2.6 4.9c-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2-1-2.2-2.2-2.2z',
  perl: 'M0 0h24v24H0V0zm9.7 3c-2.4 0-4.4.6-5.6 1.9-.6.6-.9 1.4-.9 2.3 0 2.6 2 4.3 4.6 4.3 1 0 1.8-.2 2.5-.5.4.9.6 1.9.6 2.9 0 1.6-.5 2.9-1.4 3.8-.6.6-1.3.9-2.1 1l1.4-2.7c.2-.4 0-.9-.4-1.1-.4-.2-.9 0-1.1.4l-2.1 4c-.4.8-.1 1.7.7 2.1.3.1.6.2 1 .2.6 0 1.2-.2 1.7-.5 1.5-.8 2.5-2.3 2.9-4.2.2-.9.3-1.9.2-2.9.2 1 .5 1.9 1 2.7.5 1 1.2 1.9 2.1 2.7l-1.5-4.3c-.2-.5-.7-.8-1.2-.6-.5.2-.8.7-.6 1.2l.3.8c-.5-.5-1-1.1-1.4-1.7-.6-.9-1-1.9-1.2-3.1.4.2.8.3 1.2.4.3.1.6.1 1 .1 2 0 3.5-.8 4.1-2.1.3-.7.2-1.5-.4-2.1-1.1-1.2-2.9-1.8-5.2-1.8zm0 3.5c.9 0 1.7.2 2.3.5.5.3.8.7.8 1.2 0 .7-.6 1.2-1.6 1.2-.8 0-1.5-.3-2-.9-.4-.5-.6-1-.6-1.6 0-.4.1-.7.2-.9.3-.2.6-.5 1-.5h-.1z',
  rlang: 'M0 0h24v24H0V0zm3.5 3.5c-1.5 1.4-2.2 3.4-2.2 5.9 0 1.6.3 3.1.9 4.4.6 1.2 1.4 2.2 2.4 2.8l3.8 2.7-2.5 1.6c-.4.3-.5.8-.2 1.2.2.3.5.5.8.5.2 0 .3-.1.5-.2l5.4-3.5c1.1-.7 1.7-1.9 1.8-3.3.5.2 1.1.3 1.7.3 1.8 0 3.2-.7 4.3-2 1-1.3 1.6-3.2 1.6-5.4 0-2.5-.7-4.5-2.1-6-1.5-1.5-3.7-2.3-6.4-2.3-2.6 0-4.8.8-6.3 2.2zm9.7 5.4c.4.1.8.2 1.1.3.4.1.8.2 1.1.2 1.6 0 2.6-.7 2.9-1.9-1.3-.8-3-.8-5.1.5v.9zm-2.2 1.3c-1.3-.7-2.4-.9-3.2-.7-.9.2-1.4.8-1.4 1.8 0 1.1.7 1.9 1.8 2.4 1.1.5 2.5.8 4.2.8l-1.4-4.3z',
  rust: 'M0 0h24v24H0V0zm10.2 2.1c-.8 0-1.5.4-2.1 1.1-.3.4-.6.9-.8 1.5-.5.1-1 .3-1.5.5l-1.4-1-1.3 1.3 1 1.4c-.2.5-.4 1-.5 1.5-.6.2-1.1.5-1.5.8-.7.6-1.1 1.3-1.1 2.1s.4 1.5 1.1 2.1c.4.3.9.6 1.5.8.1.5.3 1 .5 1.5l-1 1.4 1.3 1.3 1.4-1c.5.2 1 .4 1.5.5.2.6.5 1.1.8 1.5.6.7 1.3 1.1 2.1 1.1s1.5-.4 2.1-1.1c.3-.4.6-.9.8-1.5.5-.1 1-.3 1.5-.5l1.4 1 1.3-1.3-1-1.4c.2-.5.4-1 .5-1.5.6-.2 1.1-.5 1.5-.8.7-.6 1.1-1.3 1.1-2.1s-.4-1.5-1.1-2.1c-.4-.3-.9-.6-1.5-.8-.1-.5-.3-1-.5-1.5l1-1.4-1.3-1.3-1.4 1c-.5-.2-1-.4-1.5-.5-.2-.6-.5-1.1-.8-1.5-.6-.7-1.3-1.1-2.1-1.1zm0 1.5c.3 0 .5.2.8.4.2.3.4.7.5 1.1-.4.1-.8.2-1.2.4l-1.5-1.1c.4-.4.9-.8 1.4-.8zm-4.8 4.9c.1-.5.3-.9.5-1.2l1.1 1.5c-.2.4-.3.8-.4 1.2-.4.1-.8.2-1.2.4-.1-.5-.1-.9 0-1.9zm9.6 0c.1 1 0 1.4 0 1.9-.4-.2-.8-.3-1.2-.4-.1-.4-.2-.8-.4-1.2l1.1-1.5c.2.3.4.7.5 1.2zm-4.8 1.4c1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7zm0 1c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8z',
  kotlin: 'M0 0h24v24H0V0zm3.8 4.2L12 12l-4 3.8h13.2V4.2H3.8zm0 15.6l5.9-5.6L15.5 19.8H3.8z',
  swift: 'M0 0h24v24H0V0zm4.2 3.5c.5-.4 1-.7 1.5-1 .6-.4 1.3-.7 2.1-.9-1.1 1.1-1.8 2.4-2.1 3.9-.4 1.9.1 3.8 1.4 5.4.3.4.7.8 1.1 1.2-.4-.1-.8-.3-1.2-.5-1.7-.9-2.8-2.3-3.3-4.1-.3-1.1-.3-2.3.5-4zm6.9 1.9c.7.7 1.1 1.5 1.2 2.4 0 .6-.2 1.2-.6 1.7-2.7 3.4-6.7 5.4-11.2 5.9 1 1.3 2.4 2.1 4 2.5 3.1.7 6.2-.2 8.7-2.2 1.4-1.1 2.6-2.4 3.4-4 .8 1.7.8 3.6-.1 5.3-1.2 2.4-3.6 4-6.3 4.5-1.8.3-3.6.1-5.2-.7-.5-.2-.9-.5-1.4-.8-.4.1-.9.2-1.3.2 1.1.8 2.4 1.3 3.7 1.4 3 .4 6-.5 8.3-2.4 2.3-1.9 3.6-4.5 3.7-7.4l-2.9 1c1.4-1.6 2.1-3.4 2-5.3-3.4 2.1-7.2 2.5-11 .8z',
  sql: 'M0 0h24v24H0V0zm12 2c-4.4 0-8 1.6-8 3.5v13c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-13C20 3.6 16.4 2 12 2zm0 2c3.9 0 6 1.3 6 1.5S15.9 7 12 7 6 5.7 6 5.5 8.1 4 12 4zm6 13.5c0 .2-2.1 1.5-6 1.5s-6-1.3-6-1.5v-2c1.5.9 3.6 1.5 6 1.5s4.5-.6 6-1.5v2zm0-5c0 .2-2.1 1.5-6 1.5s-6-1.3-6-1.5v-2c1.5.9 3.6 1.5 6 1.5s4.5-.6 6-1.5v2z',
  nodejs: 'M0 0h24v24H0V0zm12 2c-.3 0-.6.1-.8.2l-7 4c-.4.2-.7.7-.7 1.2v9.2c0 .5.3 1 .7 1.2l7 4c.2.1.5.2.8.2s.6-.1.8-.2l7-4c.4-.2.7-.7.7-1.2V7.4c0-.5-.3-1-.7-1.2l-7-4c-.2-.1-.5-.2-.8-.2zm0 3.2c.5 0 1 .1 1.4.3l4.3 2.5c.4.2.6.6.6 1v5c0 .4-.2.8-.6 1l-4.3 2.5c-.4.2-.9.3-1.4.3s-1-.1-1.4-.3l-4.3-2.5c-.4-.2-.6-.6-.6-1v-5c0-.4.2-.8.6-1l4.3-2.5c.4-.2.9-.3 1.4-.3zm0 2.3c-.3 0-.6.2-.6.6v3.1c0 .3.3.6.6.6h1.6v-4.3H12zm5 0c-.3 0-.6.2-.6.6v4.1c0 .3.3.6.6.6.2 0 .3 0 .4-.1l2-1.2v1.6c0 .3.2.6.6.6.2 0 .4-.1.6-.3l-2.5-1.4c-.1-.1-.1-.2-.1-.3v-4.2c0-.3-.3-.6-.6-.6h-.6zm-4.4.6v3.7c0 .3.3.6.6.6h1.7c.3 0 .6-.3.6-.6v-3.1c0-.3-.3-.6-.6-.6h-1.7c-.3 0-.6.3-.6.6z',
  express: 'M0 0h24v24H0V0zm12 3c-1.9 0-3.5.6-4.7 1.7-1.2 1.1-1.8 2.6-1.8 4.6 0 2 1.6 3.6 3.5 3.9l.4-1.2c-1.3-.3-2.3-1.4-2.3-2.7 0-1.5 1.3-2.7 2.9-2.7h3.9c1.6 0 2.9 1.2 2.9 2.7 0 1.5-1.3 2.7-2.9 2.7h-.6v1.3h.6c2.3 0 4.1-1.8 4.1-4s-1.8-4-4.1-4h-3.9z',
  django: 'M0 0h24v24H0V0zm11 3c-3.6 0-6.5 1.8-6.5 4.5 0 1.6.9 3 2.4 3.8v2.4c0 1.8 2.3 3.3 5.2 3.3 3 0 5.4-1.5 5.4-3.3V5.6c0-1.5-1.6-2.6-6.5-2.6zm0 3.1c1.2 0 2 .4 2 1.1 0 .7-.8 1.1-2 1.1-1.3 0-2-.4-2-1.1 0-.7.7-1.1 2-1.1zm5.3 5.4c-.6.4-1.6.7-2.8.7h-2.1c1.2.7 2.1 1.6 2.1 2.5 0 .9-1.3 1.7-3.1 1.7-1.7 0-3.1-.7-3.1-1.7 0-.9.8-1.7 2-2.4v2.1c.3.1.7.2 1.1.2 1.2 0 2-.4 2-1 .3-.3.5-.7.5-1.2v-1.8c.2 0 .3-.1.4-.1h2.5v-2.4H9.5v-1.6h10v2.4h-3.2z',
  nextjs: 'M0 0h24v24H0V0zm12 2.5c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5c2.2 0 4.2-.7 5.9-2l-6.7-9.7v7.3c0 1-.8 1.8-1.8 1.8-1 0-1.8-.8-1.8-1.8v-3.4c0-1 .8-1.8 1.8-1.8.3 0 .6.1.9.2l-2.2-3.2c-2.7.3-4.7 2.6-4.7 5.3 0 3 2.4 5.4 5.4 5.4 3 0 5.4-2.4 5.4-5.4v-9.4c1.4 1.2 2.4 3 2.4 4.8 0 4.5-3.7 8.2-8.2 8.2-4.5 0-8.2-3.7-8.2-8.2 0-4.5 3.7-8.2 8.2-8.2z',
  github: 'M0 0h24v24H0V0zm12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.5C22 6.5 17.5 2 12 2z',
  npm: 'M0 0h24v24H0V0zm3 5h18v14h-9v-11h-9v11H3V5zm4 4v6h2v-6h1v6h2v-8H7v2zm5 0v10h4v-2h4V9h-8zm2 2h2v6h-2v-6z',
  docker: 'M0 0h24v24H0V0zm14.5 6c.9 0 1.7.3 2.4.8-.1 1.4-1.2 2.4-2.6 2.7 0 0-.2 1.5-1.8 1.5-.3 0-.6 0-.9-.1 0 0-.2.6-.8.6h-7.2c-.6 0-.8-.5-.8-1 0-2.9 2.1-4.5 4.7-4.5h6.5zm-6.5 1c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm2 0c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm2 0c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm0 0c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm4.5 0c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm-1.5-1.5c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm-2.9 4.2c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5zm3.9 2.1c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z',
  linux: 'M0 0h24v24H0V0zm9.6 2.3c-.6 0-1 .5-1 1.1v2c-1 .3-1.8 1-1.8 2 0 .6.3 1.1.8 1.5-.6.2-1 .7-1 1.3 0 .9.8 1.6 1.8 1.8v1.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1v-1.5c1-.2 1.8-.9 1.8-1.8 0-.6-.4-1.1-1-1.3.5-.4.8-.9.8-1.5 0-1-.8-1.7-1.8-2v-2c0-.6-.4-1.1-1.1-1.1zm0 3.2c.3 0 .5.2.5.5v2.2c0 .3-.2.5-.5.5s-.5-.2-.5-.5V6c0-.3.2-.5.5-.5zm0 3.8c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm0 2.7c.5 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8z',
  prettier: 'M0 0h24v24H0V0zm3.5 6.5v11h17v-11h-17zm3 3h11v5h-11v-5z',
  eslint: 'M0 0h24v24H0V0zm12 2.3L2.5 7.2v9.6L12 21.7l9.5-4.9V7.2L12 2.3zm0 3.3l6 3.1v6.6l-6 3.1-6-3.1V8.7l6-3.1zm0 2.4c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 1.5c.8 0 1.5.7 1.5 1.5S12.8 16 12 16s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z',
  ruff: 'M0 0h24v24H0V0zm5.6 4.5c-.4 0-.7.3-.7.7v9.6c0 .4.3.7.7.7h3.4v-3H7.5V7h3.4V4.5H5.6zm7.4 0v11c0 .4.3.7.7.7h2.1c.4 0 .7-.3.7-.7v-11h-3.5z',
  config: 'M0 0h24v24H0V0zm12 3.5c-.9 0-1.7.6-1.9 1.5l-.1.6c-.2.1-.4.2-.6.3l-.6-.3c-.7-.4-1.7-.2-2.2.5-.5.7-.4 1.7.3 2.2l.6.4v.6l-.6.4c-.7.5-.8 1.5-.3 2.2.5.7 1.5.9 2.2.4l.6-.3c.2.1.4.2.6.3l.1.6c.2.9 1 1.5 1.9 1.5s1.7-.6 1.9-1.5l.1-.6c.2-.1.4-.2.6-.3l.6.3c.7.5 1.7.3 2.2-.4.5-.7.4-1.7-.3-2.2l-.6-.4v-.6l.6-.4c.7-.5.8-1.5.3-2.2-.5-.7-1.5-.9-2.2-.4l-.6.3c-.2-.1-.4-.2-.6-.3l-.1-.6c-.2-.9-1-1.5-1.9-1.5zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
  asm: 'M0 0h24v24H0V0zm4 4.5v15h16v-15H4zm3 3h10v1.5H7V7.5zm0 3h10v1.5H7v-1.5zm0 3h10v1.5H7v-1.5z',
};

/**
 * `/curriculum` — página INDEPENDIENTE del portfolio, centrada en los 3
 * currículums en PDF. Se prioriza la previsualización completa en pantalla de
 * cada documento (adaptada a su orientación vertical u horizontal), con sus
 * datos verificables, la trayectoria interactiva y las certificaciones.
 *
 * El portfolio (`/portfolio`) queda para lo general y los trabajos; aquí vive
 * el currículum. El CV se resuelve en servidor para leer `shared/docs/` cuando
 * exista.
 */
export default function CurriculumContent({ cv }: { cv: CurriculumData }) {
  usePageTitle('CURRICULUM');
  const dict = useDict();
  const [fullscreen, setFullscreen] = useState<CvDocument | null>(null);

  const featuredCerts = useMemo(
    () =>
      [...CERTIFICATES]
        .filter((cert) => cert.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 6),
    [],
  );

  const providerCount = useMemo(() => new Set(CERTIFICATES.map((cert) => cert.provider)).size, []);

  const cvStats = [
    { value: `${cv.documents.length}`, label: 'Currículums', sub: 'PDF verificables' },
    { value: `${cv.skills.length}`, label: 'Áreas técnicas', sub: 'Stack de desarrollo' },
    { value: `${providerCount}`, label: 'Emisores', sub: 'Instituciones y plataformas' },
    { value: `${CERTIFICATES.length}`, label: 'Documentos', sub: 'Certificados y credenciales' },
  ];

  const areas = [
    { icon: 'server', title: 'Experiencia', body: 'Dirección de Ciszu Network y desarrollo full-stack de sus 4 webs, bot y juego.' },
    { icon: 'medal', title: 'Formación', body: 'Bachillerato, EF SET B1 y programas de Cisco, Microsoft, IBM y HP.' },
    { icon: 'terminal', title: 'Habilidades', body: 'TypeScript, Next.js/React, Node.js, Python, bases de datos y diseño UI/UX.' },
    { icon: 'globe', title: 'Idiomas', body: 'Español nativo e inglés B1 certificado (EF SET 43/100).' },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <div className="print:hidden">
          <InfoHero
            icon="certificates"
            title="Currículum"
            subtitle={`Los ${cv.documents.length} currículums de ${cv.profile.name} en pantalla completa: previsualización directa de cada PDF, trayectoria, formación, habilidades, idiomas y certificaciones verificables.`}
            kicker="CV · Trayectoria profesional"
            theme={THEME}
          />
        </div>

        {/* Ficha de perfil + acciones */}
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon-purple/10 via-transparent to-transparent border border-neon-purple/20 mb-14">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-header font-black uppercase italic text-white">{cv.profile.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-purple mt-1 mb-4">
                {cv.profile.role}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{cv.profile.summary}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                <span>{cv.profile.legalName}</span>
                <span>{cv.profile.location}</span>
                <a href={`mailto:${cv.profile.email}`} className="text-neon-purple hover:text-white transition-colors">
                  {cv.profile.email}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto print:hidden">
              <Link
                href="/certificates"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-sm hover:bg-neon-purple hover:text-white transition-all"
              >
                <Icon name="certificates" size={16} />
                {dict.curriculum.viewCertificates}
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Icon name="palette" size={16} />
                {dict.portfolio.kicker}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Icon name="mail" size={16} />
                {dict.portfolio.ctaContact}
              </Link>
            </div>
          </div>
        </div>

        {/* Currículums: previsualización SIEMPRE visible, adaptada a la orientación */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="certificates" size={15} />
            Currículums ({cv.documents.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cv.documents.map((doc) => (
              <article
                key={doc.id}
                className="flex flex-col p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-purple/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-header font-bold text-white">{doc.label}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                      PDF · {doc.pages} páginas · {doc.size}
                    </p>
                  </div>
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/40 text-neon-purple">
                    {doc.type}
                  </span>
                </div>

                <CvPreview
                  href={doc.href}
                  label={doc.label}
                  orientation={doc.orientation}
                  frameClassName="max-w-[22rem]"
                  className="mb-4"
                />

                <p className="text-sm text-gray-400 leading-relaxed flex-1">{doc.description}</p>
                <div className="flex flex-wrap gap-2 mt-4 print:hidden">
                  <a
                    href={doc.href}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => captureEvent('curriculum_cv_download', { id: doc.id })}
                    className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-xs hover:bg-neon-purple hover:text-white transition-all active:scale-95"
                  >
                    <Icon name="download" size={15} />
                    Descargar
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFullscreen(doc);
                      captureEvent('curriculum_cv_fullscreen', { id: doc.id });
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <Icon name="eye" size={15} />
                    Pantalla completa
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            Documentos PDF {cv.documents.length} · previsualización y descarga directa desde el CDN de Ciszu Network.
          </p>
        </section>

        {/* Stats del CV */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {cvStats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-3xl font-header font-black text-neon-purple">{stat.value}</p>
              <p className="text-white font-header font-bold text-sm mt-1">{stat.label}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Áreas */}
        <div className="mb-16">
          <InfoCardGrid title="Áreas de trayectoria" items={areas} theme={THEME} columns={4} />
        </div>

        {/* Formación */}
        <div className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="medal" size={15} />
            {dict.curriculum.training}
          </h2>
          <InfoCardGrid items={cv.education} theme={THEME} columns={2} />
        </div>

        {/* Experiencia (timeline) */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="trophy" size={15} />
            Experiencia
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-purple via-neon-purple/40 to-transparent" />
            <div className="space-y-5">
              {cv.experience.map((item) => (
                <div
                  key={`${item.role}-${item.org}`}
                  className="relative pl-12 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 transition-all"
                >
                  <span className="absolute left-2.5 top-7 w-3 h-3 rounded-full bg-neon-purple border-2 border-black" />
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={item.icon} size={14} className="text-neon-purple" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple">{item.period}</p>
                  </div>
                  <h3 className="font-header font-bold text-white">
                    {item.role} · <span className="text-gray-500">{item.org}</span>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Habilidades */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="target" size={15} />
            {dict.curriculum.skills}
          </h2>
          {(() => {
            const families = ['Lenguajes', 'Frontend', 'Backend', 'Bases de datos', 'DevOps', 'Herramientas'];
            const groups = families
              .map((family) => ({ family, skills: cv.skills.filter((s) => (s.family ?? 'Herramientas') === family) }))
              .filter((g) => g.skills.length > 0);
            return (
              <div className="space-y-8">
                {groups.map((group) => (
                  <div key={group.family}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3">
                      {group.family}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 hover:bg-white/[0.07] transition-all cursor-default"
                        >
                          {SKILL_LOGO[skill.icon ?? ''] ? (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 group-hover:scale-110 transition-transform">
                              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                                <path d={SKILL_LOGO[skill.icon ?? '']} />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple group-hover:scale-110 transition-transform">
                              <Icon name="terminal" size={18} />
                            </span>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-gray-200 font-medium">{skill.name}</span>
                              <span className="text-neon-purple font-bold">{skill.level}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand to-neon-purple transition-all duration-700 group-hover:from-neon-purple group-hover:to-neon-cyan"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Idiomas */}
        <div className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="globe" size={15} />
            Idiomas
          </h2>
          <InfoCardGrid items={cv.languages} theme={THEME} columns={2} />
        </div>

        {/* Certificaciones destacadas */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-5">
            <Icon name="certificates" size={15} />
            {dict.curriculum.featuredCerts}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCerts.map((cert) => (
              <Link
                key={cert.id}
                href="/certificates"
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-purple/40 transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple mb-2">
                  {fmtDate(cert.date)}
                </p>
                <h3 className="font-header font-bold text-white text-sm leading-snug mb-1">{cert.title}</h3>
                <p className="text-xs text-gray-500">{cert.provider}</p>
                {cert.level ? <p className="text-xs text-neon-green mt-2">{cert.level}</p> : null}
              </Link>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            Catálogo completo con documentos y verificación en{' '}
            <Link href="/certificates" className="text-neon-purple hover:text-white transition-colors">
              /certificates
            </Link>
          </p>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.portfolio.ctaCertificates, href: '/certificates', icon: 'certificates' },
            { label: dict.portfolio.goProjects, href: '/projects', icon: 'rocket' },
            { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
            { label: dict.portfolio.ctaContact, href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />

        {/* Vista previa a pantalla completa */}
        <Modal
          open={fullscreen !== null}
          onOpenChange={(open) => {
            if (!open) setFullscreen(null);
          }}
          title={fullscreen?.label ?? 'Currículum'}
          description={
            fullscreen ? `Vista previa · PDF · ${fullscreen.pages} páginas · ${fullscreen.size}` : undefined
          }
          size="lg"
          className="max-w-5xl!"
        >
          {fullscreen ? (
            <div className="space-y-4">
              <CvPreview
                href={fullscreen.href}
                label={fullscreen.label}
                orientation={fullscreen.orientation}
                hideToolbar={false}
                frameClassName="max-w-[min(100%,52rem)]"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <a
                  href={fullscreen.href}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl font-bold text-xs hover:bg-neon-purple hover:text-white transition-all"
                >
                  <Icon name="download" size={15} />
                  Descargar PDF
                </a>
                <a
                  href={fullscreen.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                >
                  <Icon name="external" size={15} />
                  Abrir en pestaña nueva
                </a>
              </div>
            </div>
          ) : null}
        </Modal>
      </PageReveal>

      <div className="print:hidden">
        <QuickDocks />
      </div>
    </div>
  );
}
