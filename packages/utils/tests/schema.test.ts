import { describe, it, expect } from 'vitest';
import { matchesSchema, toJsonSchema, Type } from '@ciszunetwork/utils/schema';

describe('schema (TypeBox)', () => {
  const userSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    tags: Type.Array(Type.String()),
  });

  it('valida un objeto correcto', () => {
    expect(matchesSchema(userSchema, { id: 1, name: 'ciszu', tags: ['a'] })).toBe(true);
  });

  it('rechaza un objeto inválido', () => {
    expect(matchesSchema(userSchema, { id: 'x', name: 'ciszu' })).toBe(false);
  });

  it('genera JSON-Schema estándar', () => {
    const json = toJsonSchema(userSchema) as { type: string; properties: Record<string, unknown> };
    expect(json.type).toBe('object');
    expect(json.properties).toHaveProperty('id');
    expect(json.properties).toHaveProperty('name');
  });
});