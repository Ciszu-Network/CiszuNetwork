/**
 * Perfil profesional y personal REAL de Ciszuko Antony (Francisco Antonio
 * García Menolascina).
 *
 * Fuente de verdad de `/about`, la home y el portfolio. Nada de métricas
 * inventadas: cada porcentaje, herramienta, rol e interés lo declaró el autor.
 * Los iconos de lenguajes viven en `@/components/curriculum/CurriculumContent`
 * (SKILL_LOGO) para el currículum; aquí se reutilizan por nombre.
 */

export type ProfileSkill = {
  name: string;
  level: number;
  icon: string;
  family: 'Lenguajes' | 'Frontend' | 'Backend' | 'Datos' | 'DevOps' | 'Herramientas';
};

export type ProfileRole = { icon: string; title: string; desc: string };
export type ProfileTool = { icon: string; name: string; note: string };
export type ProfileFact = { icon: string; label: string; value: string };

export const PROFILE = {
  name: 'Ciszuko Antony',
  legalName: 'Francisco Antonio García Menolascina',
  shortName: 'Francisco García',
  role: 'CEO & Fundador de Ciszu Network',
  location: 'Coro, Falcón · Venezuela',
  birth: '11 de noviembre',
  age: '17 años',
  timezone: 'GMT-4',
  university: 'UPTAG (Falcón)',
  email: 'ciszunetwork@outlook.com',
  since: 2022,
  summary:
    'Desarrollador full-stack y artista digital. Construyo webs, bots, juegos y herramientas sobre un monorepo propio con Next.js, TypeScript, Python y Supabase, con identidad visual y documentación de ingeniería verificable.',
};

export const PROFILE_FACTS: ProfileFact[] = [
  { icon: 'calendar', label: 'Cumpleaños', value: PROFILE.birth },
  { icon: 'user', label: 'Edad', value: PROFILE.age },
  { icon: 'globe', label: 'País', value: 'Venezuela' },
  { icon: 'graduation', label: 'Universidad', value: PROFILE.university },
  { icon: 'server', label: 'Empresa', value: 'Ciszu Network' },
  { icon: 'clock', label: 'Zona horaria', value: PROFILE.timezone },
];

export const PROFILE_ROLES: ProfileRole[] = [
  { icon: 'terminal', title: 'Full-stack developer', desc: 'WebApps completas, bots, CLI y herramientas sobre un monorepo propio con Next.js, TypeScript, Python y Supabase.' },
  { icon: 'palette', title: 'Diseñador & editor', desc: 'Identidad visual, edición de vídeo e ilustración con Adobe, Affinity, Corel, DaVinci Resolve, Filmora y CapCut.' },
  { icon: 'play', title: 'Creador de contenido', desc: 'Gaming, tutoriales, mods y texturas de juegos, servidores y bots de Discord. Canal de YouTube variado centrado en juegos.' },
  { icon: 'music', title: 'Músico', desc: 'Producción musical con FL Studio: álbum de práctica 2024 y banda sonora Genesis Neon para MuzicMania.' },
  { icon: 'money', title: 'Publisher & marketing', desc: 'Publicación de apps, presencia digital multiplataforma y marketing en redes para el ecosistema.' },
  { icon: 'share', title: 'Gestor de comunidad', desc: 'Servidores de Discord, comunidades gaming y documentación técnica del ecosistema.' },
];

export const PROFILE_TOOLS: ProfileTool[] = [
  { icon: 'palette', name: 'Suite Adobe', note: 'Photoshop, Illustrator, After Effects…' },
  { icon: 'palette', name: 'Affinity', note: 'Photo, Designer y Publisher.' },
  { icon: 'palette', name: 'Corel', note: 'CorelDRAW y suite de diseño.' },
  { icon: 'play', name: 'DaVinci Resolve', note: 'Edición y color profesional.' },
  { icon: 'play', name: 'Filmora', note: 'Edición de vídeo.' },
  { icon: 'play', name: 'CapCut', note: 'Edición rápida y vertical.' },
  { icon: 'globe', name: 'Office', note: 'Word, Excel, PowerPoint y la suite de Google Docs.' },
  { icon: 'terminal', name: 'VS Code', note: 'Editor principal para JS/TS.' },
];

export const PROFILE_BROWSERS = [
  { name: 'Tor', icon: 'lock' },
  { name: 'Brave', icon: 'shield' },
  { name: 'Opera GX', icon: 'gamepad' },
  { name: 'Chrome', icon: 'globe' },
  { name: 'Firefox', icon: 'flame' },
  { name: 'Edge', icon: 'globe' },
];

export const PROFILE_AI = [
  { name: 'Gemini', icon: 'star' },
  { name: 'DeepSeek', icon: 'chip' },
  { name: 'Claude', icon: 'sparkles' },
  { name: 'ChatGPT', icon: 'comment' },
];

export const PROFILE_INTERESTS = [
  { icon: 'tv', label: 'Ver películas' },
  { icon: 'utensils', label: 'Comer' },
  { icon: 'gamepad', label: 'Gaming' },
  { icon: 'play', label: 'Tutoriales y mods' },
  { icon: 'music', label: 'Música' },
  { icon: 'server', label: 'Servidores y bots' },
];

