import type { Metadata } from 'next';
import {
  InfoHero,
  InfoFaqExplorer,
  InfoCardGrid,
  InfoCtaRow,
  type InfoTheme,
  type InfoFaqItem,
  type InfoFaqCategory,
  type InfoFaqCopy,
  type InfoCardItem,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | FAQ',
  description: 'Preguntas frecuentes sobre Ciszu Network, sus servicios y proyectos.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const CATEGORIES: InfoFaqCategory[] = [
  {
    id: 'compania',
    label: 'Compañía',
    icon: 'info',
    accent: 'text-brand-light',
    accentBg: 'bg-brand-light/10',
    accentBorder: 'border-brand-light/40',
  },
  {
    id: 'cuenta',
    label: 'Cuenta',
    icon: 'user',
    accent: 'text-neon-cyan',
    accentBg: 'bg-neon-cyan/10',
    accentBorder: 'border-neon-cyan/40',
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    icon: 'rocket',
    accent: 'text-neon-blue',
    accentBg: 'bg-neon-blue/10',
    accentBorder: 'border-neon-blue/40',
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: 'support',
    accent: 'text-neon-green',
    accentBg: 'bg-neon-green/10',
    accentBorder: 'border-neon-green/40',
  },
  {
    id: 'pagos',
    label: 'Pagos y apoyo',
    icon: 'heart',
    accent: 'text-neon-yellow',
    accentBg: 'bg-neon-yellow/10',
    accentBorder: 'border-neon-yellow/40',
  },
  {
    id: 'privacidad',
    label: 'Privacidad',
    icon: 'lock',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: 'help',
    accent: 'text-neon-orange',
    accentBg: 'bg-neon-orange/10',
    accentBorder: 'border-neon-orange/40',
  },
];

const FAQ_COPY: InfoFaqCopy = {
  searchPlaceholder: 'Busca por pregunta, servicio o palabra clave…',
  allCategories: 'Todas',
  results: '{n} de {total} preguntas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otra palabra o cambia de categoría.',
  clear: 'Limpiar filtros',
};

