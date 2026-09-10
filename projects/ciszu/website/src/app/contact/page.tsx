'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CISZU_NETWORK, CISZUKO_ANTONY, SOCIAL_COLORS } from "@/config/site";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, MessageCircle } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import { usePageTitle } from '@/lib/usePageTitle';

const I = {
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"/></svg>,
  map: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  globe: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.046c0 2.121.54 4.191 1.566 6.04L0 24l6.105-1.602a11.832 11.832 0 005.94 1.604h.005c6.634 0 12.043-5.412 12.046-12.047a11.8 11.8 0 00-3.483-8.39z"/></svg>,
};

function CopyField({ value, label, subValue, icon, theme = 'blue', showWhatsApp = false }: { value: string, label: string, subValue?: string, icon?: React.ReactNode, theme?: 'blue' | 'green' | 'purple', showWhatsApp?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const themes = {
    blue: 'border-brand-light/20 bg-brand-light/5 text-brand-light',
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green',
    purple: 'border-neon-purple/20 bg-neon-purple/5 text-neon-purple',
  };
  return (
    <div className={`flex items-center gap-4 p-4 border rounded-3xl transition-all group/field hover:border-opacity-50 ${themes[theme]}`}>
      {icon && (
        <div className="w-10 h-10 p-2 rounded-xl bg-white/5 group-hover/field:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-base md:text-lg font-header font-black text-white tracking-widest break-all">{value}</span>
        {subValue && <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-1">{subValue}</span>}
      </div>
      <div className="flex gap-2">
        {showWhatsApp && <Link href={`https://wa.me/${value.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all"><div className="w-5 h-5">{I.whatsapp}</div></Link>}
        <button onClick={handleCopy} className={`p-3 rounded-xl transition-all ${copied ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-gray-400 hover:bg-white hover:text-black'}`}>
          <div className="w-4 h-4">{copied ? I.check : I.copy}</div>
        </button>
      </div>
    </div>
  );
}

export default function ContactPage() {
  usePageTitle('CONTACT');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Send className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Contacto
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Estamos listos para escuchar tu proyecto
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <CopyField label="Email Principal" value={CISZU_NETWORK.email} icon={I.mail} theme="blue" />
            <CopyField label="Email CEO" value={CISZUKO_ANTONY.email} icon={I.mail} theme="purple" />
            <CopyField label="WhatsApp" value={CISZU_NETWORK.phone} subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />
            <CopyField label="Ubicación" value={CISZU_NETWORK.location} icon={I.map} theme="blue" />
            <CopyField label="Disponibilidad" value={`24/7 — ${CISZU_NETWORK.timezone}`} icon={I.clock} theme="blue" />

            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Redes Sociales</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand/30 transition-all text-xs"
                    style={{ borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}30` }}
                  >
                    <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={14} />
                    <span className="capitalize text-gray-400">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/10 to-transparent border border-brand/30 flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-12 h-12 text-brand-light mb-6 drop-shadow-brand" />
            <h2 className="text-2xl md:text-3xl font-header font-black text-white uppercase tracking-tighter mb-4">
              ¿Hablamos?
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">
              Cuéntanos sobre tu proyecto y te responderemos a la brevedad.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a
                href={`mailto:${CISZU_NETWORK.email}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(35,63,146,0.3)]"
              >
                Enviar Correo <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${CISZU_NETWORK.phone.replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/10 hover:scale-105 transition-all text-sm uppercase tracking-widest"
              >
                WhatsApp <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