export const PROFILE_ASPIRATIONS = [
  'Ingeniero de Información y Sistemas (full-stack de WebApps)',
  'Especialista en UI/UX y análisis de datos',
  'Bases de datos y testing',
  'Pentesting y seguridad',
  'Programas ejecutables, interfaces CLI y GUI',
  'Videojuegos',
];

export const PROFILE_PLATFORMS = [
  'Vercel (deploy)', 'Supabase (backend)', 'GitHub Pages', 'Cloudflare', 'Next.js', 'VPS',
  'Google Cloud', 'Notion', 'Trello',
];

export const PROFILE_SKILLS: ProfileSkill[] = [
  { name: 'Python', level: 80, icon: 'python', family: 'Lenguajes' },
  { name: 'JavaScript', level: 20, icon: 'javascript', family: 'Lenguajes' },
  { name: 'TypeScript', level: 25, icon: 'typescript', family: 'Lenguajes' },
  { name: 'Java', level: 10, icon: 'java', family: 'Lenguajes' },
  { name: 'C', level: 10, icon: 'c', family: 'Lenguajes' },
  { name: 'C++', level: 10, icon: 'cpp', family: 'Lenguajes' },
  { name: 'C#', level: 10, icon: 'csharp', family: 'Lenguajes' },
  { name: 'Lua', level: 25, icon: 'lua', family: 'Lenguajes' },
  { name: 'Luau', level: 25, icon: 'luau', family: 'Lenguajes' },
  { name: 'Julia', level: 60, icon: 'julia', family: 'Lenguajes' },
  { name: 'Ruby', level: 7, icon: 'ruby', family: 'Lenguajes' },
  { name: 'Perl', level: 7, icon: 'perl', family: 'Lenguajes' },
  { name: 'R', level: 7, icon: 'rlang', family: 'Lenguajes' },
  { name: 'Rust', level: 7, icon: 'rust', family: 'Lenguajes' },
  { name: 'ASM', level: 7, icon: 'asm', family: 'Lenguajes' },
  { name: 'Kotlin', level: 5, icon: 'kotlin', family: 'Lenguajes' },
  { name: 'Swift', level: 5, icon: 'swift', family: 'Lenguajes' },
  { name: 'HTML', level: 85, icon: 'html', family: 'Frontend' },
  { name: 'CSS', level: 85, icon: 'css', family: 'Frontend' },
  { name: 'XML', level: 30, icon: 'xml', family: 'Frontend' },
  { name: 'SASS', level: 70, icon: 'sass', family: 'Frontend' },
  { name: 'React', level: 35, icon: 'react', family: 'Frontend' },
  { name: 'Node.js', level: 40, icon: 'nodejs', family: 'Backend' },
  { name: 'Express.js', level: 30, icon: 'express', family: 'Backend' },
  { name: 'Django', level: 35, icon: 'django', family: 'Backend' },
  { name: 'Next.js', level: 40, icon: 'nextjs', family: 'Backend' },
  { name: 'SQL', level: 60, icon: 'database', family: 'Datos' },
  { name: 'SQLite', level: 60, icon: 'sqlite', family: 'Datos' },
  { name: 'Docker', level: 10, icon: 'docker', family: 'DevOps' },
  { name: 'Linux', level: 25, icon: 'linux', family: 'DevOps' },
  { name: 'Bash', level: 25, icon: 'bash', family: 'DevOps' },
  { name: 'Git', level: 90, icon: 'git', family: 'Herramientas' },
  { name: 'GitHub', level: 90, icon: 'github', family: 'Herramientas' },
  { name: 'npm', level: 70, icon: 'npm', family: 'Herramientas' },
  { name: 'pnpm', level: 70, icon: 'pnpm', family: 'Herramientas' },
  { name: 'TOML', level: 70, icon: 'toml', family: 'Herramientas' },
  { name: 'JSON', level: 70, icon: 'json', family: 'Herramientas' },
  { name: 'YAML', level: 70, icon: 'yaml', family: 'Herramientas' },
  { name: 'Prettier', level: 70, icon: 'prettier', family: 'Herramientas' },
  { name: 'ESLint', level: 70, icon: 'eslint', family: 'Herramientas' },
  { name: 'Ruff', level: 70, icon: 'ruff', family: 'Herramientas' },
];

export const PROFILE_TIMELINE = [
  { year: '2021', text: 'Empecé en el mundo de los juegos y la creación: Roblox y Lua/Luau, primeros mods y texturas.' },
  { year: '2022', text: 'Inicié desarrollo de software y proyectos propios: Python, HTML/CSS y scripts de automatización.' },
  { year: '2023', text: 'Fundé Ciszu Network. Primeros bots de Discord y herramientas digitales.' },
  { year: '2024', text: 'Expandí el ecosistema: MuzicMania, bots, servidores y contenido gaming. Creé librerías propias con Pip (CiszuPy).' },
  { year: '2025', text: 'Lancé MuzicMania como juego de ritmo y crecí la comunidad.' },
  { year: '2026', text: 'Consolidado como CEO y full-stack. Estudio en la UPTAG orientado a Ingeniería de Información y Sistemas.' },
];

export const PROFILE_FAMILIES: ProfileSkill['family'][] = ['Lenguajes', 'Frontend', 'Backend', 'Datos', 'DevOps', 'Herramientas'];