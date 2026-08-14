import { z } from 'zod';

/**
 * Esquemas de validación compartidos (Zod) para API routes y formularios.
 * Regla: todo body de POST que muta o consume un servicio externo se valida aquí
 * antes de procesarlo (ver SECURITY_PROTOCOLS.md). Complementa a Drizzle
 * (`drizzle-zod` genera schemas desde el schema de BD).
 */

export const turnstileTokenSchema = z.object({
  token: z.string().min(1).max(4096),
});

export const contactMessageSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

/**
 * Parseo seguro de body JSON: devuelve { success, data } o error tipado.
 * Uso: `const parsed = parseJsonBody<typeof schema._type>(request, schema)`.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const raw = await request.json();
    const result = schema.safeParse(raw);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  } catch {
    const error = new z.ZodError([{ code: 'custom', path: ['body'], message: 'Invalid JSON body' }]);
    return { success: false, error };
  }
}

/** Extrae el primer mensaje de error de un ZodError para respuestas HTTP. */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input';
}
