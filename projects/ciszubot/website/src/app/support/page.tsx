'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import QuickDocks from '@/components/molecules/QuickDocks';
import { supabase } from "@/config/supabase";
import AuthWarningModal from "@/components/shared/AuthWarningModal";
import { useAppStore } from '@/store';
import { InfoHero, useToast, Button, type InfoTheme } from '@ciszu/ui';
import { FlagIcon } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

const I = {
  // Icono de soporte: boya salvavidas circular (Lucide life-buoy), no auriculares.
  support: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>,
  msg: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  pulse: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  shield: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  tag: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  send: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  info: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>,
  trash: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  close: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  alert: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ),
  globe: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  help: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ),
  contact: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  login: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  userPlus: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  server: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  ceo: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  share: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  lifebuoy: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>,
};

const CONTACT_TYPES = [
  "Colaboración", "Reporte de Bug", "Denuncia de Usuario", "Recomendación",
  "Feedback", "Problema de Seguridad", "Recuperación de Cuenta",
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
  { name: 'Discord', href: 'https://discord.com/invite/W3kMtMMj6E' },
  { name: 'X', href: 'https://x.com/CiszukoAntony' },
  { name: 'YouTube', href: 'https://www.youtube.com/@CiszuNetwork' },
  { name: 'Instagram', href: 'https://www.instagram.com/ciszunetwork/' },
  { name: 'GitHub', href: 'https://github.com/Ciszu-Network' },
];

