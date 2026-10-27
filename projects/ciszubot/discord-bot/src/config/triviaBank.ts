/**
 * Banco de preguntas de trivia integrado (es). Cada pregunta acepta varias
 * respuestas válidas. Las preguntas personalizadas por servidor viven en la
 * tabla ciszubot.trivia_questions.
 */

export type TriviaDifficulty = 'easy' | 'medium' | 'hard';

export const TRIVIA_CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'anime', label: 'Anime' },
  { id: 'videogames', label: 'Videojuegos' },
  { id: 'music', label: 'Música' },
  { id: 'history', label: 'Historia' },
  { id: 'movies', label: 'Cine' },
  { id: 'series', label: 'Series' },
  { id: 'sports', label: 'Deportes' },
  { id: 'science', label: 'Ciencia' },
  { id: 'geography', label: 'Geografía' },
  { id: 'literature', label: 'Literatura' },
  { id: 'art', label: 'Arte' },
  { id: 'technology', label: 'Tecnología' },
  { id: 'programming', label: 'Programación' },
  { id: 'space', label: 'Espacio' },
  { id: 'nature', label: 'Naturaleza' },
  { id: 'math', label: 'Matemáticas' },
  { id: 'language', label: 'Idiomas' },
  { id: 'food', label: 'Comida' },
  { id: 'mythology', label: 'Mitología' },
  { id: 'cars', label: 'Autos' },
  { id: 'internet', label: 'Internet' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'comics', label: 'Cómics' },
] as const;

export type TriviaCategory = (typeof TRIVIA_CATEGORIES)[number]['id'];

