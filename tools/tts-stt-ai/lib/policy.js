// Política de identidad y palabras de bloqueo para la voz (STT + TTS).
//
// - Identidad: si el prompt del usuario EMPIEZA con un alias/nombre de la IA
//   (CiszuAi, Yarbis, Intelligence, Krypta u otros genéricos), la respuesta
//   hablada saluda siempre al usuario por su nombre (Francisco García / alias
//   Ciszuko Antony), rotando entre variantes.
// - Bloqueo: si el prompt llama a la IA por UNA PALABRA CLAVE (Usciz,
//   Notresponding, Norbis), se DENIEGA la interacción: no se relaya la
//   respuesta, no se ejecuta la tarea y se emite un rechazo explicando el
//   motivo.

export const IA_ALIASES_RE =
  /^(?:ciszuai|ciszu ai|yarbis|intelligence|krypta|ai\b|asistente|bot\b|maquina|computadora)/i;

export const USER_GREETINGS = [
  "Francisco",
  "Cisco",
  "Fran",
  "Francisco García",
  "Ciszuko",
  "Cisco Francisco",
];

export const BLOCKED_ALIASES = ["usciz", "notresponding", "norbis"];
export const BLOCKED_ALIASES_RE = /^(?:usciz|notresponding|norbis)\b/i;

// ¿El prompt usa un alias/nombre de la IA? (política de identidad)
export function usedAIAlias(userText) {
  if (!userText || typeof userText !== "string") return false;
  const firstLine = userText.trim().slice(0, 60);
  return IA_ALIASES_RE.test(firstLine);
}

// Saludo de audio dirigido al usuario (Francisco García / Ciszuko Antony).
export function personalizedGreeting(index) {
  const name = USER_GREETINGS[index % USER_GREETINGS.length];
  return `Hola ${name}.`;
}

// ¿El prompt usa una palabra de bloqueo? (Usciz, Notresponding, Norbis).
// Se detecta en cualquier posición, como palabra independiente.
export function isBlockedCall(userText) {
  if (!userText || typeof userText !== "string") return false;
  return /\b(?:usciz|notresponding|norbis)\b/i.test(userText);
}

// Mensaje de rechazo hablado/escrito cuando se usa una palabra de bloqueo.
export function blockedRefusalText(head) {
  const match = head.toLowerCase().match(/\b(usciz|notresponding|norbis)\b/i);
  const word = match ? match[1] : "de bloqueo";
  return `No puedo ayudarte con eso. Has usado la palabra ${word}, una señal de orden de bloqueo. Por política de seguridad, deniego la solicitud y no voy a ejecutar ninguna tarea. Si necesitas algo, repite la petición sin esa palabra.`;
}