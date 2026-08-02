import Image from "next/image";
import { resolveAssetPath } from "@ciszunetwork/cdn";
import { COMMANDS, CATEGORIES } from "@/data/commands";

export const revalidate = 60;

const INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands";

interface BotStatus {
  online: boolean;
  last_seen: string | null;
  started_at: string | null;
  version: string | null;
  guilds: number;
  commands_total: number;
  prefix: string;
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string; shadow: string }> = {
  Diversión: { color: "text-neon-pink", bg: "bg-neon-pink/10", shadow: "hover:shadow-[0_0_20px_rgba(255,51,204,0.4)]" },
  Información: { color: "text-neon-blue", bg: "bg-neon-blue/10", shadow: "hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]" },
  Social: { color: "text-neon-green", bg: "bg-neon-green/10", shadow: "hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]" },
  Utilidad: { color: "text-neon-purple", bg: "bg-neon-purple/10", shadow: "hover:shadow-[0_0_20px_rgba(128,0,255,0.4)]" },
};

const ECOSYSTEM = [
  {
    name: "Ciszu Network",
    desc: "El hub central de la marca: ecosistema digital, redes y proyectos.",
    href: "https://ciszunetwork.vercel.app",
    color: "hover:border-neon-blue hover:shadow-[0_0_25px_rgba(0,212,255,0.35)]",
  },
  {
    name: "Ciszuko Antony",
    desc: "Portfolio personal: logos, medios y música del creador.",
    href: "https://ciszukoantony.vercel.app",
    color: "hover:border-neon-pink hover:shadow-[0_0_25px_rgba(255,51,204,0.35)]",
  },
  {
    name: "MuzicMania",
    desc: "El juego de ritmo definitivo en la web con estética futurista.",
    href: "https://muzicmania.vercel.app",
    color: "hover:border-neon-green hover:shadow-[0_0_25px_rgba(0,255,136,0.35)]",
  },
];

