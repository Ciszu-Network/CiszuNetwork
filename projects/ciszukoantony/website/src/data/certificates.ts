// Galería de certificados de Ciszuko Antony.
// Fuente: archivos reales en shared/docs/certificados (espejados al CDN ciszu-cdn).
// Solo se declaran datos verificables de cada documento (título, emisor, fecha,
// ID) extraídos del propio PDF con `pdftotext`. Nada inventado ni atribuido sin
// prueba: cuando el documento no indica emisor o fecha, se anota explícitamente.
//
// NOMENCLATURA DE CATÁLOGO
// Cada documento recibe un código estable `CKO-<EMISOR>-<AAAA>-<NNN>` calculado
// a partir del emisor real y del año del documento (ver `catalogRef`). Es una
// referencia INTERNA de indexación — sirve para ordenar, filtrar y citar cada
// documento sin ambigüedad. No es un número emitido por la institución: ese vive
// en `credentialId`, copiado literalmente del documento.

export type CertKind = 'certificate' | 'credential' | 'transcript' | 'report' | 'image';

export type CertFile = { name: string; label: string; kind?: CertKind };

export type Certificate = {
  id: string; // slug legible y único (usado en la URL #ancla)
  title: string; // nombre REAL del curso/documento, detectado del contenido
  provider: string; // emisor real (institución o plataforma)
  providerUrl?: string;
  category: string;
  date?: string; // ISO yyyy-mm-dd, verificado en el documento
  dateText?: string; // texto literal alternativo cuando el formato no es ISO
  level?: string;
  summary?: string;
  credentialId?: string; // ID/serial literal del documento (no inventado)
  credentialLabel?: string;
  note?: string; // aclaración honesta (emisor no indicado, etc.)
  collection?: { id: string; name: string };
  verify?: { label: string; url: string }[];
  files: CertFile[];
  thumbnail?: string; // preview image/screenshot
  previewType?: 'image' | 'pdf' | 'document'; // tipo de previsualización
  holderName?: string; // nombre del titular del certificado
};

export type Category = { id: string; label: string; color: string };

export const CATEGORIES: Category[] = [
  { id: 'english', label: 'English / Languages', color: '#22d3ee' },
  { id: 'programming', label: 'Programming & Data', color: '#34d399' },
  { id: 'web', label: 'Web & Frontend', color: '#60a5fa' },
  { id: 'ai', label: 'Artificial Intelligence', color: '#a78bfa' },
  { id: 'cloud', label: 'Cloud, IT & Security', color: '#38bdf8' },
  { id: 'digital', label: 'Digital Skills', color: '#f472b6' },
  { id: 'design', label: 'Design, UX & Video', color: '#fb923c' },
  { id: 'marketing', label: 'Marketing & Growth', color: '#facc15' },
  { id: 'finance', label: 'Finance & Business', color: '#4ade80' },
  { id: 'personal', label: 'Personal & Soft Skills', color: '#ec4899' },
  { id: 'bachillerato', label: 'Bachillerato', color: '#8b5cf6' },
  { id: 'other', label: 'Other Documents', color: '#94a3b8' },
];

export const OFFICIAL_LINKS = [
  { label: 'EF SET English Certificate — verify online', url: 'https://cert.efset.org/en/WMJgBe' },
  { label: 'Simplilearn — certificate (online link)', url: 'https://simpli-web.app.link/e/aaWENDBP75b' },
];

export const PROVIDER_OPTIONS = [
  { id: 'cisco', label: 'Cisco Networking Academy', color: '#1B75BC' },
  { id: 'microsoft', label: 'Microsoft Learn', color: '#0078D4' },
  { id: 'ibm', label: 'IBM SkillsBuild', color: '#0096D6' },
  { id: 'hp', label: 'HP LIFE (HP Foundation)', color: '#0096D6' },
  { id: 'ef-set', label: 'EF SET (Education First)', color: '#00A3E0' },
  { id: 'penn-elp', label: 'University of Pennsylvania (Penn ELP)', color: '#990000' },
  { id: '16personalities', label: '16Personalities (NERIS Analytics)', color: '#00C9A7' },
  { id: 'online-es', label: 'Online Courses Platform (ES)', color: '#F472B6' },
  { id: 'other', label: 'Other / Unknown', color: '#94A3B8' },
];

