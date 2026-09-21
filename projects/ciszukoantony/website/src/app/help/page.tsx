'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  InfoHero,
  InfoLinkGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoAccordionItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';

/**
 * Centro de ayuda real (antes era un «Próximamente»).
 *
 * Sigue la misma estructura que el resto de webs del ecosistema: categorías,
 * preguntas frecuentes, solución de problemas paso a paso y salidas de contacto.
 */
const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand to-brand-200',
};

const COPY = {
  faq: 'Preguntas frecuentes',
  troubleshooting: 'Solución de problemas',
};

const CATEGORIES: InfoLinkGroup[] = [
  {
    title: 'Contenido',
    items: [
      { name: 'Certificados', href: '/certificates', icon: 'certificates', desc: 'Catálogo de certificados y cómo verificar cada uno' },
      { name: 'Changelog', href: '/changelog', icon: 'history', desc: 'Qué cambió en cada versión del sitio' },
      { name: 'Stats', href: '/stats', icon: 'signal', desc: 'Métricas y estado de los proyectos' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Preguntas frecuentes', href: '/faq', icon: 'faq', desc: 'Respuestas rápidas a lo más consultado' },
      { name: 'Abrir incidencia', href: '/support', icon: 'support', desc: 'Reporta un fallo con seguimiento' },
      { name: 'Contacto', href: '/contact', icon: 'mail', desc: 'Correo, WhatsApp y redes oficiales' },
    ],
  },
];

const FAQS: InfoAccordionItem[] = [
  {
    q: '¿Cómo verifico un certificado de Ciszuko Antony?',
    a: 'Cada certificado del catálogo muestra su referencia, el emisor y la fecha real extraída del documento. Desde la ficha puedes abrir el original para comprobarlo con la entidad emisora.',
  },
  {
    q: '¿Por qué algunos documentos no muestran fecha?',
    a: 'Cuando el documento no incluye una fecha legible (por ejemplo, una imagen con datos censurados) no se inventa ninguna: la ficha lo indica explícitamente en lugar de mostrar un dato falso.',
  },
  {
    q: '¿Puedo usar el contenido del sitio?',
    a: 'El código de los proyectos es público en GitHub. La identidad visual, los certificados y las marcas pertenecen a Ciszuko Antony: se pueden citar con atribución, no reclamar como propios.',
  },
  {
    q: '¿Cómo envío una propuesta de colaboración?',
    a: 'Usa la página de Contacto o el servidor de Discord. Incluye el área en la que quieres colaborar y un enlace a trabajo previo; todas las propuestas se responden.',
  },
  {
    q: '¿Los proyectos aceptan donaciones?',
    a: 'Sí, todas las vías están listadas en la página de Donar. Las donaciones financian el hosting y nunca desbloquean funciones exclusivas.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Comprueba la sección correcta',
    body: 'Muchas dudas están respondidas en la FAQ. Antes de reportar, revisa si ya existe una respuesta para tu caso.',
  },
  {
    title: 'Reúne los datos del problema',
    body: 'Página afectada, navegador, dispositivo y lo que esperabas que ocurriera. Cuanto más concreto, más rápido se reproduce.',
  },
  {
    title: 'Abre una incidencia',
    body: 'Desde la página de Soporte puedes enviar el reporte con esos datos. Queda registrado y se responde en orden de llegada.',
  },
  {
    title: 'Sigue el changelog',
    body: 'Las correcciones se publican en el changelog con su versión. Si tu reporte se resuelve, aparece ahí.',
  },
];

export default function HelpPage() {
  usePageTitle('HELP');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <InfoHero
            icon="help"
            title="Help"
            subtitle="Centro de ayuda de Ciszuko Antony: cómo verificar certificados, resolver problemas y contactar con soporte."
            theme={THEME}
          />
        </motion.div>

        <div className="space-y-14">
          <InfoLinkGrid groups={CATEGORIES} theme={THEME} />

          <section>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
              {COPY.faq}
            </h2>
            <InfoAccordion items={FAQS} theme={THEME} />
          </section>

          <InfoSteps title={COPY.troubleshooting} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Abrir incidencia', href: '/support', icon: 'support' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