export default function SupportPage() {
  usePageTitle('SUPPORT');
  const { user } = useAppStore();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText('ciszunetwork@gmail.com');
    setCopied(true);
    toast('Email copiado al portapapeles', 'success');
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
        .from('ciszubot_tickets')
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
      showToast('Límite excedido: Máximo 3 tickets activos permitidos.', 'error');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.from('ciszubot_tickets').insert([{
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
      showToast('Falla en la transmisión: ' + error.message, 'error');
    } else {
      showToast('Ticket sincronizado. ID: #' + data[0].id.slice(0, 8).toUpperCase(), 'success');
      setFormData({ ...formData, message: '' });
      fetchUserAndTickets();
      setActiveTab('list');
    }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from('ciszubot_tickets')
      .update({ status })
      .eq('id', id);

    if (error) showToast('Error de actualización: ' + error.message, 'error');
    else {
      showToast('Estado de ticket actualizado.', 'success');
      fetchUserAndTickets();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este ticket? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('ciszubot_tickets').delete().eq('id', id);
    if (error) showToast('Error de eliminación: ' + error.message, 'error');
    else {
      showToast('Ticket eliminado satisfactoriamente.', 'success');
      fetchUserAndTickets();
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-neon-pink/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 space-y-16">

        {/* --- HERO HEADER --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative pt-12">
          <InfoHero
            icon="support"
            title="Soporte"
            subtitle="Asistencia Maestra y Monitoreo de Sistemas"
            theme={THEME}
          />
        </motion.header>

        {/* TABS NAVEGACIÓN */}
        <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'new' ? 'bg-neon-pink text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              Nuevo Ticket
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'list' ? 'bg-neon-purple text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              Mis Tickets {tickets.length > 0 && `(${tickets.length})`}
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
                      <Link href="/help" className="p-8 bg-neon-cyan/10 border-2 border-neon-cyan/30 rounded-[2.5rem] hover:bg-neon-cyan/20 hover:border-neon-cyan transition-all group/card shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:shadow-[0_0_50px_rgba(0,240,255,0.3)]">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-neon-cyan drop-shadow-neon-cyan group-hover/card:scale-110 transition-transform">{I.help}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Centro de Ayuda</h4>
                               <p className="text-[9px] text-neon-cyan/60 font-bold uppercase tracking-[0.2em]">Guías y Protocolos</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/contact" className="p-8 bg-neon-purple/10 border-2 border-neon-purple/30 rounded-[2.5rem] hover:bg-neon-purple/20 hover:border-neon-purple transition-all group/card shadow-[0_0_30px_rgba(191,0,255,0.1)]">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-neon-purple drop-shadow-neon-purple group-hover/card:scale-110 transition-transform">{I.contact}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Contacto</h4>
                               <p className="text-[9px] text-neon-purple/60 font-bold uppercase tracking-[0.2em]">Canales Directos</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/information" className="p-8 bg-neon-pink/10 border-2 border-neon-pink/30 rounded-[2.5rem] hover:bg-neon-pink/20 hover:border-neon-pink transition-all group/card shadow-[0_0_30px_rgba(255,0,128,0.1)]">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-neon-pink drop-shadow-neon-pink group-hover/card:scale-110 transition-transform">{I.info}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Información</h4>
                               <p className="text-[9px] text-neon-pink/60 font-bold uppercase tracking-[0.2em]">Acerca del Proyecto</p>
                            </div>
                         </div>
                      </Link>
                   </div>

                   {!user && !loading ? (
                     <div className="p-16 bg-doc-dark border-2 border-neon-cyan/20 rounded-[4rem] text-center space-y-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-neon-cyan font-black text-9xl italic uppercase tracking-tighter">STOP</div>
                        <div className="w-24 h-24 text-neon-cyan mx-auto drop-shadow-neon-cyan animate-pulse">{I.alert}</div>
                        <div className="space-y-3">
                           <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">AUTENTICACIÓN REQUERIDA</h2>
                           <p className="text-gray-500 font-bold text-sm md:text-base uppercase tracking-widest max-w-md mx-auto">
                               Para garantizar la integridad y el seguimiento de tu ticket, debes estar autenticado.
                           </p>
                        </div>
                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
                           <Link href="/login" className="px-16 py-6 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-neon-cyan hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group/btn">
                              <div className="w-5 h-5 text-black group-hover/btn:scale-110 transition-transform">{I.login}</div> ACCEDER
                           </Link>
                           <Link href="/register" className="px-16 py-6 bg-transparent border-2 border-neon-cyan text-neon-cyan font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-neon-cyan/10 hover:scale-105 transition-all flex items-center justify-center gap-4 group/reg">
                              <div className="w-5 h-5 group-hover/reg:scale-110 transition-transform">{I.userPlus}</div> REGISTRARSE
                           </Link>
                        </div>
                     </div>
                   ) : (
                     <>
                        {/* REGLAS RÁPIDAS */}
                        <div className="bg-black/40 border border-white/5 p-6 rounded-3xl flex items-start gap-4">
                           <div className="w-8 h-8 text-neon-blue shrink-0 mt-1">{I.info}</div>
                           <div className="space-y-1">
                              <h4 className="text-xs font-black text-white uppercase tracking-widest">Protocolo de Asistencia</h4>
                              <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                                 ¿No encontraste solución en los recursos anteriores? Genera un ticket a continuación. Garantizamos respuesta en menos de 24h.
                              </p>
                           </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 bg-doc-dark border border-white/10 rounded-[4rem] shadow-2xl space-y-10 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-neon-pink font-black text-9xl italic uppercase tracking-tighter pointer-events-none">NEW</div>

                           <div className="space-y-8">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-neon-pink">{I.user}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Identidad del Remitente</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Display Name</label>
                                   <input required value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-neon-pink/50 outline-none transition-all" placeholder="Ej: Ciszu Master" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Username (@)</label>
                                   <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-neon-pink/50 outline-none transition-all" placeholder="Ej: antony_ciszu" />
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Nombre</label>
                                   <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" placeholder="Francisco" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Apellido</label>
                                   <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" placeholder="Garcia" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Email de Contacto</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-neon-blue/50 outline-none transition-all" placeholder="tu-email@servidor.com" />
                             </div>
                           </div>

                           <div className="space-y-8 pt-4">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-neon-purple">{I.tag}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Naturaleza del Ticket</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Tipo de Contacto</label>
                                   <select value={formData.contactType} onChange={e => setFormData({...formData, contactType: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer">
                                      {CONTACT_TYPES.map(t => <option key={t} value={t} className="bg-doc-dark">{t}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Región de Origen</label>
                                   <div className="relative">
                                      <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none cursor-pointer">
                                         {REGIONS.map(r => <option key={r.code} value={r.code} className="bg-doc-dark">{r.name}</option>)}
                                      </select>
                                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                         <FlagIcon code={formData.region} className="w-5 h-4" />
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Categoría</label>
                                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any, subCategory: CATEGORIES[e.target.value as keyof typeof CATEGORIES][0]})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                                      {Object.keys(CATEGORIES).map(c => <option key={c} value={c} className="bg-doc-dark">{c}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Sub-Categoría</label>
                                   <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none">
                                      {CATEGORIES[formData.category as keyof typeof CATEGORIES].map(sc => <option key={sc} value={sc} className="bg-doc-dark">{sc}</option>)}
                                   </select>
                                </div>
                             </div>
                           </div>

                           <div className="space-y-8 pt-4">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                <div className="w-4 h-4 text-neon-blue">{I.msg}</div>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Detalles del Requerimiento</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Teléfono (Opcional)</label>
                                   <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="+58 ..." />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Dispositivo / Sistema</label>
                                   <input value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Ej: PC Windows 11, Chrome" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-2">Mensaje / Descripción</label>
                                <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-3xl px-6 py-5 text-sm font-bold outline-none resize-none placeholder:text-gray-800" placeholder="Describe tu situación detalladamente..." />
                             </div>
                           </div>

                           <Button
                             disabled={submitting}
                             variant="neon"
                             fullWidth
                             className="py-6 rounded-3xl bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue border-none shadow-[0_0_30px_rgba(255,0,255,0.2)] hover:shadow-[0_0_50px_rgba(255,0,255,0.4)] transition-all"
                           >
                              <div className="flex items-center gap-4 text-sm font-black italic tracking-widest">
                                 {submitting ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : I.send}
                                 <span>{submitting ? 'PROCESANDO TRANSMISIÓN...' : 'ENVIAR TICKET AL NÚCLEO'}</span>
                              </div>
                           </Button>
                        </form>
                     </>
                   )}
                  </motion.div>
                ) : (
                <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 min-h-[600px]">
                   <div className="flex items-center justify-between mb-8">
                      <div className="space-y-1">
                         <h2 className="text-3xl font-header font-black text-white italic tracking-tighter uppercase">HISTORIAL DE ASISTENCIA</h2>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Visualización Privada de tus Requerimientos</p>
                      </div>
                      <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase text-gray-400">
                         {tickets.length} TICKETS TOTALES
                      </div>
                   </div>

                   {loading ? (
                     <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Sincronizando con la Base de Datos...</p>
                     </div>
                   ) : tickets.length === 0 ? (
                     <div className="text-center py-32 space-y-6 bg-black/40 border border-white/5 rounded-[4rem]">
                        <div className="w-20 h-20 text-gray-800 mx-auto">{I.msg}</div>
                        <div className="space-y-1">
                           <h3 className="text-xl font-header font-black text-white uppercase italic">SIN TICKETS ACTIVOS</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No tienes registros pendientes en el sistema.</p>
                        </div>
                        <Button onClick={() => setActiveTab('new')} className="px-10">GENERAR PRIMER TICKET</Button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-6">
                        {tickets.map(ticket => (
                          <div key={ticket.id} className="group relative p-8 bg-doc-dark border border-white/5 rounded-[3rem] hover:border-white/10 transition-all">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-3">
                                   <div className="flex items-center gap-3">
                                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-neon-blue uppercase tracking-widest">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        ticket.status === 'pending' ? 'bg-neon-blue/10 text-neon-blue' :
                                        ticket.status === 'open' ? 'bg-neon-green/10 text-neon-green' :
                                        'bg-gray-800 text-gray-500'
                                      }`}>
                                        {ticket.status === 'pending' ? 'EN ESPERA' : ticket.status === 'open' ? 'EN PROCESO' : 'TERMINADO'}
                                      </span>
                                   </div>
                                   <h4 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">{ticket.contact_type}</h4>
                                   <p className="text-white text-sm font-medium line-clamp-2 italic">&quot;{ticket.message}&quot;</p>
                                   <div className="flex items-center gap-4 text-[9px] font-black text-white/50 uppercase tracking-widest pt-2">
                                      <div className="flex items-center gap-2"><div className="w-3 h-3">{I.clock}</div> {new Date(ticket.created_at).toLocaleDateString()}</div>
                                      <div className="flex items-center gap-2"><div className="w-3 h-3">{I.tag}</div> {ticket.category} / {ticket.sub_category}</div>
                                   </div>
                                </div>
                                <div className="flex md:flex-col gap-3 shrink-0">
                                   {ticket.status !== 'closed' && (
                                     <button onClick={() => handleStatusUpdate(ticket.id, 'closed')} className="flex-1 md:w-full px-6 py-3 bg-white/5 rounded-2xl text-[9px] font-black uppercase text-white hover:bg-neon-green hover:text-black transition-all flex items-center justify-center gap-2">
                                        <div className="w-3 h-3">{I.close}</div> TERMINAR
                                     </button>
                                   )}
                                   <button onClick={() => handleDelete(ticket.id)} className="flex-1 md:w-full px-6 py-3 bg-white/5 rounded-2xl text-[9px] font-black uppercase text-neon-pink hover:bg-neon-pink hover:text-black transition-all flex items-center justify-center gap-2">
                                      <div className="w-3 h-3">{I.trash}</div> ELIMINAR
                                   </button>
                                </div>
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
             <div className="p-8 bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/20 rounded-[3rem] space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-neon-blue font-black text-6xl italic pointer-events-none">CEO</div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 text-neon-blue p-3 bg-neon-blue/10 rounded-2xl border border-neon-blue/20">
                      {I.support}
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Receptor del Ticket</h3>
                      <p className="text-[10px] text-neon-blue font-black uppercase tracking-[0.2em]">Ciszu Network Support</p>
                   </div>
                </div>
                 <div className="space-y-3">
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                       Tu requerimiento será procesado directamente por el **Equipo de Asistencia de CiszuBot**, bajo la supervisión de **Ciszuko Antony**.
                    </p>
                    <div className="flex items-center gap-3">
                       <a href="mailto:ciszunetwork@gmail.com" className="text-white underline text-sm lowercase">ciszunetwork@gmail.com</a>
                       <button onClick={copyEmail} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                         {copied ? 'COPIADO' : 'COPIAR'}
                       </button>
                    </div>
                 </div>
             </div>

             <div className="p-8 bg-gradient-to-br from-neon-green/10 to-transparent border border-neon-green/20 rounded-[3rem] space-y-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-neon-green font-black text-6xl italic pointer-events-none">24/7</div>
                <div className="w-16 h-16 text-neon-green mx-auto animate-pulse">{I.pulse}</div>
                <div className="space-y-1">
                   <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">NÚCLEO OPERATIVO</h3>
                   <p className="text-neon-green font-black text-[9px] uppercase tracking-[0.4em]">Soporte Global Activo</p>
                </div>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">
                   Atendemos requerimientos las 24 horas, priorizando la estabilidad del ecosistema CiszuBot.
                </p>
             </div>

             <div className="p-8 bg-doc-dark border border-white/5 rounded-[3rem] space-y-6">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] border-b border-white/10 pb-4">Niveles de Prioridad</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Crítica', desc: 'Fallos de sistema o seguridad.', color: 'text-neon-pink' },
                     { label: 'Alta', desc: 'Problemas de cuenta o pagos.', color: 'text-neon-purple' },
                     { label: 'Normal', desc: 'Bugs menores o consultas.', color: 'text-neon-blue' },
                     { label: 'Baja', desc: 'Sugerencias y recomendaciones.', color: 'text-gray-500' },
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
             <div className="flex items-center justify-center gap-4 text-neon-blue mb-4">
                <div className="w-8 h-8">{I.globe}</div>
                <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">REDES OFICIALES</h3>
             </div>
             <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-2">CANALES EXCLUSIVOS DE CISZUBOT</p>
           </div>

           <div className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-neon-cyan/10" />
                 <span className="text-neon-cyan font-black text-[10px] uppercase tracking-widest px-4">Sincronización Social Unificada</span>
                 <div className="h-[1px] flex-1 bg-neon-cyan/10" />
              </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {SOCIALS.map(s => {
                      return (
                        <button key={s.name} onClick={() => window.open(s.href, '_blank')}
                          className="flex items-center gap-4 px-8 py-4 rounded-3xl border border-white/10 bg-white/5 text-gray-300 transition-all hover:scale-105 shadow-xl hover:text-white hover:bg-opacity-40 group/btn"
                        >
                           <div className="w-6 h-6 group-hover/btn:scale-110 transition-transform">{I.lifebuoy}</div>
                           <span className="text-[11px] font-black uppercase tracking-widest">{s.name}</span>
                        </button>
                      );
                    })}
                </div>
           </div>
        </motion.section>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
