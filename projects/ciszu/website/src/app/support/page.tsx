'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import { Mail, MessageCircle, ExternalLink, LifeBuoy } from "lucide-react";
import { SocialIcon, SOCIAL_COLORS, InfoHero, type InfoTheme } from '@ciszu/ui';
import { CISZU_NETWORK } from "@/config/site";
import QuickDocks from "@/components/molecules/QuickDocks";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import { supabase } from "@/config/supabase";
import AuthWarningModal from "@/components/shared/AuthWarningModal";
import { useAppStore } from '@/store';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@ciszu/ui';
import { FlagIcon } from '@ciszu/ui';
import { useDict } from '@/lib/useDict';

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const I = {
  // Icono de soporte: boya salvavidas circular (Lucide life-buoy), no auriculares.
  support: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>,
  msg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  pulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ),
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ),
  contact: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  login: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  userPlus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  server: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  ceo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lifebuoy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>,
};

const CONTACT_TYPES = [
  "Colaboración", "Reporte de Bug", "Denuncia de Usuario", "Recomendación",
  "Feedback de Audio", "Problema de Seguridad", "Recuperación de Cuenta",
  "Error de Pago", "Error de Traducción", "Sugerencia de Función",
  "Asociación / Partnership", "Consulta de Prensa", "Asunto Legal",
  "Soporte Técnico General", "Participación en Eventos", "Otro"
];

const REGIONS = [
  { code: 've', name: 'Venezuela' },
  { code: 'es', name: 'España' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'mx', name: 'México' },
  { code: 'us', name: 'Estados Unidos' },
  { code: 'br', name: 'Brasil' },
  { code: 'global', name: 'Internacional' },
];

const CATEGORIES = {
  "Técnico": ["Servidores", "Carga de Assets", "Sincronización Audio", "Performance"],
  "Cuenta": ["Login / Registro", "Perfil", "Privacidad", "Seguridad"],
  "Contenido": ["Canciones", "Mapas / Charts", "Gráficos", "Eventos"],
  "Comunidad": ["Moderación", "Foros", "Competitivo", "Reportes"]
} as const;

