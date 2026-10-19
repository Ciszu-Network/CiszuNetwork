/**
 * Banco de preguntas de trivia integrado (es). Cada pregunta acepta varias
 * respuestas válidas. Las preguntas personalizadas por servidor viven en la
 * tabla ciszubot.trivia_questions.
 */

export type TriviaDifficulty = 'easy' | 'medium' | 'hard';

export interface TriviaQuestion {
  question: string;
  answers: string[];
  difficulty: TriviaDifficulty;
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  // ── Fácil ──
  { question: '¿Cuál es la capital de Francia?', answers: ['paris'], difficulty: 'easy' },
  { question: '¿Cuántos días tiene una semana?', answers: ['7', 'siete'], difficulty: 'easy' },
  { question: '¿Cuál es el planeta más grande del sistema solar?', answers: ['jupiter'], difficulty: 'easy' },
  { question: '¿Cuál es el color que resulta de mezclar azul y amarillo?', answers: ['verde'], difficulty: 'easy' },
  { question: '¿Cuántos lados tiene un triángulo?', answers: ['3', 'tres'], difficulty: 'easy' },
  { question: '¿Cuál es el océano más grande del mundo?', answers: ['pacifico'], difficulty: 'easy' },
  { question: '¿Qué animal es conocido como el rey de la selva?', answers: ['leon'], difficulty: 'easy' },
  { question: '¿Cuántos minutos tiene una hora?', answers: ['60', 'sesenta'], difficulty: 'easy' },
  { question: '¿Cuál es el metal cuyo símbolo químico es Au?', answers: ['oro'], difficulty: 'easy' },
  { question: '¿En qué continente está Egipto?', answers: ['africa'], difficulty: 'easy' },
  { question: '¿Cuántas patas tiene una araña?', answers: ['8', 'ocho'], difficulty: 'easy' },
  { question: '¿Cuál es la lengua oficial de Brasil?', answers: ['portugues'], difficulty: 'easy' },
  // ── Media ──
  { question: '¿Quién pintó la Mona Lisa?', answers: ['leonardo da vinci', 'da vinci', 'leonardo'], difficulty: 'medium' },
  { question: '¿Cuál es el río más largo de Sudamérica?', answers: ['amazonas'], difficulty: 'medium' },
  { question: '¿En qué año llegó el hombre a la Luna?', answers: ['1969'], difficulty: 'medium' },
  { question: '¿Cuál es el elemento más abundante de la atmósfera terrestre?', answers: ['nitrogeno'], difficulty: 'medium' },
  { question: '¿Quién escribió "Cien años de soledad"?', answers: ['gabriel garcia marquez', 'garcia marquez'], difficulty: 'medium' },
  { question: '¿Cuál es la montaña más alta del mundo?', answers: ['everest', 'monte everest'], difficulty: 'medium' },
  { question: '¿Cuántos huesos tiene el cuerpo humano adulto?', answers: ['206', 'doscientos seis'], difficulty: 'medium' },
  { question: '¿Cuál es la capital de Australia?', answers: ['canberra'], difficulty: 'medium' },
  { question: '¿Qué país inventó el papel?', answers: ['china'], difficulty: 'medium' },
  { question: '¿Cuál es el símbolo químico del hierro?', answers: ['fe'], difficulty: 'medium' },
  { question: '¿Quién compuso la Novena Sinfonía?', answers: ['beethoven', 'ludwig van beethoven'], difficulty: 'medium' },
  { question: '¿Cuál es el país más grande del mundo por superficie?', answers: ['rusia'], difficulty: 'medium' },
  // ── Difícil ──
  { question: '¿Cuál es el número atómico del carbono?', answers: ['6', 'seis'], difficulty: 'hard' },
  { question: '¿En qué año cayó el muro de Berlín?', answers: ['1989'], difficulty: 'hard' },
  { question: '¿Quién formuló la teoría de la relatividad general?', answers: ['albert einstein', 'einstein'], difficulty: 'hard' },
  { question: '¿Cuál es la velocidad de la luz en km/s (aprox)?', answers: ['300000', '299792', '300 000'], difficulty: 'hard' },
  { question: '¿Qué científico descubrió la penicilina?', answers: ['alexander fleming', 'fleming'], difficulty: 'hard' },
  { question: '¿Cuál es el desierto más grande del mundo?', answers: ['antartico', 'antartida'], difficulty: 'hard' },
  { question: '¿Cuántos corazones tiene un pulpo?', answers: ['3', 'tres'], difficulty: 'hard' },
  { question: '¿Cuál es la capital de Kazajistán?', answers: ['astana'], difficulty: 'hard' },
  { question: '¿Quién escribió "La Odisea"?', answers: ['homero'], difficulty: 'hard' },
  { question: '¿Cuál es el hueso más pequeño del cuerpo humano?', answers: ['estribo'], difficulty: 'hard' },
  { question: '¿En qué año se fundó la ONU?', answers: ['1945'], difficulty: 'hard' },
  { question: '¿Cuál es el único mamífero que puede volar?', answers: ['murcielago'], difficulty: 'hard' },
];

/** Normaliza una respuesta: minúsculas, sin acentos ni signos. */
export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
