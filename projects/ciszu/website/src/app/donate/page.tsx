import { getDonationMethods } from "@ciszunetwork/payments";
import DonateContent from "./DonateContent";

/**
 * ISR (Fase 4, STATIC_MIGRATION_PLAN §4.5): la página deja de ser dinámica.
 * Las direcciones de donación vienen de env del servidor (`DONATE_*`), así que
 * el fetch de métodos vive aquí; el texto multiidioma lo resuelve el contenido
 * cliente. `revalidate` corto garantiza que una revalidación en runtime
 * (con las env de producción) refresque la lista si cambia.
 */
export const revalidate = 300;

export default function DonatePage() {
  const methods = getDonationMethods();
  return <DonateContent methods={methods} />;
}
