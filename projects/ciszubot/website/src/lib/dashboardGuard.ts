/**
 * Guard de cambios sin guardar del dashboard (singleton de módulo).
 *
 * El cliente del dashboard marca `dirty`; el shell (que navega entre
 * servidores y no comparte estado React con el cliente) consulta este store
 * antes de navegar: si hay cambios sin guardar, no navega; dispara la
 * sacudida (shake) y entrega el destino al cliente, que muestra el modal de
 * confirmación (guardar / descartar / quedarse) y navega al terminar.
 */

type ShakeListener = () => void;

let dirty = false;
let pendingHref: string | null = null;
const shakeListeners = new Set<ShakeListener>();

export const dashboardGuard = {
  setDirty(value: boolean): void {
    dirty = value;
  },
  isDirty(): boolean {
    return dirty;
  },
  /** Intento de navegación con cambios pendientes: guarda destino + sacude. */
  requestNav(href: string): void {
    pendingHref = href;
    for (const listener of shakeListeners) listener();
  },
  consumePending(): string | null {
    const href = pendingHref;
    pendingHref = null;
    return href;
  },
  onShake(listener: ShakeListener): () => void {
    shakeListeners.add(listener);
    return () => shakeListeners.delete(listener);
  },
};
