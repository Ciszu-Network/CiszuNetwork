// Galería de certificados de Ciszuko Antony.
// Fuente: archivos reales en shared/docs/certificados (espejados al CDN ciszu-cdn).
// Solo se declaran datos verificables de cada documento (título, emisor, fecha,
// ID) extraídos del propio PDF. Nada inventado ni atribuido sin prueba.

export type CertKind = 'certificate' | 'credential' | 'transcript' | 'report' | 'image';

export type CertFile = { name: string; label: string; kind?: CertKind };

export type Certificate = {
  id: string;
  title: string;
  provider: string;
  providerUrl?: string;
  category: string;
  date?: string; // ISO yyyy-mm-dd (o null si no figura en el documento)
  dateText?: string; // texto literal alternativo
  level?: string;
  summary?: string;
  credentialId?: string;
  credentialLabel?: string;
  note?: string; // aclaración honesta (emisor no indicado, etc.)
  collection?: { id: string; name: string };
  verify?: { label: string; url: string }[];
  files: CertFile[];
  thumbnail?: string; // preview image/screenshot
  previewType?: 'image' | 'pdf' | 'document'; // tipo de previsualización
};

export type Category = { id: string; label: string; color: string };

export const CATEGORIES: Category[] = [
  { id: 'english', label: 'English / Languages', color: '#22d3ee' },
  { id: 'programming', label: 'Programming', color: '#34d399' },
  { id: 'web', label: 'Web & Frontend', color: '#60a5fa' },
  { id: 'ai', label: 'Artificial Intelligence', color: '#a78bfa' },
  { id: 'cloud', label: 'Cloud & IT Foundations', color: '#38bdf8' },
  { id: 'digital', label: 'Digital Skills', color: '#f472b6' },
  { id: 'design', label: 'Design, UX & Video', color: '#fb923c' },
  { id: 'marketing', label: 'Marketing & Growth', color: '#facc15' },
  { id: 'finance', label: 'Personal Finance', color: '#4ade80' },
  { id: 'personal', label: 'Personal', color: '#ec4899' },
  { id: 'bachillerato', label: 'Bachillerato', color: '#8b5cf6' },
  { id: 'other', label: 'Other Documents', color: '#94a3b8' },
];

export const OFFICIAL_LINKS = [
  { label: 'EF SET English Certificate — verify online', url: 'https://cert.efset.org/en/WMJgBe' },
  { label: 'Simplilearn — certificate (online link)', url: 'https://simpli-web.app.link/e/aaWENDBP75b' },
];

const CISCO = { id: 'cisco-sfa', name: 'Cisco Networking Academy · Skills for All' };
const MSLEARN = { id: 'microsoft-learn', name: 'Microsoft Learn' };
const IBM = { id: 'ibm-skillsbuild', name: 'IBM SkillsBuild' };
const ES = { id: 'cursos-online-es', name: 'Courses — completion certificates (ES)' };

