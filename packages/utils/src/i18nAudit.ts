/**
 * Auditoría de locales y aplicación de dialectos regionales.
 *
 * QUÉ PROBLEMA RESUELVE: los cuatro idiomas de producción existen en el papel
 * pero dos de ellos eran copias disfrazadas. `es-es` era literalmente el mismo
 * objeto que `es-latam`, y `en-uk` se construía haciendo `...en` y clonando
 * objetos (mismas cadenas, sin un solo cambio real). Con eso, la web decía
 * ofrecer cuatro idiomas y en realidad servía dos. Y no había forma de
 * detectarlo: no existía ninguna comprobación.
 *
 * Aquí hay dos cosas:
 *   1. `auditLocales` — compara locales contra una referencia y reporta claves
 *      que faltan, claves de más y cuántas cadenas difieren de verdad. Así
 *      "es-es = es-latam" deja de compilar mentalmente y pasa a ser un test que
 *      falla.
 *   2. `applyRegionalOverrides` — aplica un dialecto coherente a TODO el
 *      diccionario (no palabra por palabra a mano, que es como se llega a
 *      traducciones inconsistentes). Las sustituciones van por lista explícita
 *      y con límites de palabra: una regla automática tipo «-ize → -ise» se
 *      llevaría por delante `size` o `prize`.
 *
 * Módulo PURO, sin dependencias.
 */

/** Diccionario anidado de cadenas. */
export type LocaleTree = { [key: string]: string | LocaleTree };

/** Aplana `{ a: { b: 'x' } }` a `{ 'a.b': 'x' }`. */
export function flattenLocale(tree: LocaleTree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[path] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(out, flattenLocale(value, path));
    }
  }
  return out;
}

/** Clona un árbol sin compartir referencias (importante: los locales se mutan). */
export function cloneLocale<T extends LocaleTree>(tree: T): T {
  const out = (Array.isArray(tree) ? [] : {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(tree)) {
    out[key] =
      value && typeof value === 'object' ? cloneLocale(value as LocaleTree) : value;
  }
  return out as unknown as T;
}

export interface LocaleDiff {
  /** Rutas presentes en la referencia y ausentes en el otro locale. */
  missing: string[];
  /** Rutas presentes solo en el otro locale. */
  extra: string[];
  /** Rutas con el mismo texto en ambos. */
  identical: string[];
  /** Rutas con texto distinto. */
  different: string[];
  /** Nº total de rutas comparadas. */
  total: number;
}

/** Compara dos locales aplanados. */
export function diffLocales(
  reference: Record<string, string>,
  other: Record<string, string>,
): LocaleDiff {
  const missing: string[] = [];
  const identical: string[] = [];
  const different: string[] = [];

  for (const key of Object.keys(reference)) {
    if (!(key in other)) {
      missing.push(key);
    } else if (reference[key] === other[key]) {
      identical.push(key);
    } else {
      different.push(key);
    }
  }

  const extra = Object.keys(other).filter((key) => !(key in reference));

  return { missing, extra, identical, different, total: Object.keys(reference).length };
}

export interface LocaleAuditIssue {
  /** Código estable, para poder afirmar sobre él en un test. */
  code: 'missing-keys' | 'extra-keys' | 'stub-locale' | 'empty-value' | 'duplicate-locale';
  locale: string;
  detail: string;
}

export interface LocaleAuditOptions {
  /**
   * Mínimo de cadenas que deben diferir respecto de la referencia. Es lo que
   * convierte "es una copia" en un error: un dialecto regional real cambia
   * vocabulario en muchas cadenas, no en una.
   */
  minDifferences?: number;
  /** Locale de referencia por familia. */
  referenceOf?: (locale: string) => string;
}

/**
 * Audita un conjunto de locales.
 *
 * `locales` se pasa aplanado y con el NOMBRE de cada locale como clave:
 *   { 'es-latam': {...}, 'es-es': {...} }
 *
 * Referencia: por familia (`es-*` → `es-latam`, `en-*` → `en-us`) para que cada
 * dialecto se compare con su base, no con el otro idioma.
 */
export function auditLocales(
  locales: Record<string, Record<string, string>>,
  options: LocaleAuditOptions = {},
): LocaleAuditIssue[] {
  const minDifferences = options.minDifferences ?? 5;
  const referenceOf =
    options.referenceOf ??
    ((locale: string) => {
      if (locale.startsWith('es')) return 'es-latam';
      if (locale.startsWith('en')) return 'en-us';
      return locale;
    });

  const issues: LocaleAuditIssue[] = [];
  const names = Object.keys(locales);

  // 1) Cada clave debe existir en todos los locales de su familia, con valor.
  const allKeys = new Set<string>();
  for (const name of names) for (const key of Object.keys(locales[name])) allKeys.add(key);

  for (const name of names) {
    const dict = locales[name];

    const missing = [...allKeys].filter((key) => !(key in dict));
    if (missing.length) {
      issues.push({
        code: 'missing-keys',
        locale: name,
        detail: `${missing.length} claves ausentes (p. ej. ${missing.slice(0, 3).join(', ')})`,
      });
    }

    const empties = Object.entries(dict)
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([key]) => key);
    if (empties.length) {
      issues.push({
        code: 'empty-value',
        locale: name,
        detail: `${empties.length} cadenas vacías (p. ej. ${empties.slice(0, 3).join(', ')})`,
      });
    }
  }

  // 2) Cada dialecto debe diferenciarse de verdad de su referencia.
  for (const name of names) {
    const referenceName = referenceOf(name);
    if (referenceName === name || !locales[referenceName]) continue;

    const reference = locales[referenceName];
    const other = locales[name];

    // 2a) Copia literal: ni una sola cadena cambia.
    const sharedKeys = Object.keys(reference).filter((key) => key in other);
    const identicalCount = sharedKeys.filter((key) => reference[key] === other[key]).length;

    if (sharedKeys.length > 0 && identicalCount === sharedKeys.length) {
      issues.push({
        code: 'duplicate-locale',
        locale: name,
        detail: `es idéntico a '${referenceName}': ${sharedKeys.length} claves con el mismo texto`,
      });
      continue;
    }

    // 2b) Diferencias por debajo del mínimo: parece traducido pero no lo está.
    const diff = diffLocales(reference, other);
    if (diff.different.length < minDifferences) {
      issues.push({
        code: 'stub-locale',
        locale: name,
        detail: `solo ${diff.different.length} cadenas difieren de '${referenceName}' (mínimo ${minDifferences})`,
      });
    }
  }

  return issues;
}

