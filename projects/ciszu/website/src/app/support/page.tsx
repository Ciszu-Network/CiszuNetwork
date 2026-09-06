import Link from "next/link";
import Script from "next/script";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SOCIAL_COLORS } from "@/config/site";
import { LifeBuoy, Mail, MessageCircle, ArrowRight, ExternalLink, Heart, Star } from "lucide-react";
import { getDonationMethods } from "@ciszunetwork/payments";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | SUPPORT',
  description: 'Soporte de Ciszu Network: canales de ayuda, donaciones y canales oficiales.',
};

const supportChannels = [
  { icon: Mail, label: "Email", value: CISZU_NETWORK.email, href: `mailto:${CISZU_NETWORK.email}`, color: "from-brand to-brand-light" },
  { icon: MessageCircle, label: "Discord", value: "Invitación al Servidor", href: CISZU_NETWORK.social.discord, color: "from-[#5865F2] to-[#4752C4]" },
  { icon: ExternalLink, label: "GitHub Issues", value: "Reportar Problemas", href: CISZU_NETWORK.social.github, color: "from-gray-600 to-gray-800" },
];

const GOOGLE_BUSINESS = {
  reviewsUrl: "https://g.page/r/CTGLyn7UrVHPEAE/review",
  link: "https://share.google/i2XMvOrh6y3ap0sBq",
  id: "12451554180623658502",
  storeCode: "15916715880116624592",
  connection: "om-4449155801906919160",
  address: "98J5+WQ Coro, Falcón",
};

export default function SupportPage() {
  const methods = getDonationMethods();
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/5 to-transparent border border-brand/30 text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-header font-bold text-white mb-2">Apoyar el proyecto</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Si Ciszu Network te ha sido útil, puedes apoyar el desarrollo con una donación
            en criptomonedas. El proyecto es independiente y crece con tu respaldo.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href={process.env.NOWPAYMENTS_DONATE_URL ?? "https://nowpayments.io/donation/ciszunetwork"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              <Heart className="w-4 h-4" /> Donar con cripto
            </a>
            <a
              href={process.env.NOWPAYMENTS_POS_URL ?? "https://nowpayments.io/pos-terminal/ciszunetwork"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-pink-400/40 text-white rounded-xl font-bold text-sm transition-all"
            >
              Terminal de pago <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {methods.filter((m) => m.enabled).length > 0 && (
            <div className="mt-8">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
                Donación directa (red blockchain)
              </p>
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                {methods.filter((m) => m.enabled).map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-left">
                    <span className="text-gray-300 text-xs font-medium">
                      {m.label} {m.network ? `· ${m.network}` : ""}
                    </span>
                    <a
                      href={`https://etherscan.io/address/${m.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-light text-xs font-mono truncate max-w-[16rem] hover:underline"
                      title={m.address}
                    >
                      {m.address} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#04da8d]/10 via-transparent to-transparent border border-[#04da8d]/25 text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#04da8d] to-emerald-700 mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-header font-bold text-white mb-2">Reseñas</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            ¿Usas Ciszu Network o alguno de nuestros productos? Deja tu reseña en Trustpilot o Google
            y ayúdanos a crecer con confianza.
          </p>
          <Script
            src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
            strategy="lazyOnload"
          />
          <div
            className="trustpilot-widget"
            data-locale="en-US"
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="6a7be8beb27b048803166c8f"
            data-style-height="52px"
            data-style-width="100%"
            data-token="62a9715c-b305-4cb7-a9cf-629a5cc67f63"
          >
            <a href="https://www.trustpilot.com/review/ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer">
              Trustpilot
            </a>
          </div>
          <a
            href={GOOGLE_BUSINESS.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-6 px-8 py-3.5 rounded-xl bg-white text-black font-header font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-95"
          >
            <Star className="w-4 h-4 text-[#4285F4]" />
            Opiniones en Google
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Dirección</p>
              <a href={GOOGLE_BUSINESS.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-light hover:underline flex items-center gap-1">
                {GOOGLE_BUSINESS.address} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Código de tienda</p>
              <p className="text-sm text-white font-mono">{GOOGLE_BUSINESS.storeCode}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">ID de negocio</p>
              <p className="text-sm text-white font-mono">{GOOGLE_BUSINESS.id}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Conexión</p>
              <p className="text-sm text-white font-mono">{GOOGLE_BUSINESS.connection}</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/5 to-transparent border border-brand/30 text-center">
          <h2 className="text-2xl font-header font-bold text-white mb-4">Canales Oficiales</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Síguenos en nuestras redes para estar al día con novedades, actualizaciones y soporte comunitario.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand/30 transition-all text-sm font-medium text-white"
                style={{ borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}40` }}
              >
                <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={16} />
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
            Formulario de Contacto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
