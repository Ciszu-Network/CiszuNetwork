"use client";

import { DONATION_LINKS } from "@/config/site";
import { useToast } from "@ciszu/ui";
import { ExternalLink } from "lucide-react";

/* ── Logos SVG oficiales de cada servicio ─────────────────────────────── */

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

function PayPalLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#00457C" aria-label="PayPal">
      <path d="M7.08 21H3.5l1.1-7h3.6c.5-3 2.4-5 5.4-5 1.2 0 2.2.3 3 .8l-.4 2.6c-.5-.3-1.1-.5-1.8-.5-1.6 0-2.6 1.2-2.9 3.1H8l-.92 6z"/>
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
  { label: "PayPal", href: "", note: "Donación directa (próximamente)", color: "#00457C", logo: <PayPalLogo /> },
  { label: "Cripto (NOWPayments)", href: "https://nowpayments.io/donation/ciszunetwork", note: "Bitcoin, USDT, ETH y más · sin KYC", color: "#6B21A8", logo: <NowPaymentsLogo /> },
];

export interface DonationMethodProp {
  id: string;
  label: string;
  url?: string;
  address?: string;
  network?: string;
}

export default function DonateButtons({ methods }: { methods: DonationMethodProp[] }) {
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent, href?: string) => {
    if (href && href.startsWith("http")) return; // enlace real: navega normal
    e.preventDefault();
    toast(href ? "Este método aún no está configurado" : "Método no disponible todavía", "error");
  };

  return (
    <>
      {/* Servicios oficiales (logos reales de cada marca) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {LEGACY.map((m, i) => (
          <a key={i} href={m.href || "#"} onClick={(e) => handleClick(e, m.href)} target={m.href ? "_blank" : undefined} rel={m.href ? "noopener noreferrer" : undefined}
            className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform"
              style={{ background: `${m.color}22`, color: m.color }}>
              {m.logo}
            </div>
            <p className="text-white font-bold font-header text-sm mb-1">{m.label}</p>
            <p className="text-gray-400 text-xs mb-3">{m.note}</p>
            <span className="inline-flex items-center gap-1 text-brand-light text-xs font-semibold">
              {m.href ? "Abrir" : "Próximamente"} <ExternalLink className="w-3 h-3" />
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
              <MethodCard key={m.id} method={m} onMissing={() => toast(`${m.label}: método no configurado`, "error")} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MethodCard({ method, onMissing }: {
  method: DonationMethodProp;
  onMissing: () => void;
}) {
  const url = method.url && method.url.startsWith("http") ? method.url : (method.address ? `https://nowpayments.io/donation/ciszunetwork` : "");
  const usable = url.startsWith("http");
  return (
    <a href={usable ? url : "#"} target={usable ? "_blank" : undefined} rel={usable ? "noopener noreferrer" : undefined}
      onClick={(e) => { if (!usable) { e.preventDefault(); onMissing(); } }}
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