async function getBotStatus(): Promise<BotStatus | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://obwzzmbvkrcscqwptlqo.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const res = await fetch(
      `${url}/rest/v1/bot_status?select=online,last_seen,started_at,version,guilds,commands_total,prefix&id=eq.1`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Accept-Profile": "ciszubot" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as BotStatus[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function formatUptime(startedAt: string | null, now: number): string {
  if (!startedAt) return "—";
  const diff = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default async function Home() {
  const status = await getBotStatus();
  const now = Date.now();
  const lastSeenMs = status?.last_seen ? Date.parse(status.last_seen) : 0;
  const heartbeatFresh = now - lastSeenMs < 3 * 60 * 1000;
  const isOnline = Boolean(status?.online) && heartbeatFresh;

  return (
    <div className="bg-black">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Neon blobs de fondo */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-neon-blue/20 blur-[120px] animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 rounded-full bg-neon-purple/20 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-neon-pink/15 blur-[120px] animate-blob animation-delay-4000" />

        <div className="relative max-w-screen-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 mb-8 animate-fade-in-up">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-neon-green animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.8)]" : "bg-neon-red"}`} />
            <span className="text-xs font-header font-bold tracking-widest uppercase text-white/80">
              {isOnline ? "En línea" : "Desconectado"} {status?.version ? `· ${status.version}` : ""}
            </span>
          </div>

          <Image
            src={resolveAssetPath("apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png")}
            alt="CiszuBot isotipo"
            width={160}
            height={160}
            priority
            className="mx-auto mb-8 drop-shadow-neon-blue animate-float"
          />

          <h1 className="text-5xl md:text-7xl font-header font-black tracking-tight mb-6 text-shadow-neon-blue">
            CISZUBOT
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/80 mb-10 font-header font-bold">
            El bot de Discord de{" "}
            <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] transition-all">
              Ciszu Network
            </a>
            : comandos divertidos, de información y utilidad, en español.
            Con prefijo <code className="text-neon-blue bg-white/5 px-2 py-0.5 rounded border border-white/10">cz!</code>{" "}
            y slash commands <code className="text-neon-pink bg-white/5 px-2 py-0.5 rounded border border-white/10">/comandos</code>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl font-header font-black uppercase tracking-widest text-sm bg-electric-blue text-white active-depth hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]"
            >
              Invitar a Discord
            </a>
            <a
              href="https://github.com/Ciszu-Network/CiszuNetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl font-header font-black uppercase tracking-widest text-sm border border-white/20 text-white hover:border-neon-blue hover:text-neon-blue hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all active:scale-95"
            >
              GitHub
            </a>
          </div>

          {/* Stats dinámicas reales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: "🖥️", label: "Servidores", value: status ? String(status.guilds) : "—", glow: "hover-glow-blue" },
              { icon: "⚡", label: "Comandos ejecutados", value: status ? status.commands_total.toLocaleString("es") : "—", glow: "hover-glow-pink" },
              { icon: "⏱️", label: "Uptime", value: formatUptime(status?.started_at ?? null, now), glow: "hover-glow-green" },
              { icon: "🎯", label: "Comandos", value: `${COMMANDS.length}`, glow: "hover-glow-purple" },
            ].map((s) => (
              <div key={s.label} className={`glass rounded-2xl p-5 border border-white/10 hover-lift ${s.glow}`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-header font-black text-white">{s.value}</div>
                <div className="text-xs text-white/60 font-header font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMANDOS ═══ */}
      <section id="comandos" className="relative py-24">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-neon-blue/10 blur-[100px]" />
        <div className="relative max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-neon-cyan font-header font-black uppercase tracking-[0.3em] text-xs mb-3 text-shadow-neon-cyan">12 comandos · 4 categorías</p>
            <h2 className="text-4xl md:text-5xl font-header font-black text-shadow-neon-blue">COMANDOS</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70 font-header font-bold">
              Usa <code className="text-neon-blue bg-white/5 px-2 py-0.5 rounded border border-white/10">cz!comando</code> en el chat
              o <code className="text-neon-pink bg-white/5 px-2 py-0.5 rounded border border-white/10">/comando</code> con la barra de Discord.
            </p>
          </div>

          {CATEGORIES.map((category) => {
            const cmds = COMMANDS.filter((c) => c.category === category);
            const style = CATEGORY_STYLES[category];
            return (
              <div key={category} className="mb-10">
                <h3 className={`font-header font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3 ${style.color}`}>
                  <span className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center text-base`}>
                    {category === "Diversión" ? "🎮" : category === "Información" ? "📊" : category === "Social" ? "💬" : "🛠️"}
                  </span>
                  {category}
                  <span className="w-px h-4 bg-white/20" />
                  <span className="text-white/40 text-xs">{cmds.length}</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cmds.map((cmd) => (
                    <div
                      key={cmd.name}
                      className={`glass rounded-2xl p-5 border border-white/10 hover-lift ${style.shadow}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-sm font-bold text-neon-blue bg-neon-blue/10 px-2.5 py-1 rounded-lg border border-neon-blue/30">
                          {status?.prefix ?? "cz!"}{cmd.name}
                        </code>
                        <span className="text-xl">{cmd.emoji}</span>
                      </div>
                      <p className="text-sm text-white/75 mb-3">{cmd.description}</p>
                      <p className="text-xs text-white/50 font-header font-bold">
                        Uso: <code className="text-white/80 bg-white/5 px-1.5 py-0.5 rounded">{cmd.usage}</code>
                      </p>
                      {cmd.aliases.length > 0 && (
                        <p className="text-xs text-white/40 mt-2">
                          Aliases: {cmd.aliases.slice(0, 4).map((a) => (
                            <code key={a} className="bg-white/5 px-1 py-0.5 rounded mr-1">{a}</code>
                          ))}
                          {cmd.aliases.length > 4 && <span className="text-white/30">+{cmd.aliases.length - 4}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ ESTADO DINÁMICO ═══ */}
      <section id="estado" className="relative py-24 bg-[#02030a] border-y border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-header font-black text-shadow-neon-blue mb-12">ESTADO EN VIVO</h2>
          <div className="glass rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto hover-glow-blue">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className={`w-4 h-4 rounded-full ${isOnline ? "bg-neon-green animate-pulse shadow-[0_0_15px_rgba(0,255,136,0.9)]" : "bg-neon-red shadow-[0_0_15px_rgba(255,0,0,0.9)]"}`} />
              <span className="font-header font-black uppercase tracking-widest text-xl text-shadow-neon-green">
                {isOnline ? "Bot en línea" : "Bot offline"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "Servidores", value: status ? String(status.guilds) : "—" },
                { label: "Comandos", value: status ? status.commands_total.toLocaleString("es") : "—" },
                { label: "Uptime", value: formatUptime(status?.started_at ?? null, now) },
                { label: "Versión", value: status?.version ?? "—" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-header font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-white/50 font-header font-bold uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/40">
              {status?.last_seen
                ? `Última actualización: ${new Date(status.last_seen).toLocaleString("es")} · El bot envía heartbeat cada 60s y la web refresca cada 60s`
                : "El bot no ha reportado estado aún. Si acaba de arrancar, espera un momento."}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ ECOSISTEMA ═══ */}
      <section id="ecosistema" className="relative py-24">
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-neon-purple/10 blur-[100px]" />
        <div className="relative max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-header font-black text-shadow-neon-purple">ECOSISTEMA</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70 font-header font-bold">
              CiszuBot es parte de Ciszu Network. Descubre todo el ecosistema.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {ECOSYSTEM.map((eco) => (
              <a
                key={eco.name}
                href={eco.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`glass rounded-2xl p-7 border border-white/10 hover-lift ${eco.color} text-left group`}
              >
                <h3 className="font-header font-black text-2xl mb-2 group-hover:text-neon-cyan transition-colors">{eco.name}</h3>
                <p className="text-sm text-white/70">{eco.desc}</p>
                <span className="inline-flex items-center gap-2 mt-5 text-xs font-header font-black uppercase tracking-widest text-neon-cyan">
                  Visitar
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative py-20 text-center border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent" />
        <div className="relative max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-header font-black text-shadow-neon-blue mb-4">¿LISTO PARA PROBARLO?</h2>
          <p className="mx-auto mb-8 max-w-lg text-white/70 font-header font-bold">
            Invita a CiszuBot a tu servidor en menos de un minuto. Gratis, rápido y con estilo.
          </p>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 rounded-xl font-header font-black uppercase tracking-widest text-sm bg-electric-pink text-white active-depth hover:shadow-[0_0_30px_rgba(255,51,204,0.6)]"
          >
            Invitar ahora
          </a>
        </div>
      </section>
    </div>
  );
}