const FAQS: InfoFaqItem[] = [
  {
    category: 'compania',
    q: '¿Qué es Ciszu Network?',
    a: 'Ciszu Network es una compañía de innovación digital fundada por Ciszuko Antony. Desarrollamos soluciones web, infraestructura cloud, bots, servidores de juego y experiencias digitales.',
    tags: 'empresa compania ecosistema que es ciszu network',
  },
  {
    category: 'compania',
    q: '¿Quién está detrás de Ciszu Network?',
    a: 'Ciszu Network fue fundada y dirigida por Ciszuko Antony (Francisco García), CEO y único creador legítimo del proyecto. El equipo interno se organiza por cargos y rangos, y cada proyecto acredita a sus colaboradores en la página de Créditos.',
    tags: 'fundador ceo ciszuko antony equipo empresa quien',
  },
  {
    category: 'compania',
    q: '¿Dónde están ubicados y en qué horario atienden?',
    a: 'Nuestra sede está en Coro, Falcón, Venezuela (GMT-4). La atención y los servicios en línea operan 24/7, todos los días del año, a través de los canales oficiales.',
    tags: 'ubicacion sede venezuela coro horario gmt atencion',
  },
  {
    category: 'cuenta',
    q: '¿Qué es CISZU ID?',
    a: 'CISZU ID es la cuenta única del ecosistema: con ella inicias sesión y sincronizas perfil, preferencias y progreso entre todas las webs y servicios de Ciszu Network.',
    tags: 'ciszu id cuenta unica login registro perfil',
  },
  {
    category: 'cuenta',
    q: '¿Cómo creo una cuenta?',
    a: 'Desde cualquier web del ecosistema, pulsa «Iniciar sesión» o «Regístrate» y elige correo o un proveedor externo. La cuenta se crea una sola vez y sirve para el resto de servicios.',
    tags: 'crear cuenta registro signup correo proveedor',
  },
  {
    category: 'cuenta',
    q: '¿Cómo recupero mi contraseña?',
    a: 'En la pantalla de inicio de sesión usa la opción de recuperación y recibirás un enlace en el correo vinculado a tu CISZU ID. Por seguridad, el enlace caduca y solo puede usarse una vez.',
    tags: 'recuperar contrasena password olvidada reset correo',
  },
  {
    category: 'cuenta',
    q: '¿Puedo eliminar mi cuenta y mis datos?',
    a: 'Sí. Puedes solicitar la eliminación desde la página de Soporte o escribiendo al correo oficial. Se borran los datos asociados a tu CISZU ID, salvo los que la ley obligue a conservar.',
    tags: 'eliminar cuenta borrar datos privacidad derecho',
  },
  {
    category: 'proyectos',
    q: '¿Qué proyectos forman el ecosistema?',
    a: 'CiszuBot (bot de Discord), MuzicMania (juego de ritmo), CiszuGamens (comunidad gamer), el portfolio de Ciszuko Antony y las herramientas internas de desarrollo. Cada uno tiene su página con detalles y enlaces.',
    tags: 'proyectos ecosistema ciszubot muzicmania ciszugamens portfolio',
  },
  {
    category: 'proyectos',
    q: '¿MuzicMania es parte de Ciszu Network?',
    a: 'Sí, MuzicMania es el juego de ritmo desarrollado por Ciszu Network. Puedes probarlo en muzicmania.vercel.app y seguir sus cambios desde su changelog.',
    tags: 'muzicmania juego ritmo musica proyecto',
  },
  {
    category: 'proyectos',
    q: '¿Tienen servidores de Minecraft?',
    a: 'Sí: desarrollamos texture packs y mods, y administramos servidores Minecraft con identidad Ciszu. Consulta la página de Proyectos para ver el estado de cada uno.',
    tags: 'minecraft servidor texture pack mods juego',
  },
  {
    category: 'proyectos',
    q: '¿Cómo sigo las novedades de los proyectos?',
    a: 'El changelog de cada web registra los cambios con su versión, y las redes oficiales anuncian lanzamientos y eventos. Los enlaces están en el pie de página y en la página de Contacto.',
    tags: 'novedades changelog noticias redes actualizaciones',
  },
  {
    category: 'servicios',
    q: '¿Qué servicios ofrecen?',
    a: 'Ofrecemos desarrollo web (Next.js, React, TypeScript), infraestructura cloud (Vercel, Supabase), diseño UI/UX, bots para Discord y otras plataformas, servidores de juego y consultoría tecnológica.',
    tags: 'servicios desarrollo web infraestructura cloud diseno ui ux bot',
  },
  {
    category: 'servicios',
    q: '¿Cómo contrato un proyecto o propongo una colaboración?',
    a: 'Escríbenos desde la página de Contacto o a ciszunetwork@outlook.com con el alcance, los plazos y el presupuesto estimado. Respondemos con una propuesta y, si encaja, se acuerda el plan de trabajo por escrito.',
    tags: 'contratar proyecto colaboracion propuesta presupuesto encargo',
  },
  {
    category: 'servicios',
    q: '¿Desarrollan bots para Discord, WhatsApp o Telegram?',
    a: 'Sí, creamos bots personalizados para Discord, y trabajamos integraciones para WhatsApp y Telegram según el caso. También administramos el bot oficial del ecosistema, CiszuBot.',
    tags: 'bot discord whatsapp telegram automatizacion',
  },
  {
    category: 'servicios',
    q: '¿Hacen consultoría tecnológica?',
    a: 'Sí. Asesoramos en arquitectura web, despliegue en la nube, bases de datos y seguridad, tanto para proyectos nuevos como para revisiones de sistemas que ya están en producción.',
    tags: 'consultoria tecnologia arquitectura nube bases de datos seguridad',
  },
  {
    category: 'pagos',
    q: '¿Cómo puedo apoyar el proyecto?',
    a: 'Puedes donar a través de Ko-fi, Patreon o criptomonedas desde la página de Donar, o simplemente compartiendo nuestros proyectos. Cualquier apoyo mantiene la infraestructura en pie.',
    tags: 'donar apoyar kofi patreon criptomonedas donacion',
  },
  {
    category: 'pagos',
    q: '¿Las donaciones desbloquean funciones?',
    a: 'No. Las donaciones son voluntarias y financian hosting, dominios y desarrollo; ninguna función del ecosistema queda encerrada tras un pago.',
    tags: 'donacion pago funciones premium gratis',
  },
  {
    category: 'pagos',
    q: '¿Cómo se factura un encargo profesional?',
    a: 'Los encargos se acuerdan por contacto: se definen alcance, entregables y condiciones antes de empezar, y la facturación se emite con los datos fiscales de la compañía.',
    tags: 'factura pago encargo facturacion presupuesto fiscal',
  },
  {
    category: 'privacidad',
    q: '¿Qué datos recopilan las webs?',
    a: 'Solo los necesarios para funcionar: datos de cuenta, preferencias y métricas agregadas de uso. No vendemos datos personales; el detalle completo está en la Política de Privacidad.',
    tags: 'datos privacidad recopilar cookies personales',
  },
  {
    category: 'privacidad',
    q: '¿Qué son las cookies y cómo las controlo?',
    a: 'Las cookies mantienen tu sesión y tus preferencias; las de analítica y anuncios solo se activan con tu consentimiento. Puedes cambiar la elección desde el banner de cookies o la configuración del navegador.',
    tags: 'cookies consentimiento analitica anuncios privacidad',
  },
  {
    category: 'soporte',
    q: '¿Cómo reporto un error o pido soporte?',
    a: 'Abre una incidencia desde la página de Soporte con la página afectada, el navegador y los pasos para reproducirlo. También puedes usar el formulario de Feedback o el correo oficial.',
    tags: 'soporte error bug incidencia reporte ayuda',
  },
  {
    category: 'soporte',
    q: '¿Cuánto tardan en responder?',
    a: 'Las incidencias con seguimiento se atienden por orden de llegada, normalmente en menos de 48 horas. Los fallos críticos de plataforma se priorizan y se comunican en el changelog.',
    tags: 'respuesta tiempo soporte incidencia plazo 48 horas',
  },
  {
    category: 'soporte',
    q: '¿Cómo puedo contribuir al código?',
    a: 'Los proyectos open source aceptan issues, forks y pull requests en GitHub (github.com/Ciszu-Network). Revisa los lineamientos y el estilo de cada repositorio antes de enviar cambios.',
    tags: 'contribuir codigo github open source pull request issue',
  },
];

