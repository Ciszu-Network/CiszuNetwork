import Link from "next/link";
import Script from "next/script";
import { DONATION_LINKS, WIDGETS } from "@/config/site";
import { getDonationMethods } from "@ciszunetwork/payments";
import { Heart, Coffee, HandCoins, Gift, ExternalLink, Bitcoin, Copy, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | DONAR',
  description: 'Apoya a Ciszu Network con una donación. Ko-fi, Buy Me a Coffee, Patreon, PayPal y cripto (NOWPayments).',
};

const LEGACY = [
  {
    icon: Coffee,
    label: "Ko-fi",
    href: DONATION_LINKS.koFi,
    note: "Café directo · sin comisiones por donar",
    color: "#FF5E5B",
    keywords: ['ko-fi', 'kofi', 'cafe'],
  },
  {
    icon: HandCoins,
    label: "Buy Me a Coffee",
    href: DONATION_LINKS.buyMeACoffee,
    note: "Apoyo directo al creador",
    color: "#FFDD00",
    keywords: ['buymeacoffee', 'cafe', 'bmac'],
  },
  {
    icon: Gift,
    label: "Patreon",
    href: DONATION_LINKS.patreon,
    note: "Suscripción mensual con recompensas",
    color: "#FF424D",
    keywords: ['patreon', 'suscripcion', 'miembro'],
  },
  {
    icon: Bitcoin,
    label: "Cripto (NOWPayments)",
    href: "https://nowpayments.io/donation/ciszunetwork",
    note: "Bitcoin, USDT, ETH y más · sin KYC",
    color: "#6B21A8",
    keywords: ['cripto', 'crypto', 'btc', 'usdt', 'eth', 'bitcoin', 'nowpayments'],
  },
];

export default function DonatePage() {
  const methods = getDonationMethods();
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Donar
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Apoya el ecosistema de Ciszu Network
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
            Tus donaciones ayudan a mantener las webs, el bot de Discord, MuzicMania y la
            comunidad CiszuGamens funcionando. Cualquier aporte, por pequeño que sea, se
            agradece de corazón.
          </p>
        </div>

        {/* Servicios oficiales (legacy / widgets reales) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {LEGACY.map((m, i) => (
            <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `${m.color}22`, color: m.color }}>
                <m.icon className="w-6 h-6" />
              </div>
              <p className="text-white font-bold font-header text-sm mb-1">{m.label}</p>
              <p className="text-gray-400 text-xs mb-3">{m.note}</p>
              <span className="inline-flex items-center gap-1 text-brand-light text-xs font-semibold">
                Abrir <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>

        {/* Métodos dinámicos (crypto / paypal del vault) */}
        {methods.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-header font-black text-white uppercase tracking-tight mb-6 text-center">
              Otros métodos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {methods.map((m) => (
                <MethodCard key={m.id} method={m} />
              ))}
            </div>
          </div>
        )}

        {/* Widget Ko-fi real */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4 mb-12">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Ko-fi embebido</h3>
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/ciszukoantony/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{ border: "none", width: "100%", padding: 4, background: "#f9f9f9" }}
            height="712"
            title="Apoya a CiszukoAntony en Ko-fi"
          />
        </div>

        {/* Widget NOWPayments real */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Cripto (NOWPayments)</h3>
          <iframe
            src={`https://nowpayments.io/embeds/donation-widget?api_key=${process.env.NOWPAYMENTS_PUBLIC_KEY ?? "739f2096-6c64-40d6-a2a1-635784185dfb"}`}
            width="100%"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", border: "none" }}
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            ¿Prefieres apoyar de otra forma? Escríbenos a{" "}
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">ciszunetwork@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function MethodCard({ method }: { method: { id: string; label: string; url?: string; address?: string; network?: string } }) {
  const url = method.url || (method.address ? `https://nowpayments.io/donation/ciszunetwork` : undefined);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="group p-4 rounded-xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all flex items-center justify-between"
    >
      <div>
        <p className="text-white font-bold font-header text-sm">{method.label}</p>
        {method.network && <p className="text-gray-400 text-xs">{method.network}</p>}
        {method.address && <p className="text-gray-500 text-[10px] font-mono break-all mt-1">{method.address}</p>}
      </div>
      <ExternalLink className="w-4 h-4 text-brand-light shrink-0 group-hover:scale-110 transition-transform" />
    </a>
  );
}