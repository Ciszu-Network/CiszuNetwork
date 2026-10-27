import { describe, expect, it } from 'vitest';
import { TRIVIA_BANK, TRIVIA_CATEGORIES, normalizeAnswer } from '../src/config/triviaBank';

describe('trivia bank', () => {
  it('cada categoría tiene al menos una pregunta', () => {
    for (const category of TRIVIA_CATEGORIES) {
      expect(TRIVIA_BANK.some((question) => question.category === category.id)).toBe(true);
    }
  });

  it('todas las preguntas usan una categoría declarada y respuestas no vacías', () => {
    const ids = new Set(TRIVIA_CATEGORIES.map((category) => category.id));
    for (const question of TRIVIA_BANK) {
      expect(ids.has(question.category)).toBe(true);
      expect(question.answers.length).toBeGreaterThan(0);
      expect(question.answers.every((answer) => normalizeAnswer(answer).length > 0)).toBe(true);
    }
  });
});
