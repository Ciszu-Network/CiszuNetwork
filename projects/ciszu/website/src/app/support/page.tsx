'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LifeBuoy, Mail, MessageCircle, ArrowRight, ExternalLink, Heart, Star } from "lucide-react";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SOCIAL_COLORS } from "@/config/site";
import { getDonationMethods } from "@ciszunetwork/payments";
import QuickDocks from "@/components/molecules/QuickDocks";
import { supabase } from "@/config/supabase";
import AuthWarningModal from "@/components/shared/AuthWarningModal";
import { useAppStore } from '@/store';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@ciszu/ui';

const I = {
  support: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
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

const supportChannels = [
  { icon: Mail, label: "Email", value: CISZU_NETWORK.email, href: `mailto:${CISZU_NETWORK.email}`, color: "from-brand to-brand-light" },
  { icon: MessageCircle, label: "Discord", value: "Invitación al Servidor", href: CISZU_NETWORK.social.discord, color: "from-[#5865F2] to-[#4752C4]" },
  { icon: ExternalLink, label: "GitHub Issues", value: "Reportar Problemas", href: CISZU_NETWORK.social.github, color: "from-gray-600 to-gray-800" },
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
      showToast('Límite excedido: Máximo 3 tickets activos permitidos.', 'error');
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
      .from('ciszunetwork_tickets')
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
    const { error } = await supabase.from('ciszunetwork_tickets').delete().eq('id', id);
    if (error) showToast('Error de eliminación: ' + error.message, 'error');
    else {
      showToast('Ticket eliminado satisfactoriamente.', 'success');
      fetchUserAndTickets();
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Soporte
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Estamos aquí para ayudarte
          </p>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="flex justify-center gap-4 pt-8 mb-12">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'new' ? 'bg-brand-light text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              Nuevo Ticket
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === 'list' ? 'bg-brand-light text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
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
                      <Link href="/help" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.help}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Centro de Ayuda</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">Guías y Protocolos</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/contact" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.contact}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Contacto</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">Canales Directos</p>
                            </div>
                         </div>
                      </Link>
                      <Link href="/information" className="p-8 bg-brand/10 border-2 border-brand/20 rounded-[2.5rem] hover:bg-brand/20 hover:border-brand-light/30 transition-all group/card">
                         <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 text-brand-light group-hover/card:scale-110 transition-transform">{I.info}</div>
                            <div className="space-y-1">
                               <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Información</h4>
                               <p className="text-[9px] text-brand-light/60 font-bold uppercase tracking-[0.2em]">Acerca del Proyecto</p>
                            </div>
                         </div>
                      </Link>
                   </div>

                   {!user && !loading ? (
                     <div className="p-16 bg-black border-2 border-brand-light/20 rounded-[4rem] text-center space-y-10 shadow-2xl">
                        <div className="w-24 h-24 text-brand-light mx-auto animate-pulse">{I.alert}</div>
                        <div className="space-y-3">
                           <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">AUTENTICACIÓN REQUERIDA</h2>
                           <p className="text-gray-500 font-bold text-sm md:text-base uppercase tracking-widest max-w-md mx-auto">
                               Para garantizar la integridad y el seguimiento de tu ticket, debes estar autenticado en Ciszu ID.
                           </p>
                        </div>
                        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
                           <Link href="/login" className="px-16 py-6 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4">
                              <div className="w-5 h-5">{I.login}</div> ACCEDER
                           </Link>
                           <Link href="/register" className="px-16 py-6 bg-transparent border-2 border-brand-light text-brand-light font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light/10 hover:scale-105 transition-all flex items-center justify-center gap-4">
                              <div className="w-5 h-5">{I.userPlus}</div> REGISTRARSE
                           </Link>
                        </div>
                     </div>
                   ) : (
                     <form onSubmit={handleSubmit} className="p-8 md:p-10 bg-white/5 border border-white/5 rounded-[3rem] space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nombre de usuario</label>
                              <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="@usuario" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nombre completo</label>
                              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="Nombre" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Apellido</label>
                              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="Apellido" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email</label>
                              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="tu@email.com" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Región</label>
                              <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tipo de contacto</label>
                              <select value={formData.contactType} onChange={e => setFormData({...formData, contactType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                {CONTACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Teléfono (opcional)</label>
                              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="+58 412 685 8111" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dispositivo</label>
                              <input type="text" value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all" placeholder="PC / Móvil / Tablet" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Categoría</label>
                              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, subCategory: Object.values(CATEGORIES)[0][0]})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Subcategoría</label>
                              <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all">
                                {CATEGORIES[formData.category as keyof typeof CATEGORIES]?.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mensaje</label>
                           <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={5} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-light transition-all resize-none" placeholder="Describe tu problema o solicitud en detalle..." />
                        </div>

                        <button type="submit" disabled={submitting} className="w-full py-5 bg-brand-light text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:shadow-lg hover:shadow-brand-light/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                           <div className="w-5 h-5">{I.send}</div> {submitting ? 'ENVIANDO...' : 'ENVIAR TICKET'}
                        </button>
                     </form>
                   )}
                  </motion.div>
                ) : (
                <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {loading ? (
                    <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center">
                      <div className="w-12 h-12 border-2 border-brand-light border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Cargando tickets...</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="p-20 bg-white/5 border border-white/5 rounded-[4rem] text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                        {I.msg}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-tighter">SIN TICKETS</h3>
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No has enviado ninguna solicitud aún</p>
                      </div>
                      <button onClick={() => setActiveTab('new')} className="px-8 py-3 bg-brand-light text-black font-header font-black uppercase italic tracking-widest rounded-2xl hover:shadow-lg hover:shadow-brand-light/20 transition-all">
                         CREAR PRIMER TICKET
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
                            <button onClick={() => handleStatusUpdate(ticket.id, 'closed')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-neon-green hover:text-black transition-all">CERRAR</button>
                            <button onClick={() => handleDelete(ticket.id)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"><div className="w-3 h-3">{I.trash}</div> ELIMINAR</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] space-y-6">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Canales Directos</h3>
              <div className="space-y-4">
                <a href={`mailto:${CISZU_NETWORK.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-light/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center text-brand-light group-hover:scale-110 transition-transform">{I.msg}</div>
                  <div>
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Email</div>
                    <div className="text-sm font-bold text-white">{CISZU_NETWORK.email}</div>
                  </div>
                </a>
                <a href={CISZU_NETWORK.social.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-light/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] group-hover:scale-110 transition-transform"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 4.18 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.11 10.11 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></div>
                  <div>
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Discord</div>
                    <div className="text-sm font-bold text-white">Servidor Oficial</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="p-8 bg-brand/5 border border-brand/20 rounded-[3rem] space-y-4">
              <h3 className="text-[10px] font-black text-brand-light/60 uppercase tracking-widest">Tiempo de respuesta</h3>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-sm font-bold text-white">24-48 horas hábiles</span>
              </div>
              <p className="text-[10px] text-white/40 font-bold leading-relaxed">
                Los tickets se procesan por orden de llegada. Para urgencias, usa Discord.
              </p>
            </div>
          </div>
        </div>

        {/* CANALES DE SOPORTE ADICIONALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {supportChannels.map((ch, i) => (
            <a key={i} href={ch.href} target="_blank" rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <ch.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold font-header text-sm mb-1">{ch.label}</p>
              <p className="text-brand-light text-xs">{ch.value}</p>
            </a>
          ))}
        </div>
      </div>

      <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
      <QuickDocks />
    </div>
  );
}
