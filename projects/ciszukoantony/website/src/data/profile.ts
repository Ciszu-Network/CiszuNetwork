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

/** Marca/herramienta/programa con nivel, degradado dinámico y tags. */
export type ProfileBrand = {
  icon: string;
  name: string;
  /** Nivel autodeclarado de dominio (0-100). */
  level: number;
  /** Clases Tailwind del degradado de la barra (dinámico por marca). */
  gradient: string;
  /** Tags cortos de lo que se hace con ella. */
  tags: string[];
};

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

export const PROFILE_TOOLS: ProfileBrand[] = [
  { icon: 'adobe', name: 'Suite Adobe', level: 80, gradient: 'from-red-600 via-rose-500 to-orange-400', tags: ['Photoshop', 'Illustrator', 'After Effects'] },
  { icon: 'affinity', name: 'Affinity', level: 70, gradient: 'from-sky-600 via-blue-500 to-cyan-400', tags: ['Photo', 'Designer', 'Publisher'] },
  { icon: 'coreldraw', name: 'CorelDRAW', level: 75, gradient: 'from-emerald-600 via-green-500 to-lime-400', tags: ['Vector', 'Diseño', 'Suite Corel'] },
  { icon: 'davinciresolve', name: 'DaVinci Resolve', level: 60, gradient: 'from-zinc-700 via-zinc-500 to-zinc-300', tags: ['Edición', 'Color', 'Profesional'] },
  { icon: 'filmora', name: 'Filmora', level: 65, gradient: 'from-indigo-600 via-violet-500 to-purple-400', tags: ['Edición', 'Vídeo', 'Transiciones'] },
  { icon: 'capcut', name: 'CapCut', level: 75, gradient: 'from-slate-800 via-slate-600 to-slate-400', tags: ['Edición rápida', 'Vertical', 'Mobile'] },
  { icon: 'microsoftoffice', name: 'Office', level: 70, gradient: 'from-red-600 via-orange-500 to-amber-400', tags: ['Word', 'Excel', 'PowerPoint'] },
  { icon: 'visualstudiocode', name: 'VS Code', level: 85, gradient: 'from-sky-600 via-blue-500 to-indigo-400', tags: ['Editor', 'JS/TS', 'Extensiones'] },
];

export const PROFILE_BROWSERS: ProfileBrand[] = [
  { icon: 'torproject', name: 'Tor', level: 55, gradient: 'from-purple-700 via-violet-500 to-indigo-400', tags: ['Privacidad', 'Anonimato'] },
  { icon: 'brave', name: 'Brave', level: 60, gradient: 'from-orange-600 via-amber-500 to-yellow-400', tags: ['Seguro', 'Ads bloqueados'] },
  { icon: 'operagx', name: 'Opera GX', level: 85, gradient: 'from-rose-600 via-red-500 to-orange-400', tags: ['Principal', 'Gaming', 'GX'] },
  { icon: 'googlechrome', name: 'Chrome', level: 70, gradient: 'from-green-600 via-emerald-500 to-teal-400', tags: ['Pruebas', 'DevTools'] },
  { icon: 'firefox', name: 'Firefox', level: 65, gradient: 'from-orange-600 via-amber-500 to-yellow-500', tags: ['Pruebas', 'Privacidad'] },
  { icon: 'microsoftedge', name: 'Edge', level: 60, gradient: 'from-cyan-600 via-sky-500 to-blue-400', tags: ['Default', 'Lectura'] },
];

export const PROFILE_AI: ProfileBrand[] = [
  { icon: 'googlegemini', name: 'Gemini', level: 85, gradient: 'from-blue-600 via-cyan-500 to-violet-500', tags: ['Google', 'Multimodal', 'Principal'] },
  { icon: 'deepseek', name: 'DeepSeek', level: 80, gradient: 'from-blue-700 via-indigo-500 to-violet-400', tags: ['Razonamiento', 'Código'] },
  { icon: 'anthropic', name: 'Claude', level: 75, gradient: 'from-orange-700 via-amber-600 to-yellow-500', tags: ['Análisis', 'Escritura'] },
  { icon: 'openai', name: 'ChatGPT', level: 80, gradient: 'from-teal-600 via-emerald-500 to-green-400', tags: ['Generalista', 'Productividad'] },
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

export const PROFILE_PLATFORMS: ProfileBrand[] = [
  { icon: 'vercel', name: 'Vercel', level: 80, gradient: 'from-zinc-700 via-zinc-500 to-zinc-300', tags: ['Deploy'] },
  { icon: 'supabase', name: 'Supabase', level: 75, gradient: 'from-emerald-700 via-green-500 to-teal-400', tags: ['Backend', 'DB'] },
  { icon: 'github', name: 'GitHub Pages', level: 70, gradient: 'from-gray-700 via-gray-500 to-gray-300', tags: ['Static', 'Deploy'] },
  { icon: 'cloudflare', name: 'Cloudflare', level: 65, gradient: 'from-orange-700 via-amber-500 to-yellow-400', tags: ['CDN', 'Turnstile'] },
  { icon: 'nextdotjs', name: 'Next.js', level: 75, gradient: 'from-slate-800 via-slate-600 to-slate-400', tags: ['Framework'] },
  { icon: 'googledocs', name: 'Google Cloud', level: 60, gradient: 'from-sky-700 via-blue-500 to-indigo-400', tags: ['Cloud', 'GCP'] },
  { icon: 'notion', name: 'Notion', level: 70, gradient: 'from-gray-800 via-gray-600 to-gray-400', tags: ['Docs', 'Plan'] },
  { icon: 'trello', name: 'Trello', level: 65, gradient: 'from-sky-700 via-blue-500 to-cyan-400', tags: ['Kanban', 'Tareas'] },
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