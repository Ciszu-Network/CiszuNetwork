"use client";

import { Heart } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";

const DONATION_LINKS = {
  patreon: "https://www.patreon.com/cw/ciszukoantony",
  koFi: "https://ko-fi.com/ciszukoantony",
  buyMeACoffee: "https://buymeacoffee.com/ciszukoantony",
};

/* Logos SVG oficiales de cada servicio */
function KoFiLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Ko-fi">
      <path d="M32.5 9C24 9 16.5 15 16.5 22.5c0 2.5 1 4.8 2.7 6.7l6.3 7.2 6.3-7.2c1.7-1.9 2.7-4.2 2.7-6.7C34.5 15 32 9 32.5 9z" fill="#FF5E5B"/>
      <path d="M24 42c0-3.5 3-6 7-6s7 2.5 7 6c0 4-7 7-7 7s-7-3-7-7z" fill="#FFB02E"/>
    </svg>
  );
}

function BuyMeACoffeeLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Buy Me a Coffee">
      <rect x="4" y="14" width="40" height="22" rx="5" fill="#FFDD00"/>
      <path d="M12 18h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z" fill="#000"/>
      <path d="M30 18h6a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z" fill="#fff"/>
      <path d="M24 34l-2 6 4-2 4 2-2-6" fill="#7A5C00"/>
    </svg>
  );
}

function PatreonLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Patreon">
      <path d="M15 0a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM4 22h3v-3H4v3z"/>
    </svg>
  );
}

function NowPaymentsLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="NOWPayments">
      <circle cx="12" cy="12" r="10" fill="#6B21A8"/>
      <path d="M12 6a4 4 0 1 1 0 8 3 3 0 1 0 0 6" stroke="#fff" strokeWidth="1.6" fill="none"/>
      <circle cx="12" cy="14" r="1.2" fill="#fff"/>
    </svg>
  );
}

const LEGACY = [
  { label: "Ko-fi", href: DONATION_LINKS.koFi, note: "Café directo · sin comisiones", color: "#FF5E5B", logo: <KoFiLogo /> },
  { label: "Buy Me a Coffee", href: DONATION_LINKS.buyMeACoffee, note: "Apoyo directo al creador", color: "#FFDD00", logo: <BuyMeACoffeeLogo /> },
  { label: "Patreon", href: DONATION_LINKS.patreon, note: "Suscripción mensual con recompensas", color: "#FF424D", logo: <PatreonLogo /> },
  { label: "Cripto (NOWPayments)", href: "https://nowpayments.io/donation/ciszunetwork", note: "Bitcoin, USDT, ETH y más · sin KYC", color: "#6B21A8", logo: <NowPaymentsLogo /> },
];

export default function DonatePage() {
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
            Apoya el ecosistema de CiszuBot
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
            Tus donaciones ayudan a mantener las webs, el bot de Discord, MuzicMania y la
            comunidad CiszuGamens funcionando. Cualquier aporte, por pequeño que sea, se
            agradece de corazón.
          </p>
        </div>

        {/* Servicios oficiales (logos reales de cada marca) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {LEGACY.map((m, i) => (
            <a key={i} href={m.href || "#"} target={m.href ? "_blank" : undefined} rel={m.href ? "noopener noreferrer" : undefined}
              className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `${m.color}22`, color: m.color }}>
                {m.logo}
              </div>
              <p className="text-white font-bold font-header text-sm mb-1">{m.label}</p>
              <p className="text-gray-400 text-xs mb-3">{m.note}</p>
              <span className="inline-flex items-center gap-1 text-brand-light text-xs font-semibold">
                {m.href ? "Abrir" : "Próximamente"}
              </span>
            </a>
          ))}
        </div>

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
            src="https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb"
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
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">
              ciszunetwork@gmail.com
            </a>
          </p>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}