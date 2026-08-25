// profanity.js — filtro de palabras prohibidas (insultos/obscenidades) en
// español e inglés, usado por scripts/advisor.js antes de enviar mensajes
// globales. Si se detecta, el devcon se cierra (exit code 2) para poder
// rastrear al emisor por el log de auditoría.
//
// Normaliza el texto (minúsculas + sustituciones leet comunes) para atrapar
// ofuscaciones tipo "p0lla", "m13rda", "@sshole".

const RAW_WORDS = [
  // ---- Español ----
  'puta', 'puto', 'putamadre', 'polla', 'pendejo', 'pendeja', 'marica', 'maricon',
  'gilipollas', 'cabron', 'cabrona', 'mierda', 'joder', 'jodete', 'coño', 'cono',
  'verga', 'chucha', 'malparido', 'hijueputa', 'hijodeputa', 'hpta', 'pirobo',
  'gonorrea', 'careverga', 'perra', 'zorra', 'zurrapa', 'maldito', 'maldita',
  'imbecil', 'estupido', 'estupida', 'tarado', 'tarada', 'subnormal', 'retrasado',
  'retrasada', 'mongolo', 'mongola', 'idiota', 'tarugo', 'pajero', 'pajera',
  'cagado', 'cagada', 'culo', 'culero', 'culera', 'tonto', 'tonta', 'boludo',
  'boluda', 'pelotudo', 'pelotuda', 'forro', 'cogerte', 'follar', 'chinga',
  'chingada', 'pinche', 'pendejada', 'webon', 'güey', 'wey', 'ojete', 'panocha',
  'concha', 'conchetumare', 'chicozapote', 'culiamigo', 'malparidita',
  // ---- English ----
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bitch', 'asshole',
  'bastard', 'dick', 'cunt', 'whore', 'slut', 'pussy', 'cock', 'faggot', 'fag',
  'nigger', 'nigga', 'retard', 'retarded', 'moron', 'idiot', 'stupid', 'damn',
  'damnit', 'bullshit', 'dumbass', 'jackass', 'douchebag', 'wanker', 'prick',
  'twat', 'bollocks', 'wank', 'screw', 'sonofabitch', 'goddamn', 'goddamnit',
];

// Sustituciones leet/obfuscación comunes (se aplican al texto y a la palabra).
const LEET = [
  ['0', 'o'], ['1', 'i'], ['3', 'e'], ['4', 'a'], ['5', 's'], ['7', 't'],
  ['8', 'b'], ['@', 'a'], ['$', 's'], ['!', 'i'], ['¡', 'i'], ['_', ''],
  ['-', ''], ['.', ''], ['*', ''], ['+', ''], ['(', ''], [')', ''], ['#', ''],
];

function normalize(text) {
  let out = String(text || '').toLowerCase().trim();
  for (const [from, to] of LEET) out = out.split(from).join(to);
  // separadores internos que intenten romper la palabra
  out = out.replace(/[^a-zñüéáíóú]/g, '');
  return out;
}

// Lista de palabras normalizadas (una sola vez).
const NORMALIZED = RAW_WORDS.map((w) => normalize(w)).filter((w) => w.length >= 3);

/** Devuelve la primera palabra prohibida encontrada, o null si el texto es limpio. */
function detectProfanity(text) {
  const normalized = normalize(text);
  if (!normalized) return null;
  for (const word of NORMALIZED) {
    if (normalized.includes(word)) return word;
  }
  return null;
}

module.exports = { detectProfanity, normalize };