const TOPICS: InfoCardItem[] = [
  {
    icon: 'info',
    title: 'Sobre la compañía',
    body: 'Quiénes somos, qué hacemos y cómo trabajamos. Consulta la sección de información o la página del equipo.',
  },
  {
    icon: 'rocket',
    title: 'Proyectos y servicios',
    body: 'CiszuBot, MuzicMania, CiszuGamens, portfolio y más. Cada proyecto tiene su página con detalles y enlaces.',
  },
  {
    icon: 'lock',
    title: 'Privacidad y legal',
    body: 'Consulta la Política de Privacidad, las Reglas de la comunidad y la Licencia del software.',
  },
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="faq"
          title="Preguntas frecuentes"
          subtitle="Respuestas rápidas a las dudas más comunes sobre Ciszu Network, sus proyectos y servicios."
          kicker="FAQ"
          theme={THEME}
        />

        <div className="space-y-14">
          <InfoFaqExplorer items={FAQS} categories={CATEGORIES} theme={THEME} copy={FAQ_COPY} />
          <InfoCardGrid title="Temas relacionados" items={TOPICS} theme={THEME} columns={3} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Centro de ayuda', href: '/help', icon: 'help' },
            { label: 'Abrir incidencia', href: '/support', icon: 'support', variant: 'ghost' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
