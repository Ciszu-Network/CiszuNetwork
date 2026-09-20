/**
 * Medición de cobertura de traducción.
 *
 * POR QUÉ: los diccionarios de las 4 webs contienen apenas nav/footer/common,
 * pero las páginas están llenas de texto literal en español. Eso es lo que se
 * percibe como "los idiomas están sin terminar": cambiar el idioma cambia el
 * menú y el pie, y el resto se queda igual. El problema no era detectable
 * porque no había ninguna cifra; traducir "a mano" sin medir no tiene fin ni
 * forma de saber si se avanza.
 *
 * Aquí está la parte pura: extraer candidatos a texto visible de un archivo y
 * compararlos con un presupuesto congelado. El test de cada web fija el número
 * actual como línea base (ratchet): si alguien añade texto literal, el número
 * sube y el test falla; a medida que se traduce, la línea base baja. Así el
 * trabajo pendiente es visible y no crece.
 */

/** Cadenas que no son texto de interfaz: clases, rutas, ids, unidades. */
const NOT_PROSE = [
  /^[\d\s.,:/+-]*$/,
  /^[a-z0-9_-]+$/i,
  /^[a-z-]+(\/[a-z0-9-]+)+$/i,
  /^https?:\/\//i,
  /^#[0-9a-f]{3,8}$/i,
  /^[A-Z_]{3,}$/,
  /\bclass(Name)?\b/,
  /^(px|py|pt|pb|pl|pr|m|mx|my|w|h|text|bg|border|rounded|flex|grid|gap|space|font|leading|tracking|opacity|shadow|z|top|bottom|left|right|inset|translate|scale|rotate|duration|ease|animate|hover|focus|active|group|peer|absolute|relative|fixed|sticky|hidden|block|inline|overflow|transition|transform|backdrop|blur|fill|stroke|strokeWidth|viewBox|xmlns|d|points|cx|cy|r|x|y|width|height)[-:]/,
];

/** Atributos cuyo valor es texto visible para la persona que usa la web. */
const TEXT_ATTRIBUTES = [
  'placeholder',
  'aria-label',
  'aria-description',
  'alt',
  'title',
  'label',
  'description',
  'confirmLabel',
  'cancelLabel',
];

export interface HardcodedString {
  /** El texto encontrado. */
  text: string;
  /** Línea (1-based) donde aparece. */
  line: number;
  /** Cómo se encontró: nodo de texto JSX o un atributo. */
  source: 'text' | 'attribute';
}

/** ¿Parece texto de interfaz escrito para una persona? */
export function looksLikeProse(text: string): boolean {
  const value = text.trim();
  if (value.length < 4) return false;
  if (NOT_PROSE.some((pattern) => pattern.test(value))) return false;
  // Al menos una letra y un espacio, o una palabra larga con acentos/símbolos
  // propios de un texto real (evita nombres de variables sueltos).
  const hasLetter = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(value);
  if (!hasLetter) return false;
  const hasSpace = /\s/.test(value);
  const hasAccentOrPunct = /[áéíóúüñÁÉÍÓÚÜÑ¿¡:!?.,]/.test(value);
  if (!hasSpace && !hasAccentOrPunct && value.length < 12) return false;
  // Descarta identificadores en camelCase o snake_case.
  if (/^[a-z]+([A-Z][a-z]+)+$/.test(value)) return false;
  if (/^[a-z]+(_[a-z]+)+$/.test(value)) return false;
  return true;
}

/**
 * Extrae candidatos a texto visible de un archivo TSX.
 *
 * Es un análisis por expresiones regulares, no un parser: se busca en nodos de
 * texto JSX (`>Texto<`) y en los atributos de texto más comunes. Un AST sería
 * más preciso, pero esto no necesita cero falsos positivos — necesita ser
 * estable para poder usarlo como línea base, y para eso lo importante es que
 * las mismas entradas produzcan siempre la misma cuenta.
 */
export function extractHardcodedStrings(source: string): HardcodedString[] {
  const found: HardcodedString[] = [];

  const lineOf = (index: number): number => {
    let count = 1;
    for (let i = 0; i < index && i < source.length; i += 1) {
      if (source[i] === '\n') count += 1;
    }
    return count;
  };

  // 1) Nodos de texto JSX: >texto literal< sin llaves ni etiquetas dentro.
  const textNode = />\s*([^<>{}\n]{4,200}?)\s*</g;
  for (const match of source.matchAll(textNode)) {
    const text = match[1];
    if (!looksLikeProse(text)) continue;
    found.push({ text: text.trim(), line: lineOf(match.index ?? 0), source: 'text' });
  }

  // 2) Atributos de texto con literal entre comillas dobles.
  for (const attribute of TEXT_ATTRIBUTES) {
    const pattern = new RegExp(`\\b${attribute}\\s*=\\s*"([^"\\n]{3,200})"`, 'g');
    for (const match of source.matchAll(pattern)) {
      const text = match[1];
      if (!looksLikeProse(text)) continue;
      found.push({ text: text.trim(), line: lineOf(match.index ?? 0), source: 'attribute' });
    }
  }

  return found;
}

export interface CoverageReport {
  /** Total de candidatos encontrados. */
  total: number;
  /** Candidatos repetidos en varios sitios (texto + línea). */
  unique: number;
  /** Desglose por archivo, ordenado de más a menos. */
  byFile: Array<{ file: string; count: number }>;
}

/** Construye el informe a partir de un mapa `archivo → contenido`. */
export function buildCoverageReport(files: Record<string, string>): CoverageReport {
  const byFile: Array<{ file: string; count: number }> = [];
  const uniqueTexts = new Set<string>();
  let total = 0;

  for (const [file, content] of Object.entries(files)) {
    const hits = extractHardcodedStrings(content);
    if (hits.length === 0) continue;
    total += hits.length;
    for (const hit of hits) uniqueTexts.add(hit.text);
    byFile.push({ file, count: hits.length });
  }

  byFile.sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));

  return { total, unique: uniqueTexts.size, byFile };
}
