"use client";

import { Heart } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import { Icon, KoFiOverlay } from '@ciszu/ui';

const DONATION_LINKS = {
  patreon: "https://www.patreon.com/cw/ciszukoantony",
  koFi: "https://ko-fi.com/ciszukoantony",
  buyMeACoffee: "https://buymeacoffee.com/ciszukoantony",
  nowPayments: "https://nowpayments.io/donation/ciszunetwork",
};

/* Logos SVG oficiales de cada servicio, servidos desde el CDN */
function KoFiLogo({ size = 22 }: { size?: number }) {
  return <Icon name="kofi" style="brand" size={size} />;
}

function BuyMeACoffeeLogo({ size = 22 }: { size?: number }) {
  return <Icon name="buymeacoffee" style="brand" size={size} />;
}

function PatreonLogo({ size = 22 }: { size?: number }) {
  return <Icon name="patreon" style="brand" size={size} />;
}

function NowPaymentsLogo({ size = 22 }: { size?: number }) {
  return <Icon name="nowpayments" style="brand" size={size} />;
}

const METHODS = [
  { label: "Ko-fi", href: DONATION_LINKS.koFi, note: "Café directo · sin comisiones", color: "#FF5E5B", logo: <KoFiLogo /> },
  { label: "Buy Me a Coffee", href: DONATION_LINKS.buyMeACoffee, note: "Apoyo directo al creador", color: "#FFDD00", logo: <BuyMeACoffeeLogo /> },
  { label: "Patreon", href: DONATION_LINKS.patreon, note: "Suscripción mensual con recompensas", color: "#FF424D", logo: <PatreonLogo /> },
  { label: "Cripto (NOWPayments)", href: DONATION_LINKS.nowPayments, note: "Bitcoin, USDT, ETH y más · sin KYC", color: "#6B21A8", logo: <NowPaymentsLogo /> },
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
            Apoya el ecosistema de Ciszuko Antony
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
            Tus donaciones ayudan a mantener las webs, el bot de Discord, MuzicMania y la
            comunidad CiszuGamens funcionando. Cualquier aporte, por pequeño que sea, se
            agradece de corazón.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {METHODS.map((m, i) => (
            <a key={i} href={m.href} target="_blank" rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `${m.color}22`, color: m.color }}>
                {m.logo}
              </div>
              <p className="text-white font-bold font-header text-sm mb-1">{m.label}</p>
              <p className="text-gray-400 text-xs mb-3">{m.note}</p>
              <span className="inline-flex items-center gap-1 text-brand-light text-xs font-semibold">
                Abrir
              </span>
            </a>
          ))}
        </div>

        {/* Ko-fi embed oficial */}
        <KoFiOverlay handle="ciszukoantony" buttonText="Support Ciszuko Antony" buttonColor="#FF5E5B" textColor="#fff" />
        <div className="mb-12">
          <iframe
            src="https://ko-fi.com/ciszukoantony/?hidefeed=true&widget=true&embed=true&preview=true"
            title="Apoya a Ciszuko Antony en Ko-fi"
            className="w-full rounded-2xl border border-white/10 bg-white/5"
            style={{ height: 712 }}
            allow="payment"
          />
        </div>

        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Cripto (NOWPayments)</h3>
          <iframe
            src="https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb"
            width="100%"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", border: "none" }}
            title="Donaciones en cripto (NOWPayments)"
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
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