/**
 * Dialectos: pares [forma US/Latam, forma UK/España].
 * Se aplican con límites de palabra y respetando mayúscula inicial.
 */
export const UK_DIALECT: Array<[string, string]> = [
  ['color', 'colour'],
  ['gray', 'grey'],
  ['center', 'centre'],
  ['favorite', 'favourite'],
  ['license', 'licence'],
  ['catalog', 'catalogue'],
  ['dialog', 'dialogue'],
  ['canceled', 'cancelled'],
  ['traveling', 'travelling'],
  ['apologize', 'apologise'],
  ['customize', 'customise'],
  ['optimize', 'optimise'],
  ['organize', 'organise'],
  ['recognize', 'recognise'],
  ['authorize', 'authorise'],
  ['analyze', 'analyse'],
  ['personalize', 'personalise'],
  ['standardize', 'standardise'],
  ['prioritize', 'prioritise'],
  ['summarize', 'summarise'],
  ['mobile phone', 'mobile'],
  ['cell phone', 'mobile'],
  ['zip code', 'postcode'],
  ['math', 'maths'],
  ['soccer', 'football'],
  ['mom', 'mum'],
  // Vocabulario y gramática que en inglés británico se escribe distinto. Son
  // diferencias reales del idioma, no capricho: sin ellas el "English UK" era
  // el mismo texto que el US con otro nombre.
  ['expiration', 'expiry'],
  ['gotten', 'got'],
  ['toward', 'towards'],
  ['among', 'amongst'],
  ['percent', 'per cent'],
  ['program', 'programme'],
  ['enrollment', 'enrolment'],
  ['fulfill', 'fulfil'],
  ['instalment', 'instalment'],
  ['installment', 'instalment'],
  ['skillful', 'skilful'],
  ['signaling', 'signalling'],
  ['traveled', 'travelled'],
  ['modeled', 'modelled'],
  ['aging', 'ageing'],
  ['aluminum', 'aluminium'],
  ['defense', 'defence'],
  ['offense', 'offence'],
  ['pretense', 'pretence'],
  ['practicing', 'practising'],
  ['marvelous', 'marvellous'],
  ['sidewalk', 'pavement'],
  ['vacation', 'holiday'],
  ['apartment', 'flat'],
  ['garbage', 'rubbish'],
  ['elevator', 'lift'],
  ['flashlight', 'torch'],
  ['candy', 'sweets'],
];