export const CERTIFICATES: Certificate[] = [
  // ───────────────────────────── Inglés ─────────────────────────────
  {
    id: 'ef-set-b1',
    title: 'EF SET English Certificate',
    provider: 'EF SET (Education First)',
    providerUrl: 'https://www.efset.org',
    category: 'english',
    date: '2026-09-03',
    level: 'B1 Intermediate — 43/100',
    summary: 'English certificate awarded after the official EF SET assessment.',
    credentialId: 'WMJgBe',
    credentialLabel: 'Verification code',
    verify: [{ label: 'Verify on cert.efset.org', url: 'https://cert.efset.org/en/WMJgBe' }],
    collection: { id: 'ef-set', name: 'EF SET Certificate (B1)' },
    files: [
      { name: 'EF SET Certificate.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'EF-SET-Certificate-full.pdf', label: 'Full document', kind: 'credential' },
      { name: 'EF-SET-Certificate-score.pdf', label: 'Score report', kind: 'report' },
      { name: 'ef_set_completation_english.pdf', label: 'Completion notice', kind: 'credential' },
    ],
    thumbnail: 'shared/docs/certificados/previews/efset-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'penn-elp-english-fundamentals',
    title: 'English Fundamentals — Boost Your Job Search and CV',
    provider: 'University of Pennsylvania · English Language Programs (Penn ELP)',
    providerUrl: 'https://www.elp.upenn.edu',
    category: 'english',
    date: '2026-09-03',
    summary: 'Online English course with certification. Content by Penn ELP English Language Programs.',
    credentialId: 'OA-2026-0903003148449',
    credentialLabel: 'Serial number',
    collection: { id: 'penn-elp', name: 'Penn ELP — English courses' },
    files: [
      { name: '896_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'spoken-english',
    title: 'Spoken English Course',
    provider: 'Online English course',
    category: 'english',
    date: '2026-09-03',
    summary: 'Spoken English completion certificate.',
    credentialId: '10686381',
    credentialLabel: 'Certificate code',
    note: 'The document does not state the issuing platform.',
    collection: { id: 'english-online', name: 'Online English certificates' },
    files: [
      { name: '10686381_11037949_1788416004123.pdf', label: 'Certificate', kind: 'certificate' },
    ],
  },

  // ─────────────────────── Cisco Networking Academy ───────────────────────
  {
    id: 'cisco-html',
    title: 'HTML Essentials',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'web',
    date: '2026-07-17',
    collection: CISCO,
    files: [
      { name: 'HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'HTMLEssentialsv120260717-8-l2ejk6.pdf', label: 'Credential record', kind: 'credential' },
    ],
    thumbnail: 'shared/docs/certificados/previews/cisco-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'cisco-css',
    title: 'CSS Essentials',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'web',
    date: '2026-07-19',
    collection: CISCO,
    files: [
      { name: 'CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'CSSEssentialsv120260719-8-1rzw7n.pdf', label: 'Credential record', kind: 'credential' },
    ],
  },
  {
    id: 'cisco-python1',
    title: 'Python Essentials 1 (Fundamentos de Python 1)',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'programming',
    date: '2026-06-25',
    collection: CISCO,
    files: [
      { name: 'Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'PythonEssentials1Update20260625-32-g4p28r.pdf', label: 'Credential record', kind: 'credential' },
    ],
  },
  {
    id: 'cisco-python2',
    title: 'Python Essentials 2 (Fundamentos de Python 2)',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'programming',
    date: '2026-07-21',
    collection: CISCO,
    files: [
      { name: 'Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'PythonEssentials2Update20260721-8-lly54c.pdf', label: 'Credential record', kind: 'credential' },
    ],
  },
  {
    id: 'cisco-ai',
    title: 'Introduction to Modern AI (Introducción a la IA moderna)',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'ai',
    date: '2026-06-28',
    collection: CISCO,
    files: [
      { name: 'Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'IntrotoModernAIUpdate20260628-32-qxbxrj.pdf', label: 'Credential record', kind: 'credential' },
    ],
  },
  {
    id: 'cisco-digital-awareness',
    title: 'Digital Awareness (Conciencia digital)',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'digital',
    date: '2026-06-25',
    collection: CISCO,
    files: [
      { name: 'Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6.pdf', label: 'Certificate', kind: 'certificate' },
      { name: 'DigitalAwarenessUpdate20260625-31-xone63.pdf', label: 'Credential record', kind: 'credential' },
    ],
  },

  // ─────────────────────────── Microsoft Learn ───────────────────────────
  {
    id: 'ms-cloud-advantages',
    title: 'Descripción de las ventajas de usar servicios en la nube',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'cloud',
    date: '2026-04-07',
    collection: MSLEARN,
    files: [
      { name: 'Logros - ciscoantonygarciam-8257 _ Microsoft Learn.pdf', label: 'Achievement', kind: 'credential' },
    ],
  },
  {
    id: 'ms-cloud-services',
    title: 'Descripción de los tipos de servicio en la nube',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'cloud',
    date: '2026-04-07',
    collection: MSLEARN,
    files: [
      { name: 'Logros - ciscoantonygarciam-8257 _ Microsoft Learn1.pdf', label: 'Achievement', kind: 'credential' },
    ],
  },
  {
    id: 'ms-cloud-infra',
    title: 'Introducción a la infraestructura en la nube: Descripción de los conceptos de la nube',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'cloud',
    date: '2026-04-07',
    collection: MSLEARN,
    files: [
      { name: 'Logros - ciscoantonygarciam-8257 _ Microsoft Learn2.pdf', label: 'Achievement', kind: 'credential' },
    ],
  },
  {
    id: 'ms-cloud-computing',
    title: 'Descripción de la informática en la nube',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'cloud',
    date: '2026-04-07',
    collection: MSLEARN,
    files: [
      { name: 'Logros - ciscoantonygarciam-8257 _ Microsoft Learn3.pdf', label: 'Achievement', kind: 'credential' },
    ],
  },

  // ─────────────────────────── IBM SkillsBuild ───────────────────────────
  {
    id: 'ibm-open-source',
    title: 'What is Open Source?',
    provider: 'IBM SkillsBuild',
    providerUrl: 'https://skillsbuild.org',
    category: 'programming',
    date: '2026-04-08',
    collection: IBM,
    files: [
      { name: 'Certificado de finalizacion _ SkillsBuild.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'ibm-intro-it',
    title: 'Introduction to IT (Codecademy)',
    provider: 'IBM SkillsBuild',
    providerUrl: 'https://skillsbuild.org',
    category: 'cloud',
    date: '2026-04-08',
    collection: IBM,
    files: [
      { name: 'Certificado de finalizacion _ SkillsBuild1.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'ibm-ux',
    title: 'UX Basics: Study Guide (Nielsen Norman Group)',
    provider: 'IBM SkillsBuild',
    providerUrl: 'https://skillsbuild.org',
    category: 'design',
    date: '2026-04-08',
    collection: IBM,
    files: [
      { name: 'Certificado de finalizacion _ SkillsBuild2.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'ibm-digital-marketing',
    title: 'What is Digital Marketing?',
    provider: 'IBM SkillsBuild',
    providerUrl: 'https://skillsbuild.org',
    category: 'marketing',
    date: '2026-04-08',
    collection: IBM,
    files: [
      { name: 'Certificado de finalizacion _ mSkillsBuild.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },

  // ──────────────── Cursos de formación en línea (ES) ────────────────
  {
    id: 'es-chatgpt',
    title: 'Curso completo de ChatGPT desde cero',
    provider: 'Online courses platform (ES)',
    category: 'ai',
    date: '2026-04-27',
    credentialId: 'cert_69f029fdaf676',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'chatgpt_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-ia-ingresos',
    title: 'Curso de Inteligencia Artificial desde cero',
    provider: 'Online courses platform (ES)',
    category: 'ai',
    date: '2026-04-27',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'iaingresosCertificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-python',
    title: 'Curso de programación en Python desde cero',
    provider: 'Online courses platform (ES)',
    category: 'programming',
    date: '2026-04-27',
    credentialId: 'cert_69f0187381762',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'phyton_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-ingles',
    title: 'Curso completo para aprender inglés desde cero',
    provider: 'Online courses platform (ES)',
    category: 'english',
    date: '2026-04-27',
    credentialId: 'cert_69f009e21e3a1',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'ingles_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-photoshop',
    title: 'Domina Photoshop como un profesional desde cero',
    provider: 'Online courses platform (ES)',
    category: 'design',
    date: '2026-04-27',
    credentialId: 'cert_69f0186d0afef',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'photoshop_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-capcut',
    title: 'Aprende a editar videos con CapCut desde cero',
    provider: 'Online courses platform (ES)',
    category: 'design',
    date: '2026-04-27',
    credentialId: 'cert_69f029d83f78f',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'capcut_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-edicion',
    title: 'Curso completo de Edición de Videos',
    provider: 'Online courses platform (ES)',
    category: 'design',
    date: '2026-04-27',
    credentialId: 'cert_69f01810ad5cf',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'edicion_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-youtube',
    title: 'Curso completo de YouTube desde cero',
    provider: 'Online courses platform (ES)',
    category: 'marketing',
    date: '2026-04-27',
    credentialId: 'cert_69f0299f9d761',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'youtube_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-autotub',
    title: 'Monetiza un canal automatizado de YouTube',
    provider: 'Online courses platform (ES)',
    category: 'marketing',
    date: '2026-04-27',
    credentialId: 'cert_69f029c416435',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'autotub_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },
  {
    id: 'es-finanzas',
    title: 'Domina tus finanzas personales desde cero',
    provider: 'Online courses platform (ES)',
    category: 'finance',
    date: '2026-04-27',
    credentialId: 'cert_69f017f8cfeb2',
    credentialLabel: 'Certificate ID',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [
      { name: 'finanzaspersonales_Certificado_Francisco Antonio Garcia Menolascina.pdf', label: 'Certificate of completion', kind: 'certificate' },
    ],
  },

  {
    id: '373-fplayersoffcial-gmail-com',
    title: '373 Fplayersoffcial@Gmail.Com',
    provider: 'Online course platform',
    category: 'ai',
    files: [{ name: '373_fplayersoffcial@gmail.com.pdf', label: '373 Fplayersoffcial@Gmail.Com', kind: 'certificate' }],
    previewType: 'pdf',
  },

  {
    id: '4080-fplayersoffcial-gmail-com',
    title: '4080 Fplayersoffcial@Gmail.Com',
    provider: 'Online course platform',
    category: 'ai',
    files: [{ name: '4080_fplayersoffcial@gmail.com.pdf', label: '4080 Fplayersoffcial@Gmail.Com', kind: 'certificate' }],
    previewType: 'pdf',
  },

  {
    id: '508-fplayersoffcial-gmail-com',
    title: '508 Fplayersoffcial@Gmail.Com',
    provider: 'Online course platform',
    category: 'ai',
    files: [{ name: '508_fplayersoffcial@gmail.com.pdf', label: '508 Fplayersoffcial@Gmail.Com', kind: 'certificate' }],
    previewType: 'pdf',
  }
];

// Documentos complementarios (transcripts, expedientes, perfiles): no son
// certificados, pero forman parte del entorno de certificados.
export const OTHER_DOCS: Certificate[] = [
  {
    id: 'cisco-transcript',
    title: 'Learning transcript — Cisco Networking Academy',
    provider: 'Cisco Networking Academy · Skills for All',
    providerUrl: 'https://skillsforall.com',
    category: 'other',
    date: '2026-07-21',
    summary: 'Transcript generated 21 Jul 2026 (email: fplayersoffcial@gmail.com).',
    collection: CISCO,
    files: [
      { name: 'learner_transcript.pdf', label: 'Transcript', kind: 'transcript' },
    ],
    thumbnail: 'shared/docs/certificados/previews/transcript-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'ms-expediente',
    title: 'Expediente — Microsoft Learn (CiscoAntonyGarciaM-8257)',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'other',
    summary: 'Profile record: 4 modules, 1 completed learning path (1 h 36 min).',
    credentialId: 'CiscoAntonyGarciaM-8257',
    credentialLabel: 'Microsoft Learn username',
    collection: MSLEARN,
    files: [
      { name: 'Expediente - CiscoAntonyGarciaM-8257 _ Microsoft Learn.pdf', label: 'Record (expediente)', kind: 'transcript' },
    ],
    thumbnail: 'shared/docs/certificados/previews/expediente-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: '16p-profile',
    title: 'Personality profile — Architect (INTJ-A)',
    provider: '16Personalities (NERIS Analytics Limited)',
    providerUrl: 'https://www.16personalities.com',
    category: 'personal',
    date: '2026-04-08',
    summary: 'Test taken on 8 abr 2026. Personality type: INTJ-A (Architect).',
    collection: { id: '16p', name: '16Personalities' },
    files: [
      { name: 'Tu perfil _ 16Personalities.pdf', label: 'Profile report', kind: 'report' },
    ],
    thumbnail: 'shared/docs/certificados/previews/personality-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'bachillerato-cert',
    title: 'Bachillerato Certificate',
    provider: 'Educational Institution',
    category: 'bachillerato',
    summary: 'High school graduation certificate.',
    files: [
      { name: 'dato (35).JPG', label: 'Certificate Image', kind: 'image' },
    ],
    thumbnail: 'shared/docs/certificados/dato (35).JPG',
    previewType: 'image',
  },
  {
    id: 'hp-live-transcript',
    title: 'Transcript — HP Live',
    provider: 'HP Life',
    providerUrl: 'https://www.hp.com/us-en/life.html',
    category: 'other',
    summary: 'Transcript document from HP Life learning platform.',
    files: [
      { name: 'transcript_hplive.pdf', label: 'Transcript', kind: 'transcript' },
    ],
    thumbnail: 'shared/docs/certificados/previews/transcript-hplive-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'ciencia-datos',
    title: 'Ciencia y Análisis de Datos',
    provider: 'Online course platform',
    category: 'programming',
    summary: 'Data science and analytics course completion document.',
    files: [
      { name: 'Ciencia y Análisis de Datos.pdf', label: 'Certificate', kind: 'certificate' },
    ],
    thumbnail: 'shared/docs/certificados/previews/ciencia-datos-preview.jpg',
    previewType: 'pdf',
  },
  {
    id: 'course-109',
    title: 'Course 109 — Fplayersoffcial@gmail.com',
    provider: 'Online course platform',
    category: 'other',
    files: [{ name: '109_fplayersoffcial@gmail.com.pdf', label: 'Certificate 109', kind: 'certificate' }],
    previewType: 'pdf',
  },
  {
    id: 'course-373',
    title: 'Course 373 — Fplayersoffcial@gmail.com',
    provider: 'Online course platform',
    category: 'other',
    files: [{ name: '373_fplayersoffcial@gmail.com.pdf', label: 'Certificate 373', kind: 'certificate' }],
    previewType: 'pdf',
  },
  {
    id: 'course-4080',
    title: 'Course 4080 — Fplayersoffcial@gmail.com',
    provider: 'Online course platform',
    category: 'other',
    files: [{ name: '4080_fplayersoffcial@gmail.com.pdf', label: 'Certificate 4080', kind: 'certificate' }],
    previewType: 'pdf',
  },
  {
    id: 'course-508',
    title: 'Course 508 — Fplayersoffcial@gmail.com',
    provider: 'Online course platform',
    category: 'other',
    files: [{ name: '508_fplayersoffcial@gmail.com.pdf', label: 'Certificate 508', kind: 'certificate' }],
    previewType: 'pdf',
  }
];
