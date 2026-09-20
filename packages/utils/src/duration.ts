/**
 * Formato de duración legible en español, compartido por los flujos de
 * autenticación (códigos 2FA y enlaces de recuperación).
 *
 * Módulo puro, sin dependencias: una sola implementación para toda la app
 * (antes había una copia por módulo y podían divergir).
 */

/** Duración legible: "45 s", "12 min", "3 h 20 min", "1 d 4 h". */
export function describeDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
  }
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours === 0 ? `${days} d` : `${days} d ${restHours} h`;
}
