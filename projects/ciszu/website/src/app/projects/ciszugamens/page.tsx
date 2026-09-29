import Link from "next/link";
import { CISZU_NETWORK, CISZUBOT_LINKS, CISZUGAMENS, WIDGETS } from "@/config/site";
import { ArrowRight, CalendarDays, ExternalLink, Gamepad2, Shield, Swords, Users } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import WidgetCode from "./WidgetCode";
import { getServerI18n } from "@/lib/i18n-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUGAMENS',
  description: 'Ciszugamens: el servidor de la comunidad de Ciszu Network en Discord, WhatsApp y Telegram. Torneos, salas multijuego y comunidad hispanohablante.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const inviteSnippet = [
  {
    label: 'Invitación oficial · nunca expira',
    code: CISZUGAMENS.inviteUrl,
  },
];

const channels = [
  {
    name: "Discord",
    href: CISZUGAMENS.inviteUrl,
    desc: "El servidor principal: torneos, salas de voz multijuego, soporte por tickets y la comunidad en vivo.",
    color: "#5865F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/${CISZU_NETWORK.phone.replace(/\D/g, '')}`,
    desc: "El canal directo de la comunidad: anuncios, ayuda rápida y contacto con el equipo.",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/CiszukoNetwork",
    desc: "Canal de Telegram: novedades, bots y una comunidad activa al instante.",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

const features = [
  { icon: Swords, title: "Torneos", desc: "Torneos de la comunidad con formato de rondas: Ronda 1, Ronda 2, Semifinal y Final, con tabla de puntuación oficial y plantilla de hasta 16 participantes." },
  { icon: Gamepad2, title: "Multijuego", desc: "Salas de voz dedicadas a Roblox, Minecraft, Fortnite, Left 4 Dead 2 y otros juegos, además de canales de música para acompañar la partida." },
  { icon: Users, title: "Comunidad", desc: "Comunidad gaming hispanohablante (14+), competitiva y casual, con canales de texto, voz, eventos y soporte por tickets." },
];

const modalities = ["Roblox", "Minecraft", "Fortnite", "Left 4 Dead 2", "Otros juegos", "Música y charlas"];

const tournamentRounds = ["Ronda 1", "Ronda 2", "Semifinal", "Final"];

const rules = [
  "Respeto entre usuarios: nada de toxicidad, odio, contenido +18 ni acoso en texto o voz.",
  "Sin spam ni exceso de menciones: cada canal tiene su función y las actividades van en los canales permitidos.",
  "Prohibida la suplantación de identidad y las polémicas (política, creencias, dramas).",
  "Se aplican los Términos y Normas de Discord, además de las normativas internas del servidor.",
  "Las sanciones quedan a juicio del Staff presente; dudas, sugerencias y reportes se atienden por tickets.",
];

const communityLinks = [
  { name: 'Top.gg · Servidor', href: CISZUBOT_LINKS.topggServer },
  { name: 'Top.gg · Bot CiszuBot', href: CISZUBOT_LINKS.topggBot },
  { name: 'Disboard', href: CISZUBOT_LINKS.disboardServer },
  { name: 'Discord Bot List', href: CISZUBOT_LINKS.discordBotListServer },
];

const stack = ['Discord', 'WhatsApp', 'Telegram', 'Top.gg', 'Disboard', 'Discord Bot List'];

const widgetSnippets = [
  {
    label: 'Discord · Servidor en vivo',
    code: `<iframe src="${CISZUGAMENS.widgetUrl}" width="350" height="500" title="Ciszugamens en Discord"></iframe>`,
  },
  {
    label: 'Top.gg · Bot CiszuBot',
    code: `<iframe src="${WIDGETS.topggBot}" width="300" height="300" title="CiszuBot en Top.gg"></iframe>`,
  },
  {
    label: 'Top.gg · Servidor Ciszugamens',
    code: `<iframe src="${WIDGETS.topggServer}" width="500" height="236" title="Ciszugamens en Top.gg"></iframe>`,
  },
];

export default async function CiszugamensPage() {
  const { t } = await getServerI18n();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="gamepad"
          title="Ciszugamens"
          subtitle="Servidor de la Comunidad · Discord · WhatsApp · Telegram"
          kicker="Proyecto"
          theme={THEME}
        />

        <div className="space-y-8">
          <div className="p-8 md:p-12 rounded-[2rem] bg-brand/5 border border-brand/20">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5865F2]/15 border border-[#5865F2]/40 text-[10px] font-bold uppercase tracking-widest text-[#8ea1e1]">
                Invitación oficial · nunca expira
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-header font-bold text-white">✩₊ CiszuGamens ⊹✦</h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Servidor de Discord de la comunidad gaming de {CISZU_NETWORK.name}: torneos por rondas,
                salas de voz multijuego y una comunidad hispanohablante activa. El enlace oficial es
                permanente: úsalo para invitar, compartir y promocionar el servidor.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a href={CISZUGAMENS.inviteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#5865F2] text-white font-bold text-sm hover:bg-[#4752C4] transition-all hover:-translate-y-0.5">
                  Unirse al servidor <ArrowRight className="w-4 h-4" />
                </a>
                <a href={CISZUBOT_LINKS.topggServer} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold hover:border-[#a855f7]/60 hover:text-[#c084fc] transition-all">
                  Votar en Top.gg <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <WidgetCode snippets={inviteSnippet} />
            </div>
            <div className="mt-8">
              <iframe
                title="Widget en vivo del servidor de Discord CiszuGamens"
                src={CISZUGAMENS.widgetUrl}
                width={350}
                height={500}
                loading="lazy"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                className="block mx-auto rounded-2xl border-0 bg-[#2b2d31]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <f.icon className="w-8 h-8 text-[#a855f7] mb-4" />
                <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="w-6 h-6 text-neon-cyan" />
                <h2 className="text-xl font-header font-bold text-white">Dentro del servidor</h2>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Salas y modalidades</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {modalities.map((m) => (
                  <span key={m} className="px-3 py-1.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#67e8f9] text-[10px] font-bold uppercase tracking-wider">
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="w-5 h-5 text-[#a855f7]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Torneos y eventos</h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                Torneos de la comunidad con tabla oficial de puntuación por rondas y eliminación directa
                (plantilla de hasta 16 participantes):
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {tournamentRounds.map((r, i) => (
                  <span key={r} className="inline-flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#c084fc] text-[10px] font-bold uppercase tracking-wider">
                      {r}
                    </span>
                    {i < tournamentRounds.length - 1 && <ArrowRight className="w-3 h-3 text-white/30" />}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-brand-light" />
                <h2 className="text-xl font-header font-bold text-white">Reglas de la comunidad</h2>
              </div>
              <ul className="space-y-3">
                {rules.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-brand/10 border border-brand/30 text-brand-light text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[10px] text-gray-500 leading-relaxed">
                Normativas completas disponibles dentro del servidor y en los documentos oficiales
                (reglas v4.2.0.0 + directrices de staff).
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">{t.projectPages.ciszugamens.join}</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Ciszugamens es el servidor de la comunidad de {CISZU_NETWORK.name}: el mismo espacio
              en Discord, WhatsApp y Telegram. Elige tu plataforma favorita y forma parte de la
              familia gamer y digital del ecosistema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {channels.map((c, i) => (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-3" style={{ color: c.color }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${c.color}22`, border: `1px solid ${c.color}44` }}>
                      {c.icon}
                    </div>
                    <h3 className="text-white font-bold font-header text-sm">{c.name}</h3>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-widest transition-all group-hover:gap-2" style={{ color: c.color }}>
                    Unirme <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h2 className="text-2xl font-header font-bold text-white mb-6">{t.projectPages.ciszugamens.where}</h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {communityLinks.map((l) => (
                <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold hover:border-[#a855f7]/60 hover:text-[#c084fc] transition-all">
                  {l.name} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
            <h3 className="text-sm font-header font-bold text-white mb-3">{t.projectPages.ciszugamens.communityStack}</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {stack.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                  {s}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-header font-bold text-white mb-2">Widgets para tu web</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Copia y pega estos snippets para mostrar el servidor y sus listados en cualquier web.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
              <WidgetCode snippets={widgetSnippets} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <iframe
                  title="Widget de Top.gg del bot CiszuBot"
                  src={WIDGETS.topggBot}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="rounded-2xl border-0 mx-auto"
                />
                <iframe
                  title="Widget de Top.gg del servidor Ciszugamens"
                  src={WIDGETS.topggServer}
                  width={500}
                  height={236}
                  loading="lazy"
                  className="rounded-2xl border-0 mx-auto w-full max-w-[500px]"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
              {t.projectPages.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
