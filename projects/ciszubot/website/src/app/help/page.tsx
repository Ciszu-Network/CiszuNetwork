import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  InfoHero,
  InfoLinkGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoStepGroup,
} from '@ciszu/ui';
import { getDict, parseLang, DISCORD_SERVER, BOT_PREFIX } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | HELP',
  description:
    'Centro de ayuda de CiszuBot: primeros pasos, comandos, permisos, privacidad y solución de problemas.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

const COPY = {
  faq: 'Preguntas frecuentes',
  troubleshooting: 'Solución de problemas',
};

const CATEGORIES: InfoLinkGroup[] = [
  {
    title: 'Empezar',
    items: [
      { name: 'Primeros pasos', href: '/documentation', icon: 'rocket', desc: 'Invitación, permisos y configuración inicial' },
      { name: 'Comandos', href: '/commands', icon: 'gamepad', desc: 'Lista completa de comandos y alias' },
      { name: 'Descargas', href: '/downloads', icon: 'download', desc: 'App de escritorio y recursos' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Preguntas frecuentes', href: '/faq', icon: 'faq', desc: 'Respuestas rápidas a las dudas más comunes' },
      { name: 'Abrir una incidencia', href: '/support', icon: 'support', desc: 'Reporta un fallo con seguimiento' },
      { name: 'Contacto directo', href: '/contact', icon: 'mail', desc: 'Correo y canales oficiales' },
    ],
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Comprueba que el bot está en línea',
    body: 'Mira el indicador de estado de la portada o la página de Stats. Si aparece desconectado, el problema es global y no de tu servidor.',
  },
  {
    title: 'Revisa los permisos del canal',
    body: 'El bot necesita «Enviar mensajes», «Insertar enlaces» y «Usar comandos de aplicación» en el canal donde lo estás usando.',
  },
  {
    title: 'Prueba con slash commands',
    body: `Si el prefijo ${BOT_PREFIX} no responde, escribe / seguido del nombre del comando: los slash commands esquivan los problemas de prefijo.`,
  },
  {
    title: 'Reporta con datos',
    body: 'Si sigue fallando, abre una incidencia con el ID del servidor, el comando usado y la hora. Con eso se reproduce el error mucho más rápido.',
  },
];

export default async function HelpPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);

  return (
    <div className="bg-bg min-h-screen py-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero icon="help" title={t.helpPage.title} subtitle={t.helpPage.subtitle} theme={THEME} />

        <div className="space-y-14">
          <InfoLinkGrid groups={CATEGORIES} theme={THEME} />

          <section>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
              {COPY.faq}
            </h2>
            <InfoAccordion items={t.faqPage.items} theme={THEME} />
          </section>

          <InfoSteps title={COPY.troubleshooting} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Abrir incidencia', href: '/support', icon: 'support' },
            { label: 'Servidor de Discord', href: DISCORD_SERVER, icon: 'discord', external: true, variant: 'ghost' },
            { label: 'Documentación', href: '/documentation', icon: 'policies', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
