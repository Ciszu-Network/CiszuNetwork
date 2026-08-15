import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { TSchema } from '@sinclair/typebox/type';

/**
 * Utilidades de TypeBox para esquemas JSON-Schema nativos.
 *
 * Política de validación del monorepo (ver TOOLS_EVALUATION_PLAN §9.3):
 * zod es la librería estándar; TypeBox se reserva (⚠️ condicional) para el
 * caso en que se necesite JSON Schema nativo (OpenAPI, herramientas AI, etc.).
 * Por eso conviven ambas en este paquete sin mezclarse en el mismo módulo.
 */

/** Compila un schema TypeBox a JSON Schema estándar (draft 2020-12). */
export function toJsonSchema<T extends TSchema>(schema: T) {
  return JSON.parse(JSON.stringify(schema)) as unknown;
}

/** Valida un valor contra un schema TypeBox. Devuelve booleano. */
export function matchesSchema<T extends TSchema>(schema: T, value: unknown): boolean {
  return Value.Check(schema, value);
}

/**
 * Los nombres de propiedad para `.entries()` cuando el import de TypeBox es
 * ESM (named imports de Type y Value). Exposición mínima para no duplicar.
 */
export { Type, Value };
export type { TSchema };

/**
 * Referencia rápida de creación de esquemas contextuales: OpenAPI / AI tools.
 * Ejemplo de uso en proyectos:
 *
 * ```ts
 * import { TypeSchema, toJsonSchema } from '@ciszunetwork/utils';
 * const S = TypeSchema.Object({ name: TypeSchema.String(), age: TypeSchema.Number() });
 * const openapiSchema = toJsonSchema(S);
 * ```
 */
export const TypeSchema = Type;