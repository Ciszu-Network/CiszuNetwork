import Link from "next/link";
import { CISZU_NETWORK, CISZUBOT_LINKS } from "@/config/site";
import { ArrowRight, ExternalLink, Shield, Music, Coins, Settings } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import { getServerI18n } from "@/lib/i18n-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUBOT',
  description: 'CiszuBot: el bot inteligente de Discord del ecosistema. Moderación, música, juegos, economía y automatización.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const features = [
  { icon: Shield, title: "Moderación", desc: "Anti-spam, filtros, roles y herramientas de gestión para tu servidor." },
  { icon: Music, title: "Música", desc: "Reproduce música de calidad directamente en tus canales de voz." },
  { icon: Coins, title: "Economía", desc: "Sistema de monedas, niveles, inventario y tiendas configurables." },
  { icon: Settings, title: "Automatización", desc: "Bienvenidas, tickets, logs y comandos personalizados." },
];

const stack = ['Discord.js', 'TypeScript', 'Node.js', 'Docker', 'Supabase', 'Top.gg'];

const directories = [
  { name: 'Top.gg', href: CISZUBOT_LINKS.topggBot },
  { name: 'Votar en Top.gg', href: CISZUBOT_LINKS.topggBotVote },
  { name: 'Discord Bot List', href: CISZUBOT_LINKS.discordBotListBot },
];

export default async function CiszubotPage() {
  const { t } = await getServerI18n();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="terminal"
          title="CiszuBot"
          subtitle="El bot oficial del ecosistema · Discord"
          kicker="Proyecto"
          theme={THEME}
        />

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Funcionalidades</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              CiszuBot es el bot oficial de {CISZU_NETWORK.name}: un bot todo-en-uno para
              moderar, entretener y automatizar tu servidor de Discord.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <f.icon className="w-8 h-8 text-[#5865F2] mb-4" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h2 className="text-2xl font-header font-bold text-white mb-6">{t.projectPages.stack}</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {stack.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#8b93f8] text-[10px] font-bold uppercase tracking-wider">
                  {s}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-header font-bold text-white mb-3">{t.projectPages.ciszubot.directories}</h3>
            <div className="flex flex-wrap gap-3">
              {directories.map((d) => (
                <a key={d.name} href={d.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold hover:border-[#5865F2]/60 hover:text-[#8b93f8] transition-all">
                  {d.name} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-[#5865F2]/10 to-transparent border border-[#5865F2]/30">
            <h2 className="text-xl font-header font-bold text-white mb-4">{t.projectPages.ciszubot.addTitle}</h2>
            <p className="text-gray-400 text-sm mb-6">{t.projectPages.ciszubot.addDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CISZUBOT_LINKS.invite} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] rounded-xl font-bold text-sm hover:bg-[#5865F2] hover:text-white transition-all">
                {t.projectPages.ciszubot.invite} <ArrowRight className="w-4 h-4" />
              </a>
              <a href={CISZUBOT_LINKS.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                {t.projectPages.ciszubot.officialWeb} <ArrowRight className="w-4 h-4" />
              </a>
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