export interface TriviaQuestion {
  question: string;
  answers: string[];
  difficulty: TriviaDifficulty;
  category: TriviaCategory;
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  // ── General ──
  { question: '¿Cuántos días tiene una semana?', answers: ['7', 'siete'], difficulty: 'easy', category: 'general' },
  { question: '¿Cuál es el color que resulta de mezclar azul y amarillo?', answers: ['verde'], difficulty: 'easy', category: 'general' },
  // ── Geografía ──
  { question: '¿Cuál es la capital de Francia?', answers: ['paris'], difficulty: 'easy', category: 'geography' },
  { question: '¿Cuál es el océano más grande del mundo?', answers: ['pacifico'], difficulty: 'easy', category: 'geography' },
  { question: '¿En qué continente está Egipto?', answers: ['africa'], difficulty: 'easy', category: 'geography' },
  { question: '¿Cuál es el río más largo de Sudamérica?', answers: ['amazonas'], difficulty: 'medium', category: 'geography' },
  { question: '¿Cuál es la capital de Australia?', answers: ['canberra'], difficulty: 'medium', category: 'geography' },
  { question: '¿Cuál es el país más grande del mundo por superficie?', answers: ['rusia'], difficulty: 'medium', category: 'geography' },
  { question: '¿Cuál es la montaña más alta del mundo?', answers: ['everest', 'monte everest'], difficulty: 'medium', category: 'geography' },
  { question: '¿Cuál es la capital de Kazajistán?', answers: ['astana'], difficulty: 'hard', category: 'geography' },
  // ── Ciencia ──
  { question: '¿Cuál es el metal cuyo símbolo químico es Au?', answers: ['oro'], difficulty: 'easy', category: 'science' },
  { question: '¿Cuál es el elemento más abundante de la atmósfera terrestre?', answers: ['nitrogeno'], difficulty: 'medium', category: 'science' },
  { question: '¿Cuántos huesos tiene el cuerpo humano adulto?', answers: ['206', 'doscientos seis'], difficulty: 'medium', category: 'science' },
  { question: '¿Cuál es el símbolo químico del hierro?', answers: ['fe'], difficulty: 'medium', category: 'science' },
  { question: '¿Cuál es el número atómico del carbono?', answers: ['6', 'seis'], difficulty: 'hard', category: 'science' },
  { question: '¿Quién formuló la teoría de la relatividad general?', answers: ['albert einstein', 'einstein'], difficulty: 'hard', category: 'science' },
  { question: '¿Cuál es la velocidad de la luz en km/s (aprox)?', answers: ['300000', '299792', '300 000'], difficulty: 'hard', category: 'science' },
  { question: '¿Qué científico descubrió la penicilina?', answers: ['alexander fleming', 'fleming'], difficulty: 'hard', category: 'science' },
  { question: '¿Cuál es el hueso más pequeño del cuerpo humano?', answers: ['estribo'], difficulty: 'hard', category: 'science' },
  { question: '¿Cuál es el símbolo del oxígeno?', answers: ['o'], difficulty: 'easy', category: 'science' },
  { question: '¿Qué órgano bombea la sangre?', answers: ['corazon'], difficulty: 'easy', category: 'science' },
  // ── Historia ──
  { question: '¿En qué año llegó el hombre a la Luna?', answers: ['1969'], difficulty: 'medium', category: 'history' },
  { question: '¿Qué país inventó el papel?', answers: ['china'], difficulty: 'medium', category: 'history' },
  { question: '¿En qué año cayó el muro de Berlín?', answers: ['1989'], difficulty: 'hard', category: 'history' },
  { question: '¿En qué año se fundó la ONU?', answers: ['1945'], difficulty: 'hard', category: 'history' },
  { question: '¿Quién fue el primer presidente de Estados Unidos?', answers: ['george washington', 'washington'], difficulty: 'medium', category: 'history' },
  { question: '¿En qué año comenzó la Segunda Guerra Mundial?', answers: ['1939'], difficulty: 'medium', category: 'history' },
  // ── Literatura ──
  { question: '¿Quién escribió "Cien años de soledad"?', answers: ['gabriel garcia marquez', 'garcia marquez'], difficulty: 'medium', category: 'literature' },
  { question: '¿Quién escribió "La Odisea"?', answers: ['homero'], difficulty: 'hard', category: 'literature' },
  // ── Arte ──
  { question: '¿Quién pintó la Mona Lisa?', answers: ['leonardo da vinci', 'da vinci', 'leonardo'], difficulty: 'medium', category: 'art' },
  // ── Música ──
  { question: '¿Quién compuso la Novena Sinfonía?', answers: ['beethoven', 'ludwig van beethoven'], difficulty: 'medium', category: 'music' },
  { question: '¿Qué instrumento tiene 88 teclas?', answers: ['piano'], difficulty: 'easy', category: 'music' },
  { question: '¿Qué banda cantó "Bohemian Rhapsody"?', answers: ['queen'], difficulty: 'medium', category: 'music' },
  // ── Espacio ──
  { question: '¿Cuál es el planeta más grande del sistema solar?', answers: ['jupiter'], difficulty: 'easy', category: 'space' },
  { question: '¿Qué planeta es conocido como el planeta rojo?', answers: ['marte'], difficulty: 'easy', category: 'space' },
  { question: '¿Cuál es la estrella más cercana a la Tierra?', answers: ['sol'], difficulty: 'easy', category: 'space' },
  // ── Naturaleza ──
  { question: '¿Qué animal es conocido como el rey de la selva?', answers: ['leon'], difficulty: 'easy', category: 'nature' },
  { question: '¿Cuántas patas tiene una araña?', answers: ['8', 'ocho'], difficulty: 'easy', category: 'nature' },
  { question: '¿Cuál es el desierto más grande del mundo?', answers: ['antartico', 'antartida'], difficulty: 'hard', category: 'nature' },
  { question: '¿Cuántos corazones tiene un pulpo?', answers: ['3', 'tres'], difficulty: 'hard', category: 'nature' },
  { question: '¿Cuál es el único mamífero que puede volar?', answers: ['murcielago'], difficulty: 'hard', category: 'nature' },
  { question: '¿Qué animal es el más rápido en tierra?', answers: ['guepardo', 'cheetah'], difficulty: 'medium', category: 'nature' },
  { question: '¿Qué gas absorben las plantas para hacer fotosíntesis?', answers: ['dioxido de carbono', 'co2'], difficulty: 'medium', category: 'nature' },
  // ── Matemáticas ──
  { question: '¿Cuántos lados tiene un triángulo?', answers: ['3', 'tres'], difficulty: 'easy', category: 'math' },
  { question: '¿Cuántos minutos tiene una hora?', answers: ['60', 'sesenta'], difficulty: 'easy', category: 'math' },
  { question: '¿Cuánto es 12 x 12?', answers: ['144'], difficulty: 'easy', category: 'math' },
  { question: '¿Cuál es el valor aproximado de pi?', answers: ['3.14', '3,14'], difficulty: 'medium', category: 'math' },
  // ── Idiomas ──
  { question: '¿Cuál es la lengua oficial de Brasil?', answers: ['portugues'], difficulty: 'easy', category: 'language' },
  { question: '¿Cómo se dice "hello" en español?', answers: ['hola'], difficulty: 'easy', category: 'language' },
  { question: '¿Cuál es el idioma oficial de Japón?', answers: ['japones'], difficulty: 'easy', category: 'language' },
  // ── Anime ──
  { question: '¿Cómo se llama el protagonista de Naruto?', answers: ['naruto uzumaki', 'naruto'], difficulty: 'easy', category: 'anime' },
  { question: '¿Qué anime tiene como protagonista a Monkey D. Luffy?', answers: ['one piece'], difficulty: 'easy', category: 'anime' },
  // ── Videojuegos ──
  { question: '¿En qué franquicia aparece Mario?', answers: ['super mario', 'super mario bros', 'mario'], difficulty: 'easy', category: 'videogames' },
  { question: '¿Qué empresa creó Minecraft?', answers: ['mojang'], difficulty: 'medium', category: 'videogames' },
  // ── Cine ──
  { question: '¿Quién dirigió Titanic?', answers: ['james cameron', 'cameron'], difficulty: 'medium', category: 'movies' },
  { question: '¿Qué película surcoreana ganó el Óscar a mejor película en 2020?', answers: ['parasite', 'parasitos'], difficulty: 'hard', category: 'movies' },
  // ── Series ──
  { question: '¿En qué serie aparece Walter White?', answers: ['breaking bad'], difficulty: 'easy', category: 'series' },
  { question: '¿Qué serie está ambientada en Poniente?', answers: ['game of thrones', 'juego de tronos'], difficulty: 'medium', category: 'series' },
  // ── Deportes ──
  { question: '¿Cuántos jugadores tiene un equipo de fútbol en cancha?', answers: ['11', 'once'], difficulty: 'easy', category: 'sports' },
  { question: '¿En qué deporte se usa un volante o shuttlecock?', answers: ['badminton'], difficulty: 'medium', category: 'sports' },
  // ── Tecnología ──
  { question: '¿Qué significa CPU?', answers: ['unidad central de procesamiento', 'central processing unit'], difficulty: 'medium', category: 'technology' },
  { question: '¿Qué empresa creó Windows?', answers: ['microsoft'], difficulty: 'easy', category: 'technology' },
  // ── Programación ──
  { question: '¿Qué lenguaje usa print("hola")?', answers: ['python'], difficulty: 'easy', category: 'programming' },
  { question: '¿Qué significa HTML?', answers: ['hypertext markup language'], difficulty: 'medium', category: 'programming' },
  // ── Comida ──
  { question: '¿De qué país es originario el sushi?', answers: ['japon'], difficulty: 'easy', category: 'food' },
  { question: '¿Qué ingrediente principal tiene el guacamole?', answers: ['aguacate'], difficulty: 'easy', category: 'food' },
  // ── Mitología ──
  { question: '¿Quién es el dios griego del trueno?', answers: ['zeus'], difficulty: 'easy', category: 'mythology' },
  { question: '¿Qué héroe griego mató a Medusa?', answers: ['perseo'], difficulty: 'medium', category: 'mythology' },
  // ── Autos ──
  { question: '¿Qué empresa fabrica el Mustang?', answers: ['ford'], difficulty: 'easy', category: 'cars' },
  { question: '¿En qué país nació Ferrari?', answers: ['italia'], difficulty: 'easy', category: 'cars' },
  // ── Internet ──
  { question: '¿Qué significa WWW?', answers: ['world wide web'], difficulty: 'easy', category: 'internet' },
  { question: '¿Qué plataforma es conocida por sus videos cortos?', answers: ['tiktok'], difficulty: 'easy', category: 'internet' },
  // ── Pokémon ──
  { question: '¿Cuál es el Pokémon inicial de fuego de Kanto?', answers: ['charmander'], difficulty: 'easy', category: 'pokemon' },
  { question: '¿Quién es el Pokémon número 1 de la Pokédex?', answers: ['bulbasaur'], difficulty: 'easy', category: 'pokemon' },
  // ── Cómics ──
  { question: '¿Quién es el alter ego de Batman?', answers: ['bruce wayne'], difficulty: 'easy', category: 'comics' },
  { question: '¿Qué empresa creó Spider-Man?', answers: ['marvel'], difficulty: 'easy', category: 'comics' },
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
