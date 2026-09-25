'use client';

import {
  InfoHelpExplorer,
  type InfoHelpCard,
  type InfoHelpCategory,
  type InfoHelpCopy,
  type InfoTheme,
} from '@ciszu/ui';

/**
 * Contenido del centro de ayuda de Ciszu Network.
 *
 * La lógica (buscador, chips por categoría, grid y modal central) vive en
 * `InfoHelpExplorer`; aquí solo van las 25 ayudas reales de la web y su paleta,
 * con las clases literales para que Tailwind las extraiga.
 */
const CATEGORIES: InfoHelpCategory[] = [
  {
    id: 'cuenta',
    label: 'Cuenta',
    icon: 'user',
    accent: 'text-brand-light',
    accentBg: 'bg-brand/10',
    accentBorder: 'border-brand/40',
    cta: 'bg-brand-light text-black hover:bg-brand-accent',
  },
  {
    id: 'navegacion',
    label: 'Navegación',
    icon: 'globe',
    accent: 'text-neon-cyan',
    accentBg: 'bg-neon-cyan/10',
    accentBorder: 'border-neon-cyan/40',
    cta: 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
  },
  {
    id: 'contenido',
    label: 'Descargas y contenido',
    icon: 'download',
    accent: 'text-neon-purple',
    accentBg: 'bg-neon-purple/10',
    accentBorder: 'border-neon-purple/40',
    cta: 'bg-neon-purple text-white hover:bg-neon-purple/90',
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: 'rocket',
    accent: 'text-neon-green',
    accentBg: 'bg-neon-green/10',
    accentBorder: 'border-neon-green/40',
    cta: 'bg-neon-green text-black hover:bg-neon-green/90',
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    icon: 'users',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
    cta: 'bg-neon-pink text-black hover:bg-neon-pink/90',
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: 'support',
    accent: 'text-neon-yellow',
    accentBg: 'bg-neon-yellow/10',
    accentBorder: 'border-neon-yellow/40',
    cta: 'bg-neon-yellow text-black hover:bg-neon-yellow/90',
  },
  {
    id: 'legal',
    label: 'Legal',
    icon: 'policies',
    accent: 'text-brand-accent',
    accentBg: 'bg-brand-accent/10',
    accentBorder: 'border-brand-accent/40',
    cta: 'bg-brand-accent text-black hover:bg-brand-accent/90',
  },
];

const COPY: InfoHelpCopy = {
  searchPlaceholder: 'Busca una ayuda: cuenta, descargas, errores...',
  allCategories: 'Todas',
  results: 'Mostrando {n} de {total} ayudas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otra palabra o cambia de categoría.',
  clear: 'Reiniciar búsqueda',
  stepsTitle: 'Pasos rápidos',
  open: 'Abrir ayuda',
  close: 'Cerrar',
};