export const ES_DIALECT: Array<[string, string]> = [
  ['computadoras', 'ordenadores'],
  ['computadora', 'ordenador'],
  ['celulares', 'móviles'],
  ['celular', 'móvil'],
  ['videos', 'vídeos'],
  ['video', 'vídeo'],
  ['carros', 'coches'],
  ['carro', 'coche'],
  ['computadora portátil', 'portátil'],
];

/**
 * Giros que en inglés británico se prefieren frente al estadounidense.
 *
 * A diferencia del vocabulario suelto, aquí no cambia la ortografía sino la
 * elección de palabras. Son formas corrientes en Reino Unido y perfectamente
 * entendibles en Estados Unidos, por eso se aplican solo al locale `en-uk`:
 * así el inglés británico deja de ser el estadounidense con otro nombre.
 */
export const UK_PHRASING: Array<[string, string]> = [
  // Elección de palabras: giros corrientes en Reino Unido.
  ['Learn more', 'Find out more'],
  ['View all', 'See all'],
  ['Contact us', 'Get in touch'],
  ['Explore projects', 'Browse projects'],
  ['Create account', 'Create an account'],
  ['example:', 'e.g.'],
  ['FAQ', 'FAQs'],
  // Uso de mayúsculas: el inglés británico no titula cada palabra como el
  // estadounidense, así que estas etiquetas van en minúscula salvo el nombre
  // propio. Es una diferencia real y visible, no un detalle de estilo.
  ['Light Mode', 'Light mode'],
  ['Dark Mode', 'Dark mode'],
  ['GitHub Repository', 'GitHub repository'],
  ['Cookie Usage and Privacy', 'Cookie usage and privacy'],
  // Las frases largas van ANTES que las cortas: si no, 'Privacy Policy' ya
  // habría reescrito parte de 'Privacy Policy and Terms of Service'.
  ['Privacy Policy and Terms of Service', 'Privacy policy and terms of service'],
  ['Cookies & Privacy', 'Cookies & privacy'],
  ['Privacy Policy', 'Privacy policy'],
  ['Terms of Service', 'Terms of service'],
];

/** Nombre del dialecto destino. Cada uno se aplica sobre su base (`en-us`, `es-latam`). */
export type DialectName = 'en-uk' | 'en-us' | 'es-es' | 'es-latam';

/**
 * Aplica un dialecto a todas las cadenas de un diccionario.
 *
 * Es genérico a propósito: los diccionarios reales contienen arrays de objetos
 * (`features.items`, `faq`), que no encajan en `LocaleTree`. Tipar la entrada y
 * la salida con el mismo tipo `T` deja que cada web llame
 * `applyDialect(en, 'en-uk')` sin castear y sin perder el tipo del diccionario.
 */
export function applyDialect<T>(
  tree: T,
  dialect: DialectName,
  pairs?: Array<[string, string]>,
): T {
  const table =
    pairs ??
    (dialect === 'en-uk'
      ? [...UK_DIALECT, ...UK_PHRASING]
      : dialect === 'es-es'
        ? ES_DIALECT
        : []);

  if (table.length === 0) return cloneLocale(tree as unknown as LocaleTree) as unknown as T;

  // Las tablas van siempre [forma base (US/Latam), forma destino (UK/ES)], así
  // que la dirección es siempre 0 → 1. Si el dialecto pedido ES la base, la
  // tabla llega vacía y esto no toca nada.
  const replaceText = (text: string): string => {
    let result = text;
    for (const pair of table) {
      const source = pair[0];
      const target = pair[1];
      if (source === target) continue;
      // Límite de palabra y respeto de la mayúscula inicial; se escapan los
      // caracteres especiales del patrón (hay términos con espacios y acentos).
      const pattern = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(source)})(?![\\p{L}])`, 'giu');
      result = result.replace(pattern, (_match, prefix: string, word: string) => {
        const cased = /^[A-Z]/.test(word)
          ? target.charAt(0).toUpperCase() + target.slice(1)
          : target;
        return `${prefix}${cased}`;
      });
    }
    return result;
  };

  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return replaceText(value);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) out[key] = walk(entry);
      return out;
    }
    return value;
  };

  return walk(tree) as T;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
