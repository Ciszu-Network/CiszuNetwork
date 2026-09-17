"use client";

import { DONATION_LINKS } from "@/config/site";
import { useToast } from "@ciszu/ui";
import { ExternalLink } from "lucide-react";
import { Icon } from '@ciszu/ui';

/* ── Logos SVG oficiales de cada servicio ─────────────────────────────── */

function KoFiLogo({ size = 22 }: { size?: number }) {
  // Logo oficial de la marca, servido desde el CDN (shared/icons/svg/brands).
  return <Icon name="kofi" style="brand" size={size} />;
}

function BuyMeACoffeeLogo({ size = 22 }: { size?: number }) {
  // Logo oficial de la marca, servido desde el CDN (shared/icons/svg/brands).
  return <Icon name="buymeacoffee" style="brand" size={size} />;
}

function PatreonLogo({ size = 22 }: { size?: number }) {
  // Logo oficial de la marca, servido desde el CDN (shared/icons/svg/brands).
  return <Icon name="patreon" style="brand" size={size} />;
}

function PayPalLogo({ size = 22 }: { size?: number }) {
  // Logo oficial de la marca, servido desde el CDN (shared/icons/svg/brands).
  return <Icon name="paypal" style="brand" size={size} />;
}

function NowPaymentsLogo({ size = 22 }: { size?: number }) {
  // Logo oficial de la marca, servido desde el CDN (shared/icons/svg/brands).
  return <Icon name="nowpayments" style="brand" size={size} />;
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