const CARDS: InfoHelpCard[] = [
  {
    title: 'Crear tu CISZU ID',
    category: 'cuenta',
    icon: 'user',
    summary: 'Una sola cuenta para todas las webs y servicios del ecosistema.',
    detail:
      'CISZU ID es la identidad única de Ciszu Network: con ella accedes a la web principal, al portfolio, a CiszuBot y a MuzicMania, y sincronizas preferencias y progreso entre proyectos.',
    steps: [
      'Entra en la página de registro y elige correo y contraseña, o uno de los proveedores disponibles (Google, Microsoft o Discord).',
      'Confirma tu correo desde el enlace de verificación.',
      'Inicia sesión en cualquier web del ecosistema con la misma cuenta.',
    ],
    tags: 'registro signup crear cuenta email correo google microsoft discord oauth identidad',
    cta: { label: 'Crear cuenta', href: '/register' },
  },
  {
    title: 'Iniciar y cerrar sesión',
    category: 'cuenta',
    icon: 'key',
    summary: 'Accede con tu CISZU ID y mantén la sesión segura en tus dispositivos.',
    detail:
      'El inicio de sesión usa tu CISZU ID y mantiene la sesión activa en el navegador. Desde el menú de tu cuenta puedes cerrar sesión cuando uses un equipo compartido.',
    steps: [
      'Abre la página de inicio de sesión.',
      'Introduce tu correo y contraseña, o el proveedor con el que te registraste.',
      'Si compartes el equipo, cierra sesión al terminar desde el menú de tu cuenta.',
    ],
    tags: 'login entrar sesión sign in cerrar logout password clave',
    cta: { label: 'Iniciar sesión', href: '/login' },
  },
  {
    title: 'Recuperar tu contraseña',
    category: 'cuenta',
    icon: 'lock',
    summary: 'Solicita un enlace de restablecimiento si olvidaste tu contraseña.',
    detail:
      'Si no recuerdas la contraseña, el sistema envía un enlace de un solo uso al correo vinculado a tu CISZU ID. Revisa también la carpeta de spam antes de repetir la solicitud.',
    steps: [
      'Entra en la página de recuperación y escribe el correo de tu cuenta.',
      'Abre el enlace del correo: caduca y solo sirve una vez.',
      'Define la nueva contraseña y vuelve a iniciar sesión.',
    ],
    tags: 'contraseña password olvidada reset restablecer enlace correo recuperar',
    cta: { label: 'Recuperar acceso', href: '/reset-password' },
  },
  {
    title: 'Verificación en dos pasos (2FA)',
    category: 'cuenta',
    icon: 'security',
    summary: 'Añade una capa extra de seguridad con un código temporal por correo.',
    detail:
      'La verificación en dos pasos pide un código temporal además de tu contraseña. El código llega a tu correo, caduca en pocos minutos y puede reenviarse si no lo recibes.',
    steps: [
      'Inicia sesión y llega hasta la pantalla de verificación.',
      'Revisa el correo con el código temporal (formato C-123 434).',
      'Escríbelo antes de que caduque para completar el acceso.',
    ],
    tags: '2fa two factor autenticación código temporal seguridad correo',
    cta: { label: 'Iniciar sesión', href: '/login' },
  },
  {
    title: 'Preferencias locales (tema y cookies)',
    category: 'navegacion',
    icon: 'settings',
    summary: 'Tema claro u oscuro y consentimiento de cookies en tu navegador.',
    detail:
      'Las preferencias locales se guardan en tu navegador: tema visual y consentimiento de cookies. Puedes cambiarlas cuando quieras desde el selector de preferencias del menú.',
    steps: [
      'Abre el menú de tu cuenta o el selector de preferencias.',
      'Elige tema claro u oscuro y gestiona las cookies.',
      'Guarda los cambios: la web se recarga con la nueva apariencia.',
    ],
    tags: 'preferencias tema dark light oscuro claro cookies zoom',
    cta: { label: 'Ver documentación', href: '/documentation' },
  },
  {
    title: 'Idioma del sitio',
    category: 'navegacion',
    icon: 'language',
    summary: 'Cuatro variantes de idioma para la interfaz del ecosistema.',
    detail:
      'El selector de idioma ofrece cuatro variantes individuales de español e inglés (es-Latam, es-España, en-US y en-UK). Los idiomas aún no traducidos aparecen bloqueados con su aviso.',
    steps: [
      'Abre el selector de idioma desde la barra de navegación.',
      'Elige una de las variantes disponibles.',
      'La interfaz cambia de idioma manteniendo tu sesión.',
    ],
    tags: 'idioma language español ingles es-latam es-es en-us en-uk traducir',
    cta: { label: 'Ver documentación', href: '/documentation' },
  },
  {
    title: 'Mapa de la web',
    category: 'navegacion',
    icon: 'home',
    summary: 'Qué encontrarás en cada sección principal de la web.',
    detail:
      'La web se organiza en páginas de marca (inicio, about, team), contenido (proyectos, documentación, changelog), comunidad (foro, reseñas, reglas) y soporte (faq, support, contacto).',
    steps: [
      'Usa la barra de navegación superior para las secciones principales.',
      'Entra en Proyectos para ver cada producto del ecosistema.',
      'Si te pierdes, vuelve al inicio desde el logotipo.',
    ],
    tags: 'mapa navegación secciones menu estructura páginas inicio',
    cta: { label: 'Sobre la compañía', href: '/about' },
  },
  {
    title: 'Documentación y guías técnicas',
    category: 'contenido',
    icon: 'terminal',
    summary: 'Los sistemas del ecosistema explicados en detalle.',
    detail:
      'La sección de documentación reúne las guías de arquitectura, base de datos, seguridad, estilos y operación. Es la fuente de verdad técnica del ecosistema.',
    steps: [
      'Abre Documentación desde la navegación.',
      'Busca el sistema que te interesa (auth, CDN, estilos...).',
      'Sigue los enlaces relacionados al final de cada guía.',
    ],
    tags: 'documentación docs guías técnicas arquitectura manual api',
    cta: { label: 'Abrir documentación', href: '/documentation' },
  },
  {
    title: 'Descargar la PDWA (app de escritorio)',
    category: 'contenido',
    icon: 'download',
    summary: 'Instala la web como aplicación, sin pestañas ni barra de direcciones.',
    detail:
      'La PDWA (app de escritorio progresiva) abre Ciszu Network en su propia ventana, con acceso directo y soporte sin conexión básico. La instalación es nativa en Chrome y Microsoft Edge.',
    steps: [
      'Abre la página de descargas en Chrome o Edge.',
      'Pulsa "Instalar PDWA" y confirma el diálogo del navegador.',
      'Abre la app desde el menú Inicio o el escritorio.',
    ],
    tags: 'pdwa pwa descargar instalar app escritorio chrome edge atajo',
    cta: { label: 'Ver descargas', href: '/downloads' },
  },
  {
    title: 'Instalar en Opera o Firefox',
    category: 'contenido',
    icon: 'monitor',
    summary: 'Alternativas para navegadores sin instalación nativa de PDWA.',
    detail:
      'Firefox no instala aplicaciones web. Opera permite un acceso directo con el flag --app para abrir la web como ventana independiente. También puedes instalar la PDWA con Edge, incluido en Windows.',
    steps: [
      'En Opera: Menú > Guardar y compartir > Crear acceso directo.',
      'Edita el acceso directo y añade --app="https://ciszunetwork.vercel.app".',
      'En Firefox: instala con Edge o Chrome y usa el icono de la barra de direcciones.',
    ],
    tags: 'opera firefox navegador compatibilidad app ventana acceso directo',
    cta: { label: 'Ver descargas', href: '/downloads' },
  },
  {
    title: 'Certificados y formación',
    category: 'contenido',
    icon: 'certificates',
    summary: 'Cursos y evaluaciones oficiales del ecosistema.',
    detail:
      'La sección de cursos reúne la formación del ecosistema, como la evaluación de inglés EF SET con nivel MCER. Algunos cursos son externos y se abren en otra pestaña.',
    steps: [
      'Abre la página de cursos.',
      'Filtra o busca el curso que te interese.',
      'Pulsa el enlace y completa la evaluación en la web oficial.',
    ],
    tags: 'cursos certificados formación aprender ef set inglés nivel mcer',
    cta: { label: 'Ver cursos', href: '/courses' },
  },
  {
    title: 'Changelog y novedades',
    category: 'contenido',
    icon: 'history',
    summary: 'Todo lo que cambia en el ecosistema, con versión y detalle.',
    detail:
      'El changelog registra las novedades de cada web y del ecosistema. Cada entrada indica su versión, el estado del cambio y permite dejar un "me gusta" local.',
    steps: [
      'Abre el changelog desde la navegación.',
      'Filtra por web o estado para encontrar un cambio concreto.',
      'Entra en una entrada para ver el detalle completo.',
    ],
    tags: 'changelog novedades versiones cambios historial roadmap actualizaciones',
    cta: { label: 'Ver changelog', href: '/changelog' },
  },
  {
    title: 'Proyectos del ecosistema',
    category: 'servicios',
    icon: 'rocket',
    summary: 'CiszuBot, MuzicMania, CiszuGamens y el portfolio, con su ficha.',
    detail:
      'Cada proyecto del ecosistema tiene su propia página con descripción, enlaces y estado. Desde ahí puedes saltar a la web del proyecto o a su documentación técnica.',
    steps: [
      'Abre la sección de proyectos.',
      'Elige el proyecto que quieras conocer.',
      'Sigue los enlaces a su web, su código o su documentación.',
    ],
    tags: 'proyectos ciszubot muzicmania ciszugamens portfolio apps ecosistema',
    cta: { label: 'Ver proyectos', href: '/projects' },
  },
  {
    title: 'Estado de los servicios',
    category: 'servicios',
    icon: 'signal',
    summary: 'Latencia, conexión y estado real de la infraestructura.',
    detail:
      'La página de estado mide en tu propio navegador la conexión, la latencia y el estado de la base de datos. No muestra datos inventados: lo que no se puede medir se indica como tal.',
    steps: [
      'Abre la página de estado.',
      'Revisa el indicador de conexión y la latencia medida.',
      'Si un servicio aparece caído, espera unos minutos o revisa el changelog.',
    ],
    tags: 'estado status servidor infraestructura latencia conexión uptime caído',
    cta: { label: 'Ver estado', href: '/stats' },
  },
  {
    title: 'Anuncios y bloqueadores',
    category: 'servicios',
    icon: 'target',
    summary: 'Por qué aparecen anuncios y cómo afecta el bloqueador al sitio.',
    detail:
      'El sitio muestra anuncios para financiar el hosting, con avisos según el tipo. Si usas un bloqueador, un aviso explica cómo permitir los anuncios o apoyar con una donación.',
    steps: [
      'Si aparece el aviso de bloqueador, léelo antes de cerrarlo.',
      'Permite los anuncios en esta web desde tu extensión, o considera donar.',
      'Recarga la página para aplicar el cambio.',
    ],
    tags: 'anuncios ads bloqueador adblock publicidad monetización recompensa',
    cta: { label: 'Preguntas frecuentes', href: '/faq' },
  },
  {
    title: 'Donaciones y apoyo',
    category: 'servicios',
    icon: 'heart',
    summary: 'Ko-fi, Patreon y criptomonedas para sostener los servidores.',
    detail:
      'Las donaciones financian el hosting y el desarrollo. Todas las vías están publicadas en la página de donar y ninguna desbloquea funciones exclusivas: el acceso es igual para todos.',
    steps: [
      'Abre la página de donaciones.',
      'Elige la vía que prefieras (Ko-fi, Patreon o criptomonedas).',
      'Sigue las instrucciones de la plataforma elegida.',
    ],
    tags: 'donar donaciones ko-fi patreon cripto crypto apoyar financiar servidores',
    cta: { label: 'Ir a donar', href: '/donate' },
  },
  {
    title: 'Foro de la comunidad',
    category: 'comunidad',
    icon: 'comment',
    summary: 'Debates, dudas y anuncios de la comunidad Ciszu.',
    detail:
      'El foro es el espacio de la comunidad para preguntar, compartir y debatir. Para publicar necesitas tu CISZU ID; la moderación aplica las normas de la comunidad.',
    steps: [
      'Inicia sesión con tu CISZU ID.',
      'Elige la categoría adecuada para tu tema.',
      'Publica con un título claro y sin datos personales.',
    ],
    tags: 'foro comunidad debate preguntas publicar temas discusión',
    cta: { label: 'Abrir foro', href: '/forum' },
  },
  {
    title: 'Reseñas de Google',
    category: 'comunidad',
    icon: 'star',
    summary: 'Opiniones verificadas y cómo dejar la tuya.',
    detail:
      'La página de reseñas muestra las opiniones de Google del negocio y permite dejar una reseña propia. Las reseñas se moderan antes de publicarse.',
    steps: [
      'Abre la página de reseñas.',
      'Lee las opiniones publicadas.',
      'Pulsa para escribir una reseña y complétala en Google.',
    ],
    tags: 'reseñas reviews google opiniones valoración estrellas negocio',
    cta: { label: 'Ver reseñas', href: '/reviews' },
  },
  {
    title: 'Normas de la comunidad',
    category: 'comunidad',
    icon: 'users',
    summary: 'Las reglas de convivencia que aplican en todas las webs.',
    detail:
      'Las normas de la comunidad y las guías cubren el comportamiento esperado en foro, Discord y comentarios. Respetarlas mantiene el espacio sano y evita sanciones.',
    steps: [
      'Lee las reglas completas antes de participar.',
      'Consulta las guías si dudas sobre un caso concreto.',
      'Reporta conductas que las incumplan al equipo de soporte.',
    ],
    tags: 'normas reglas comunidad convivencia respeto sanciones guías',
    cta: { label: 'Leer las reglas', href: '/rules' },
  },
  {
    title: 'Contacto y redes oficiales',
    category: 'comunidad',
    icon: 'mail',
    summary: 'Correo, WhatsApp y canales verificados de Ciszu Network.',
    detail:
      'Todos los canales oficiales están en la página de contacto: correo, WhatsApp y redes. Desconfía de cuentas o correos que no aparezcan publicados ahí.',
    steps: [
      'Abre la página de contacto.',
      'Elige el canal adecuado (soporte, negocio o prensa).',
      'Escribe desde tu correo con los datos del caso.',
    ],
    tags: 'contacto correo email whatsapp redes sociales oficial soporte',
    cta: { label: 'Ir a contacto', href: '/contact' },
  },
  {
    title: 'Reportar un bug o sugerencia',
    category: 'soporte',
    icon: 'warning',
    summary: 'Envía errores y mejoras al equipo con el formulario de feedback.',
    detail:
      'El formulario de feedback recoge errores concretos y propuestas de mejora. Cuanto más detallado sea el reporte (página, navegador, pasos), más rápido se puede reproducir.',
    steps: [
      'Abre la página de feedback.',
      'Describe qué esperabas y qué ocurrió realmente.',
      'Añade navegador, dispositivo y una captura si es posible.',
    ],
    tags: 'bug error reporte feedback sugerencia mejora fallo formulario',
    cta: { label: 'Enviar feedback', href: '/feedback' },
  },
  {
    title: 'Abrir una incidencia',
    category: 'soporte',
    icon: 'support',
    summary: 'Incidencias con seguimiento para problemas que no se resuelven solos.',
    detail:
      'La página de soporte registra incidencias con seguimiento. Úsala cuando un problema persista o afecte a tu cuenta, no para dudas generales.',
    steps: [
      'Revisa la FAQ y los errores comunes antes de abrirla.',
      'Rellena la incidencia con los datos del problema.',
      'Guarda la referencia para consultar el estado.',
    ],
    tags: 'soporte incidencia ticket ayuda problema seguimiento support',
    cta: { label: 'Abrir incidencia', href: '/support' },
  },
  {
    title: 'Errores comunes de la web',
    category: 'soporte',
    icon: 'error',
    summary: 'Causas y solución rápida de los fallos más habituales.',
    detail:
      'Los fallos más comunes son caché desactualizada, sesión caducada, bloqueadores interfiriendo en formularios y cookies rechazadas. La FAQ recoge cada caso con su solución.',
    steps: [
      'Recarga con Ctrl+F5 para descartar caché.',
      'Comprueba que la sesión sigue activa y que las cookies están permitidas.',
      'Si persiste, abre una incidencia con los detalles.',
    ],
    tags: 'error fallo problema caché sesión cookies 404 solución troubleshooting',
    cta: { label: 'Ver la FAQ', href: '/faq' },
  },
  {
    title: 'Privacidad y cookies',
    category: 'legal',
    icon: 'lock',
    summary: 'Qué datos se guardan, para qué y cómo gestionar el consentimiento.',
    detail:
      'La política de privacidad detalla qué datos se recogen, con qué finalidad y cuánto tiempo se conservan. El consentimiento de cookies se puede cambiar o retirar desde las preferencias.',
    steps: [
      'Lee la política de privacidad completa.',
      'Abre las preferencias para aceptar o retirar el consentimiento de cookies.',
      'Para ejercer tus derechos, escribe al correo de contacto.',
    ],
    tags: 'privacidad privacy datos cookies consentimiento gdpr rgpd política',
    cta: { label: 'Leer política', href: '/policy' },
  },
  {
    title: 'Términos y licencia',
    category: 'legal',
    icon: 'terms',
    summary: 'Condiciones de uso y licencia del software del ecosistema.',
    detail:
      'La licencia explica cómo puede usarse el código y los contenidos del ecosistema. El código de los proyectos es público; la marca y la identidad visual pertenecen a Ciszuko Antony.',
    steps: [
      'Consulta la licencia del software en su página.',
      'Cita siempre la autoría al reutilizar contenido permitido.',
      'Para usos comerciales, contacta antes con el equipo.',
    ],
    tags: 'licencia términos legal copyright marca código uso comercial',
    cta: { label: 'Ver licencia', href: '/license' },
  },
];

export default function HelpCenter({ theme }: { theme: InfoTheme }) {
  return <InfoHelpExplorer cards={CARDS} categories={CATEGORIES} copy={COPY} theme={theme} />;
}