export const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Date ↓ (Newest first)', fn: (a: Certificate, b: Certificate) => (b.date || '').localeCompare(a.date || '') },
  { id: 'date-asc', label: 'Date ↑ (Oldest first)', fn: (a: Certificate, b: Certificate) => (a.date || '').localeCompare(b.date || '') },
  { id: 'alpha-asc', label: 'A–Z', fn: (a: Certificate, b: Certificate) => a.title.localeCompare(b.title) },
  { id: 'alpha-desc', label: 'Z–A', fn: (a: Certificate, b: Certificate) => b.title.localeCompare(a.title) },
  { id: 'ref-asc', label: 'Catalog ref ↑', fn: (a: Certificate, b: Certificate) => catalogRef(a).localeCompare(catalogRef(b)) },
  { id: 'provider', label: 'Provider', fn: (a: Certificate, b: Certificate) => a.provider.localeCompare(b.provider) },
  { id: 'category', label: 'Category', fn: (a: Certificate, b: Certificate) => catLabel(a.category).localeCompare(catLabel(b.category)) },
];

export const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label || id;

const CISCO = { id: 'cisco-sfa', name: 'Cisco Networking Academy · Skills for All' };
const MSLEARN = { id: 'microsoft-learn', name: 'Microsoft Learn' };
const IBM = { id: 'ibm-skillsbuild', name: 'IBM SkillsBuild' };
const HP = { id: 'hp-life', name: 'HP LIFE — HP Foundation' };
const ES = { id: 'cursos-online-es', name: 'Online Courses Platform (ES) — serial OA-*' };

// Emisor → sigla usada en la nomenclatura de catálogo.
// Los emisores nombrados se resuelven por nombre; las plataformas sin marca
// (que no indican emisor en el documento) se distinguen por el prefijo de su
// ID real, para no mezclar catálogos distintos en un mismo código.
const ISSUER_CODES: { match: RegExp; code: string }[] = [
  { match: /cisco/i, code: 'CSCO' },
  { match: /microsoft/i, code: 'MSFT' },
  { match: /ibm|skillsbuild/i, code: 'IBM' },
  { match: /hp\s?life|\bhp\b/i, code: 'HP' },
  { match: /ef\s?set|efset/i, code: 'EFSET' },
  { match: /penn/i, code: 'PENN' },
  { match: /16personalities|neris/i, code: '16P' },
  { match: /simplilearn/i, code: 'SMPL' },
  { match: /online english/i, code: 'OEN' },
  { match: /online courses platform/i, code: 'OAC' },
  { match: /online/i, code: 'ONL' },
];

