'use client';

import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';
import { BOT_ID } from '@/lib/botStatus';
import { DISCORD_BOT_LIST_BOT, DISCORD_SERVER, INVITE_URL, TOP_GG_BOT } from '@/lib/i18n';

const USER_INSTALL_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_ID}&scope=applications.commands&integration_type=1`;
const DISBOARD_BOT = `https://disboard.org/bot/${BOT_ID}`;

/**
 * Secciones pre-QuickDocks del dashboard (FUERA de la zona de configuración:
 * el shell las renderiza a ancho completo debajo del sidebar + contenido,
 * igual que la página de documentación). Solo aparecen en /dashboard.
 *
 * Secciones grandes con información real, pasos de uso, autopatrocinio con
 * enlaces reales (perfil, servidor, Top.gg, DBL, Disboard) y colores propios
 * por botón funcional.
 */
export default function PreQuickDocks() {
  const { dict } = useClientI18n();
  const t = dict.dashboardPage;

  return (
    <div className="space-y-10 pb-24">
      {/* Aviso BETA TRIAL FREE */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neon-pink/30 bg-neon-pink/5 px-5 py-3">
        <span className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
          {t.betaBadge}
        </span>
        <p className="min-w-0 flex-1 text-xs text-ink/70">{t.betaNote}</p>
      </div>

      {/* Ayuda y soporte */}
      <section className="rounded-3xl border border-border bg-card p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-blue/40 bg-neon-blue/10">
            <Icon name="life-ring" size={20} className="text-neon-blue" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-header text-xl font-black text-ink">{t.helpTitle}</h2>
            <p className="text-sm text-muted">{t.helpDesc}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={DISCORD_SERVER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/50 bg-[#5865F2]/15 px-5 py-3 text-sm font-bold text-[#8ea1ff] transition hover:scale-[1.02] hover:bg-[#5865F2]/25 active:scale-95"
          >
            <Icon name="discord" size={16} className="[&>g]:fill-current" />
            {t.helpCta}
          </a>
          <Link
            href="/documentation"
            className="inline-flex items-center gap-2 rounded-xl border border-neon-purple/50 bg-neon-purple/10 px-5 py-3 text-sm font-bold text-neon-purple transition hover:scale-[1.02] hover:bg-neon-purple/20 active:scale-95"
          >
            <Icon name="file-text" size={16} />
            {t.docsCta}
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 px-5 py-3 text-sm font-bold text-neon-cyan transition hover:scale-[1.02] hover:bg-neon-cyan/20 active:scale-95"
          >
            <Icon name="help" size={16} />
            {t.faqCta}
          </Link>
        </div>
      </section>

      {/* Cómo usar CiszuBot */}
      <section className="rounded-3xl border border-border bg-card p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-pink/40 bg-neon-pink/10">
            <Icon name="gamepad" size={20} className="text-neon-pink" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-header text-xl font-black text-ink">{t.howToTitle}</h2>
            <p className="text-sm text-muted">{t.howToDesc}</p>
          </div>
        </div>
        <ol className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['howStep1Title', 'howStep1Desc'],
              ['howStep2Title', 'howStep2Desc'],
              ['howStep3Title', 'howStep3Desc'],
              ['howStep4Title', 'howStep4Desc'],
            ] as const
          ).map(([titleKey, descKey], index) => (
            <li key={titleKey} className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-neon-pink/40 bg-neon-pink/10 font-header text-sm font-black text-neon-pink">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="font-header text-sm font-black text-ink">{t[titleKey]}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t[descKey]}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <Link
            href="/commands"
            className="inline-flex items-center gap-2 rounded-xl border border-neon-blue/50 bg-neon-blue/10 px-5 py-3 text-sm font-bold text-neon-blue transition hover:scale-[1.02] hover:bg-neon-blue/20 active:scale-95"
          >
            <Icon name="gamepad" size={16} />
            {t.howToCta}
          </Link>
        </div>
      </section>

      {/* Premium (promo) */}
      <section className="rounded-3xl border border-neon-purple/40 bg-gradient-to-r from-neon-blue/10 via-[#6600ff]/10 to-neon-pink/10 p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-purple/40 bg-neon-purple/10">
            <Icon name="crown" size={20} className="text-neon-purple" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-header text-xl font-black text-ink">{dict.premiumPromo.title}</h2>
            <p className="text-sm text-muted">{dict.premiumPromo.desc}</p>
          </div>
          <span className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
            {dict.premiumPromo.beta}
          </span>
        </div>
        <div className="mt-5">
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="star" size={16} />
            {dict.premiumPromo.cta}
          </Link>
        </div>
      </section>

      {/* Autopatrocinio */}
      <section className="rounded-3xl border border-border bg-card p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-purple/40 bg-neon-purple/10">
            <Icon name="star" size={20} className="text-neon-purple" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-header text-xl font-black text-ink">{t.sponsorTitle}</h2>
            <p className="text-sm text-muted">{t.sponsorDesc}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={USER_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="discord" size={16} className="[&>g]:fill-current" />
            {t.sponsorProfile}
          </a>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="server" size={16} />
            {t.inviteBot}
          </a>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted/70">{t.sponsorDirsLabel}</span>
          <a
            href={TOP_GG_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neon-blue/50 bg-neon-blue/10 px-4 py-2 text-xs font-bold text-neon-blue transition hover:scale-[1.03] hover:bg-neon-blue/20 active:scale-95"
          >
            <Icon name="trophy" size={12} />
            {'Top.gg'}
          </a>
          <a
            href={DISCORD_BOT_LIST_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neon-purple/50 bg-neon-purple/10 px-4 py-2 text-xs font-bold text-neon-purple transition hover:scale-[1.03] hover:bg-neon-purple/20 active:scale-95"
          >
            <Icon name="robot" size={12} />
            DiscordBotList
          </a>
          <a
            href={DISBOARD_BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-2 text-xs font-bold text-neon-cyan transition hover:scale-[1.03] hover:bg-neon-cyan/20 active:scale-95"
          >
            <Icon name="search" size={12} />
            Disboard
          </a>
        </div>
      </section>

      {/* Redes de Ciszu Network */}
      <section className="rounded-3xl border border-border bg-card p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-neon-cyan/10">
            <Icon name="globe" size={20} className="text-neon-cyan" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-header text-xl font-black text-ink">{t.socialTitle}</h2>
            <p className="text-sm text-muted">{t.socialDesc}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://www.youtube.com/@CiszuNetwork"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF0000] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="youtube" size={16} />
            YouTube
          </a>
          <a
            href="https://github.com/Ciszu-Network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#333333] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="github" size={16} />
            GitHub
          </a>
          <a
            href={DISCORD_SERVER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="discord" size={16} className="[&>g]:fill-current" />
            Discord
          </a>
          <a
            href="https://ciszunetwork.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-neon-blue/50 bg-neon-blue/10 px-5 py-3 text-sm font-bold text-neon-blue transition hover:scale-[1.02] hover:bg-neon-blue/20 active:scale-95"
          >
            <Icon name="globe" size={16} />
            {t.socialSite}
          </a>
        </div>
      </section>

      {/* CTA final */}
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card p-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue">
            {dict.footer.prefix} · {dict.nav.dashboard}
          </p>
          <h2 className="mt-1 font-header text-xl font-black text-ink">{t.inviteCta}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">{t.serversSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
          >
            <Icon name="discord" size={16} className="[&>g]:fill-current" />
            {t.inviteCta}
          </a>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-muted transition hover:border-neon-blue/60 hover:text-ink"
          >
            <Icon name="globe" size={16} />
            {dict.nav.explore}
          </Link>
        </div>
      </section>
    </div>
  );
}