const SOCIALS = [
  { name: 'Discord', href: CISZU_NETWORK.social.discord, icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 4.18 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.11 10.11 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
  { name: 'YouTube', href: CISZU_NETWORK.social.youtube, icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: 'Instagram', href: CISZU_NETWORK.social.instagram, icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
  { name: 'X', href: CISZU_NETWORK.social.x, icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: 'GitHub', href: CISZU_NETWORK.social.github, icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
];

const supportChannels = [
  { icon: Mail, label: "Email", value: CISZU_NETWORK.email, href: `mailto:${CISZU_NETWORK.email}`, color: "from-brand to-brand-light" },
  { icon: MessageCircle, label: "Discord", value: "Invitación al Servidor", href: CISZU_NETWORK.social.discord, color: "from-[#5865F2] to-[#4752C4]" },
  { icon: ExternalLink, label: "GitHub Issues", value: "Reportar Problemas", href: CISZU_NETWORK.social.github, color: "from-gray-600 to-gray-800" },
];

export default function SupportPage() {
  usePageTitle('SUPPORT');
  const t = useDict();
  const { user } = useAppStore();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(CISZU_NETWORK.email);
    setCopied(true);
    toast(t.supportPage.emailCopied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    region: 've',
    contactType: 'Soporte Técnico General',
    phone: '',
    device: '',
    category: 'Técnico',
    subCategory: 'Performance',
    message: ''
  });

  useEffect(() => {
    fetchUserAndTickets();
  }, []);

  const fetchUserAndTickets = async () => {
    setLoading(true);
    if (user) {
      const { data, error } = await supabase
        .from('ciszunetwork_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setTickets(data);
    }
    setLoading(false);
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast(msg, type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthWarningOpen(true);
      return;
    }

    const activeTicketsCount = tickets.filter(t => t.status !== 'closed').length;
    if (activeTicketsCount >= 3) {
      showToast(t.supportPage.limitError, 'error');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.from('ciszunetwork_tickets').insert([{
      user_id: user.id,
      display_name: formData.displayName,
      username: formData.username,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      region: formData.region,
      contact_type: formData.contactType,
      phone: formData.phone,
      device: formData.device,
      category: formData.category,
      sub_category: formData.subCategory,
      message: formData.message,
      status: 'pending'
    }]).select();

    if (error) {
      showToast(t.supportPage.syncError + error.message, 'error');
    } else {
      showToast(t.supportPage.syncOk + data[0].id.slice(0, 8).toUpperCase(), 'success');
      setFormData({ ...formData, message: '' });
      fetchUserAndTickets();
      setActiveTab('list');
    }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from('ciszunetwork_tickets')
      .update({ status })
      .eq('id', id);

    if (error) showToast(t.supportPage.updateError + error.message, 'error');
    else {
      showToast(t.supportPage.updateOk, 'success');
      fetchUserAndTickets();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.supportPage.confirmDelete)) return;
    const { error } = await supabase.from('ciszunetwork_tickets').delete().eq('id', id);
    if (error) showToast(t.supportPage.deleteError + error.message, 'error');
    else {
      showToast(t.supportPage.deleteOk, 'success');
      fetchUserAndTickets();
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen pt-24 pb-20 px-4">
        <PageAmbience />

        <PageReveal className="relative mx-auto max-w-screen-xl space-y-16">

        {/* --- HERO --- */}
        <InfoHero
          icon="support"
          title={t.supportPage.heroTitle}
          subtitle={t.supportPage.heroSubtitle}
          kicker={t.supportPage.heroKicker}
          theme={THEME}
        />

        {/* TABS NAVEGACIÓN */}
        <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'new' ? 'bg-brand-light text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {t.supportPage.tabNew}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'list' ? 'bg-brand-light text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {t.supportPage.tabList} {tickets.length > 0 && `(${tickets.length})`}
            </button>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* --- MAIN CONTENT --- */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {activeTab === 'new' ? (
                <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">

                   {/* RECURSOS DE AUTOSERVICIO (SIEMPRE VISIBLES) */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Link href="/help" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.help}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.supportPage.resources.help}</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">{t.supportPage.resources.helpDesc}</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/contact" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.contact}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.supportPage.resources.contact}</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">{t.supportPage.resources.contactDesc}</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/information" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.info}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.supportPage.resources.info}</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">{t.supportPage.resources.infoDesc}</p>
                            </div>
                         </div>
                      </Link>
                   </div>

                   {!user && !loading ? (
                     <div className="p-16 bg-black border-2 border-brand-light/20 rounded-[4rem] text-center space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-brand-light font-black text-9xl italic uppercase tracking-tighter">STOP</div>
                        <div className="w-24 h-24 text-brand-light mx-auto animate-pulse">{I.alert}</div>
                        <div className="space-y-3">
                           <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">{t.supportPage.authTitle}</h2>
                           <p className="text-gray-500 font-bold text-sm md:text-base uppercase tracking-widest max-w-md mx-auto">
                               {t.supportPage.authText}
                           </p>
                        </div>
                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
                           <Link href="/login" className="px-16 py-6 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group/btn">
                              <div className="w-5 h-5 group-hover/btn:scale-110 transition-transform">{I.login}</div> {t.supportPage.authLogin}
                           </Link>
                           <Link href="/register" className="px-16 py-6 bg-transparent border-2 border-brand-light text-brand-light font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light/10 hover:scale-105 transition-all flex items-center justify-center gap-4 group/reg">
                              <div className="w-5 h-5 group-hover/reg:scale-110 transition-transform">{I.userPlus}</div> {t.supportPage.authRegister}
                           </Link>
                        </div>
                     </div>
                   ) : (
                     <>
                        {/* REGLAS RÁPIDAS */}
                        <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex items-start gap-4">
                           <div className="w-8 h-8 text-brand-light shrink-0 mt-1">{I.info}</div>
                           <div className="space-y-1">
                              <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.supportPage.protocolTitle}</h4>
                              <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                                 {t.supportPage.protocolText}
                              </p>
                           </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-10">
                           <div className="space-y-6">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-brand-light">{I.user}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t.supportPage.sectionIdentity}</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldUsername}</label>
                                   <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phUsername} />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldFullName}</label>
                                   <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phFullName} />
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldLastName}</label>
                                   <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phLastName} />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldEmail}</label>
                                   <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phEmail} />
                                </div>
                             </div>
                           </div>

                           <div className="space-y-6 pt-4">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-brand-accent">{I.tag}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t.supportPage.sectionNature}</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldContactType}</label>
                                   <select value={formData.contactType} onChange={e => setFormData({...formData, contactType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                      {CONTACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldRegion}</label>
                                   <div className="relative">
                                      <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                         {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                                      </select>
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                         <FlagIcon code={formData.region} className="w-5 h-4" />
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldCategory}</label>
                                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subCategory: Object.values(CATEGORIES)[0][0]})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                      {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldSubCategory}</label>
                                   <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                      {CATEGORIES[formData.category as keyof typeof CATEGORIES]?.map(s => <option key={s} value={s}>{s}</option>)}
                                   </select>
                                </div>
                             </div>
                           </div>

                           <div className="space-y-6 pt-4">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-brand-light">{I.msg}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">{t.supportPage.sectionDetails}</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldPhone}</label>
                                   <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phPhone} />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldDevice}</label>
                                   <input type="text" value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder={t.supportPage.phDevice} />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-2">{t.supportPage.fieldMessage}</label>
                                <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={5} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all resize-none" placeholder={t.supportPage.phMessage} />
                             </div>
                           </div>

                           <button type="submit" disabled={submitting} className="w-full py-5 bg-brand-light text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:shadow-lg hover:shadow-brand-light/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                              <div className="w-5 h-5">{I.send}</div> {submitting ? t.supportPage.submitting : t.supportPage.submit}
                           </button>
                        </form>
                     </>
                   )}
                  </motion.div>
                ) : (
                <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {loading ? (
                    <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center">
                      <div className="w-12 h-12 border-2 border-brand-light border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{t.supportPage.loadingTickets}</p>
                    </div>
                  ) :
                  tickets.length === 0 ? (
                    <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                        {I.msg}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">{t.supportPage.emptyTitle}</h3>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{t.supportPage.emptyHint}</p>
                      </div>
                      <button onClick={() => setActiveTab('new')} className="px-8 py-3 bg-brand-light text-black font-header font-black uppercase italic tracking-widest rounded-2xl hover:shadow-lg hover:shadow-brand-light/20 transition-all">
                         {t.supportPage.createFirst}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map(ticket => (
                        <div key={ticket.id} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-brand-light/30 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full bg-brand/20 text-brand-light text-[10px] font-black font-mono">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ticket.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ticket.status === 'open' ? 'bg-neon-blue/20 text-neon-blue' : ticket.status === 'closed' ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white/40'}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-white font-header font-bold text-sm mb-1">{ticket.contact_type} — {ticket.category}</h4>
                          <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{ticket.message}</p>
                          <div className="flex gap-3 mt-4">
                            <button onClick={() => handleStatusUpdate(ticket.id, 'closed')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-neon-green hover:text-black transition-all">{t.supportPage.close}</button>
                            <button onClick={() => handleDelete(ticket.id)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"><div className="w-3 h-3">{I.trash}</div> {t.supportPage.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- SIDEBAR INFO --- */}
          <aside className="lg:col-span-4 space-y-8">
             {/* RECEPTOR DEL CONTACTO */}
              <div className="p-8 bg-gradient-to-br from-brand/10 to-transparent border border-brand/20 rounded-[3rem] space-y-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-light font-black text-6xl italic pointer-events-none">CEO</div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 text-brand-light p-3 bg-brand/10 rounded-2xl border border-brand/20">
                       {I.lifebuoy}
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-white uppercase tracking-widest">{t.supportPage.receiverTitle}</h3>
                       <p className="text-[10px] text-brand-light font-black uppercase tracking-[0.2em]">{t.supportPage.receiverName}</p>
                    </div>
                 </div>
                 <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                    {t.supportPage.receiverText}
                 </p>
                 <div className="flex items-center gap-3">
                    <a href={`mailto:${CISZU_NETWORK.email}`} className="text-white underline text-sm lowercase">{CISZU_NETWORK.email}</a>
                    <button onClick={copyEmail} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                      {copied ? t.supportPage.copied : t.supportPage.copy}
                    </button>
                 </div>
              </div>

             <div className="p-8 bg-gradient-to-br from-neon-green/10 to-transparent border border-neon-green/20 rounded-[3rem] space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-neon-green font-black text-6xl italic pointer-events-none">24/7</div>
                <div className="w-16 h-16 text-neon-green mx-auto animate-pulse">{I.pulse}</div>
                <div className="space-y-1">
                   <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">{t.supportPage.nucleusTitle}</h3>
                   <p className="text-neon-green font-black text-[9px] uppercase tracking-[0.4em]">{t.supportPage.nucleusSub}</p>
                </div>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                   {t.supportPage.nucleusText}
                </p>
             </div>

             <div className="p-8 bg-doc-dark border border-white/5 rounded-[3rem] space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] border-b border-white/10 pb-4">{t.supportPage.prioritiesTitle}</h3>
                <div className="space-y-4">
                   {[
                     { label: t.supportPage.prioCritical, desc: t.supportPage.prioCriticalDesc, color: 'text-neon-pink' },
                     { label: t.supportPage.prioHigh, desc: t.supportPage.prioHighDesc, color: 'text-neon-purple' },
                     { label: t.supportPage.prioNormal, desc: t.supportPage.prioNormalDesc, color: 'text-neon-blue' },
                     { label: t.supportPage.prioLow, desc: t.supportPage.prioLowDesc, color: 'text-gray-500' },
                   ].map(p => (
                     <div key={p.label} className="flex gap-4 items-start group">
                        <div className={`w-1 h-8 rounded-full bg-current ${p.color} opacity-40 group-hover:opacity-100 transition-all`} />
                        <div>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.label}</p>
                           <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">{p.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>

        {/* --- SOCIAL GALAXY --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12 bg-black/40 p-12 md:p-20 rounded-[5rem] border border-white/5">
           <div className="text-center space-y-2 mb-12">
             <div className="flex items-center justify-center gap-4 text-brand-light mb-4">
                <div className="w-8 h-8">{I.globe}</div>
                <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">{t.supportPage.socialTitle}</h3>
             </div>
             <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-2">{t.supportPage.socialSubtitle}</p>
           </div>

           <div className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-brand/10" />
                 <span className="text-brand-light font-black text-[10px] uppercase tracking-widest px-4">{t.supportPage.socialSync}</span>
                 <div className="h-[1px] flex-1 bg-brand/10" />
              </div>
               <div className="flex flex-wrap justify-center gap-4">
                   {SOCIALS.map(s => {
                     return (
                       <button key={s.name} onClick={() => window.open(s.href, '_blank')}
                         className="flex items-center gap-4 px-8 py-4 rounded-3xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:scale-105 shadow-xl hover:text-white hover:bg-opacity-40 group/btn"
                       >
                          <div className="w-6 h-6 group-hover/btn:scale-110 transition-transform">{s.icon}</div>
                          <span className="text-[11px] font-black uppercase tracking-widest">{s.name}</span>
                       </button>
                     );
                   })}
               </div>
           </div>
        </motion.section>

        <QuickDocks />
        </PageReveal>
      </div>
    </MainLayout>
  );
}