export const issuerCode = (doc: { provider: string; credentialId?: string }): string => {
  const id = doc.credentialId || '';
  if (/^OA-/i.test(id)) return 'OAC'; // plataforma de seriales OA-YYYY-*
  if (/^cert_/i.test(id)) return 'OLC'; // plataforma de IDs cert_*
  return ISSUER_CODES.find((i) => i.match.test(doc.provider))?.code || 'GEN';
};

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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'spoken-english',
    title: 'Spoken English Course',
    provider: 'Online English course (unnamed platform)',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-business-english-1',
    title: 'Business English, Part 1',
    provider: 'Online Courses Platform (ES)',
    category: 'english',
    date: '2026-09-04',
    summary: 'Business English (part 1) · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0904003152939',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '373_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },

  // ─────────── Online Courses Platform (ES) — seriales OA-* verificados ───────────
  {
    id: 'oac-python',
    title: 'Python',
    provider: 'Online Courses Platform (ES)',
    category: 'programming',
    date: '2026-09-04',
    summary: 'Python course · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0904003152762',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '508_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-intro-data-science',
    title: 'Introducción a la Ciencia de Datos',
    provider: 'Online Courses Platform (ES)',
    category: 'programming',
    date: '2026-09-04',
    summary: 'Data science fundamentals · 6.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0904003153191',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '109_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-cybersecurity-fundamentals',
    title: 'Fundamentos de ciberseguridad',
    provider: 'Online Courses Platform (ES)',
    category: 'cloud',
    date: '2026-09-04',
    summary: 'Cybersecurity fundamentals · 1.5 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0904003153140',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '4080_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-storytelling-marketing',
    title: 'Storytelling en el Marketing Digital',
    provider: 'Online Courses Platform (ES)',
    category: 'marketing',
    date: '2026-09-04',
    summary: 'Digital marketing storytelling · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0904003155161',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '107_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-social-media-ads',
    title: 'Publicidad en redes sociales',
    provider: 'Online Courses Platform (ES)',
    category: 'marketing',
    date: '2026-09-05',
    summary: 'Social media advertising · 5.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003156167',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '1141_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-agile-project-management',
    title: 'Gestión de Proyectos y Fundamentos de metodología Agile',
    provider: 'Online Courses Platform (ES)',
    category: 'digital',
    date: '2026-09-05',
    summary: 'Project management & Agile fundamentals · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003157014',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '171_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-excel-intermediate-advanced',
    title: 'Excel — de intermedio a avanzado',
    provider: 'Online Courses Platform (ES)',
    category: 'digital',
    date: '2026-09-05',
    summary: 'Excel intermediate to advanced · 8 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003156540',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '1852_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-digital-advertising-ai-law',
    title: 'Publicidad digital: datos, IA y legalidad',
    provider: 'Online Courses Platform (ES)',
    category: 'marketing',
    date: '2026-09-05',
    summary: 'Digital advertising: data, AI and legal aspects · 8 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003156883',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '3030_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-creative-thinking',
    title: 'Pensamiento creativo',
    provider: 'Online Courses Platform (ES)',
    category: 'personal',
    date: '2026-09-05',
    summary: 'Creative thinking · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003156957',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '3296_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-critical-thinking',
    title: 'Pensamiento crítico y resolución de problemas',
    provider: 'Online Courses Platform (ES)',
    category: 'personal',
    date: '2026-09-05',
    summary: 'Critical thinking & problem solving · 8.0 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0905003156987',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '582_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-seo-content-marketing',
    title: 'SEO y content marketing',
    provider: 'Online Courses Platform (ES)',
    category: 'marketing',
    date: '2026-09-06',
    summary: 'SEO & content marketing · 8 hours · 2 modules · self-assessment.',
    credentialId: 'OA-2026-0906003159459',
    credentialLabel: 'Serial number',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '1108_fplayersoffcial@gmail.com.pdf', label: 'Certificate of completion', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'oac-python-for-beginners',
    title: 'Python for Beginners',
    provider: 'Online course platform (unnamed)',
    category: 'programming',
    date: '2026-09-14',
    summary: 'Introductory Python course.',
    credentialId: '10728403',
    credentialLabel: 'Certificate code',
    note: 'The document does not state the issuing platform.',
    collection: ES,
    files: [{ name: '10728403_11037949_1789365127912.pdf', label: 'Certificate', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
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
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },

  // ────────────────────── HP LIFE (HP Foundation) ──────────────────────
  {
    id: 'hp-data-science',
    title: 'Ciencia y Análisis de Datos',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'programming',
    date: '2026-09-04',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '218b91cd-0a6d-42c7-ab9d-27c4b5353aa5',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Ciencia y Analisis de Datos.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-business-communication',
    title: 'Comunicación Empresarial',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'digital',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '2bb4827b-8a3c-4a94-aac6-3188e67d09d3',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Comunicacion Empresarial.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-social-media-marketing',
    title: 'Marketing de Medios Sociales',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'marketing',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '1e5acead-28e2-4ded-90a4-2da1b33d3022',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Marketing de Medios Sociales.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-financing',
    title: 'Encontrar Financiamiento',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'finance',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '7b6e7bc8-f420-4795-9228-a6b2a04fe136',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Encontrar Financiamiento.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-digital-business-skills',
    title: 'Introducción a Destrezas Empresariales Digitales',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'digital',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '83bd2739-b26f-4029-a0b2-9e8332cc463e',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Introduccion a Destrezas Empresariales Digitales.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-cybersecurity-awareness',
    title: 'Introducción al Conocimiento de la Ciberseguridad',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'cloud',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: 'a6e26a8b-1c2c-4750-b540-8e950f1fa6f1',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Introduccion al Conocimiento de la Ciberseguridad.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-strategic-planning-ai',
    title: 'La planificación estratégica en la era de la IA',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'ai',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: 'aec08a2a-806b-43e3-ae0c-4c40bf4a7fad',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'La planificacion estrategica en la era de la IA.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-customer-experience',
    title: 'Experiencia del Cliente (CX) para el éxito comercial',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'marketing',
    date: '2026-09-05',
    summary: 'Curso en línea de HP LIFE · certificación de finalización.',
    credentialId: '9537df61-8c90-4435-819e-594b521330e1',
    credentialLabel: 'Serial number',
    collection: HP,
    files: [{ name: 'Experiencia del cliente (CX) para el exito comercial.pdf', label: 'Certificación de finalización', kind: 'certificate' }],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
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
    summary: 'Transcript generado el 21 Jul 2026 (email: fplayersoffcial@gmail.com). Lista CSS Essentials, Introduction to Modern AI, HTML Essentials y Digital Awareness.',
    collection: CISCO,
    files: [
      { name: 'learner_transcript.pdf', label: 'Transcript', kind: 'transcript' },
    ],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'ms-expediente',
    title: 'Expediente — Microsoft Learn (CiscoAntonyGarciaM-8257)',
    provider: 'Microsoft Learn',
    providerUrl: 'https://learn.microsoft.com',
    category: 'other',
    date: '2025-01-15',
    summary: 'Profile record: 4 modules, 1 completed learning path (1 h 36 min).',
    credentialId: 'CiscoAntonyGarciaM-8257',
    credentialLabel: 'Microsoft Learn username',
    collection: MSLEARN,
    files: [
      { name: 'Expediente - CiscoAntonyGarciaM-8257 _ Microsoft Learn.pdf', label: 'Record (expediente)', kind: 'transcript' },
    ],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: '16p-profile',
    title: 'Personality profile — Arquitecto (INTJ-A)',
    provider: '16Personalities (NERIS Analytics Limited)',
    providerUrl: 'https://www.16personalities.com',
    category: 'personal',
    date: '2026-04-08',
    summary: 'Test taken on 8 abr 2026. Personality type: INTJ-A (Arquitecto/Architect).',
    collection: { id: '16p', name: '16Personalities' },
    files: [
      { name: 'Tu perfil _ 16Personalities.pdf', label: 'Profile report', kind: 'report' },
    ],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'bachillerato-cert',
    title: 'Bachillerato — Diploma de graduación',
    provider: 'Institución educativa (documento censurado)',
    category: 'bachillerato',
    note: 'El PDF/JPG está censurado: la fecha impresa no es legible por extracción automática, por eso no se declara una fecha que no podemos verificar.',
    summary: 'Documento de graduación de bachillerato.',
    files: [
      { name: 'diploma_certificado_bachillerato_monsecastro_censored.jpg', label: 'Certificate image', kind: 'image' },
    ],
    previewType: 'image',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-transcript-full',
    title: 'HP LIFE — Academic transcript (8 courses)',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'other',
    date: '2026-09-05',
    summary: 'Expediente académico HP LIFE con 8 cursos completados entre el 4 y el 5 de septiembre de 2026.',
    collection: HP,
    files: [
      { name: 'transcript.pdf', label: 'Transcript (expediente académico)', kind: 'transcript' },
    ],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
  {
    id: 'hp-transcript-data-science',
    title: 'HP LIFE — Course transcript (Ciencia y Análisis de Datos)',
    provider: 'HP LIFE (HP Foundation)',
    providerUrl: 'https://www.life-global.org',
    category: 'other',
    date: '2026-09-04',
    summary: 'Expediente académico HP LIFE con un único curso completado el 4/9/2026.',
    collection: HP,
    files: [
      { name: 'transcript_hplive.pdf', label: 'Transcript', kind: 'transcript' },
    ],
    previewType: 'pdf',
    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',
  },
];

// ───────────────────── Índice de catálogo (nomenclatura) ─────────────────────
// `CKO-<EMISOR>-<AAAA>-<NNN>`, asignado por emisor+año en orden cronológico.
// Es determinista: mientras no cambien emisor ni fecha del documento, el código
// es estable. Se calcula una sola vez en el arranque del módulo.
export function buildCatalogRefs(docs: Certificate[]): Record<string, string> {
  const counters = new Map<string, number>();
  const sorted = [...docs].sort(
    (a, b) => (a.date || '0000').localeCompare(b.date || '0000') || a.title.localeCompare(b.title),
  );
  const refs: Record<string, string> = {};
  for (const d of sorted) {
    const year = (d.date || '0000').slice(0, 4);
    const base = `${issuerCode(d)}-${year}`;
    const n = (counters.get(base) || 0) + 1;
    counters.set(base, n);
    refs[d.id] = `CKO-${base}-${String(n).padStart(3, '0')}`;
  }
  return refs;
}

export const ALL_DOCUMENTS: Certificate[] = [...CERTIFICATES, ...OTHER_DOCS];
export const CATALOG_REFS: Record<string, string> = buildCatalogRefs(ALL_DOCUMENTS);
export const catalogRef = (c: Certificate): string => CATALOG_REFS[c.id] || c.id;
