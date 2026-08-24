import type { Metadata } from 'next';

/**
 * Metadata SSR por ruta (MuzicMania).
 *
 * Las páginas son client components ('use client') y no pueden exportar
 * `export const metadata` (requisito de Next App Router para server
 * components). Este helper lo centraliza: el layout raíz lo invoca con el
 * pathname (inyectado por el middleware en el header x-pathname) y devuelve
 * title/description únicos por ruta para SEO (Screaming Frog, GSC, etc.).
 *
 * El título visible en el navegador lo sigue fijando `usePageTitle()` en cada
 * página; aquí solo se cubre la capa SSR/SEO.
 */

export const SITE_NAME = 'MuzicMania';

const META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} | HOME`,
    description: 'El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.',
  },
  '/about': {
    title: `Sobre MuzicMania | ${SITE_NAME}`,
    description: 'Conoce MuzicMania: el juego de ritmo online con estética futurista. Historia, visión y el equipo detrás.',
  },
  '/contact': {
    title: `Contacto | ${SITE_NAME}`,
    description: 'Contacta con el equipo de MuzicMania: soporte, sugerencias y colaboraciones.',
  },
  '/faq': {
    title: `Preguntas Frecuentes | ${SITE_NAME}`,
    description: 'Respuestas a las dudas más comunes sobre MuzicMania: cuenta, juego, scores y más.',
  },
  '/leaderboard': {
    title: `Leaderboard | ${SITE_NAME}`,
    description: 'El ranking de los mejores jugadores de MuzicMania. Compite y sube en la tabla.',
  },
  '/download': {
    title: `Descargar MuzicMania | ${SITE_NAME}`,
    description: 'Descarga MuzicMania: juego de ritmo en la web y app para tu dispositivo.',
  },
  '/changelog': {
    title: `Changelog | ${SITE_NAME}`,
    description: 'Historial de actualizaciones de MuzicMania: nuevas versiones, mejoras y correcciones.',
  },
  '/documentation': {
    title: `Documentación | ${SITE_NAME}`,
    description: 'Documentación técnica de MuzicMania: APIs, integración y referencia para desarrolladores.',
  },
  '/play': {
    title: `Jugar | ${SITE_NAME}`,
    description: 'Entra a la arena de MuzicMania y demuestra tu ritmo. Modos de juego y desafíos online.',
  },
  '/library': {
    title: `Librería | ${SITE_NAME}`,
    description: 'Explora el catálogo musical de MuzicMania: canciones y pistas disponibles.',
  },
  '/profile': {
    title: `Mi Perfil | ${SITE_NAME}`,
    description: 'Tu perfil de MuzicMania: estadísticas, logros, scores y configuración.',
  },
  '/credits': {
    title: `Créditos | ${SITE_NAME}`,
    description: 'Los créditos de MuzicMania: música, arte, desarrollo y agradecimientos.',
  },
  '/reviews': {
    title: `Reseñas | ${SITE_NAME}`,
    description: 'Reseñas y opiniones de la comunidad sobre MuzicMania.',
  },
  '/team': {
    title: `Equipo | ${SITE_NAME}`,
    description: 'El equipo detrás de MuzicMania: desarrolladores, artistas y colaboradores.',
  },
  '/terms': {
    title: `Términos y Condiciones | ${SITE_NAME}`,
    description: 'Los términos y condiciones de uso de MuzicMania.',
  },
  '/policy': {
    title: `Política de Privacidad | ${SITE_NAME}`,
    description: 'Cómo MuzicMania recopila, usa y protege tus datos.',
  },
  '/rules': {
    title: `Reglas | ${SITE_NAME}`,
    description: 'Las reglas de la comunidad de MuzicMania: juego limpio y convivencia.',
  },
  '/guidelines': {
    title: `Directrices | ${SITE_NAME}`,
    description: 'Directrices de contenido y comportamiento en MuzicMania.',
  },
  '/help': {
    title: `Ayuda | ${SITE_NAME}`,
    description: 'Centro de ayuda de MuzicMania: guías, solución de problemas y soporte.',
  },
  '/support': {
    title: `Soporte | ${SITE_NAME}`,
    description: 'Soporte técnico de MuzicMania: reporta problemas y recibe ayuda.',
  },
  '/feedback': {
    title: `Feedback | ${SITE_NAME}`,
    description: 'Envía tu feedback sobre MuzicMania: sugerencias, bugs y mejoras.',
  },
  '/forum': {
    title: `Foro | ${SITE_NAME}`,
    description: 'El foro de la comunidad de MuzicMania: debate, ayuda y novedades.',
  },
  '/information': {
    title: `Información | ${SITE_NAME}`,
    description: 'Información general sobre MuzicMania y su ecosistema.',
  },
  '/stats': {
    title: `Estadísticas | ${SITE_NAME}`,
    description: 'Estadísticas de MuzicMania: jugadores, scores y actividad del juego.',
  },
  '/license': {
    title: `Licencia | ${SITE_NAME}`,
    description: 'La licencia de uso de MuzicMania y su contenido.',
  },
  '/login': {
    title: `Iniciar Sesión | ${SITE_NAME}`,
    description: 'Accede a tu cuenta de MuzicMania con tu Ciszuko ID.',
  },
  '/register': {
    title: `Registro | ${SITE_NAME}`,
    description: 'Crea tu cuenta de MuzicMania y empieza a jugar.',
  },
};

const FALLBACK: { title: string; description: string } = {
  title: SITE_NAME,
  description: 'El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.',
};

/** Genera metadata SSR a partir del pathname de la request (header x-pathname). */
export function pageMetadataFromHeader(): Metadata {
  // El layout raíz ya lee headers(); este helper espera el header x-pathname
  // inyectado por el middleware. Si no está, devuelve el fallback genérico.
  // Se sobrescribe en el layout con el valor real.
  return FALLBACK;
}

/** Busca metadata por ruta exacta o prefix (/changelog/xxx → /changelog). */
export function metadataForPath(pathname: string): Metadata {
  if (META[pathname]) return META[pathname];
  // Rutas anidadas: /changelog/patch-x → /changelog
  const parts = pathname.split('/');
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join('/') || '/';
    if (META[prefix]) return META[prefix];
  }
  return FALLBACK;
}