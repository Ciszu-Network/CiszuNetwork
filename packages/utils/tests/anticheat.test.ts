import { describe, expect, it } from 'vitest';
import {
  MUZICMANIA_PROFILE,
  applyDecay,
  buildMuzicmaniaSignals,
  evaluate,
  levelFor,
  type MuzicScoreSample,
} from '../src/anticheat';

const now = Date.now();
function sample(over: Partial<MuzicScoreSample> = {}): MuzicScoreSample {
  return {
    score: 1000,
    accuracy: 90,
    maxCombo: 100,
    difficulty: 'normal',
    trackId: 't1',
    createdAtMs: now,
    ...over,
  };
}

describe('levelFor', () => {
  it('clasifica por umbrales del perfil', () => {
    expect(levelFor(0, MUZICMANIA_PROFILE)).toBe('clean');
    expect(levelFor(20, MUZICMANIA_PROFILE)).toBe('watch');
    expect(levelFor(50, MUZICMANIA_PROFILE)).toBe('suspicious');
    expect(levelFor(80, MUZICMANIA_PROFILE)).toBe('flagged');
  });
});

describe('applyDecay', () => {
  it('reduce el score con los días y no toca menos de 1 día', () => {
    const day = 86_400_000;
    expect(applyDecay(100, now, MUZICMANIA_PROFILE, now + day / 2)).toBe(100);
    expect(applyDecay(100, now, MUZICMANIA_PROFILE, now + 2 * day)).toBeCloseTo(81, 0);
  });
});

describe('buildMuzicmaniaSignals — jugadas normales no generan señales', () => {
  it('un 100% suelto en fácil no dispara nada', () => {
    const s = buildMuzicmaniaSignals(sample({ accuracy: 100, difficulty: 'easy' }), [], now);
    expect(s).toHaveLength(0);
  });
  it('una partida normal con fallos no dispara nada', () => {
    const s = buildMuzicmaniaSignals(sample({ accuracy: 87.5, score: 8432, maxCombo: 240 }), [sample()], now);
    expect(s).toHaveLength(0);
  });
});

describe('buildMuzicmaniaSignals — anomalías', () => {
  it('detecta valores alterados (accuracy > 100, combo > score)', () => {
    const s = buildMuzicmaniaSignals(sample({ accuracy: 150, maxCombo: 99999, score: 10 }), [], now);
    const rules = s.map((x) => x.rule);
    expect(rules).toContain('value_tamper');
    expect(rules).toContain('impossible_score');
  });

  it('detecta una racha de 3 perfectos en difícil y escala el peso', () => {
    const history = [
      sample({ accuracy: 100, difficulty: 'hard', createdAtMs: now - 60_000 }),
      sample({ accuracy: 100, difficulty: 'hard', createdAtMs: now - 30_000 }),
    ];
    const s = buildMuzicmaniaSignals(sample({ accuracy: 100, difficulty: 'hard' }), history, now);
    const streak = s.find((x) => x.rule === 'perfect_streak');
    expect(streak).toBeDefined();
    // 15 base × 1.6 difícil × 2 (tercer perfecto) = 48
    expect(streak!.weight).toBeCloseTo(48, 0);
  });

  it('detecta patrón de bot (misma puntuación exacta repetida)', () => {
    const history = [
      sample({ score: 5000, accuracy: 99.5, createdAtMs: now - 120_000 }),
      sample({ score: 5000, accuracy: 99.5, createdAtMs: now - 60_000 }),
    ];
    const s = buildMuzicmaniaSignals(sample({ score: 5000, accuracy: 99.5 }), history, now);
    expect(s.map((x) => x.rule)).toContain('bot_pattern');
  });
});

describe('evaluate — invisible hasta el umbral', () => {
  it('acumula sin actuar hasta cruzar el umbral y solo escala la primera vez', () => {
    const base = { profile: MUZICMANIA_PROFILE, currentScore: 0, lastUpdatedMs: now, nowMs: now };
    const e1 = evaluate({ ...base, signals: [{ rule: 'perfect_streak', weight: 24 }] });
    expect(e1.level).toBe('watch');
    expect(e1.escalate).toBe(false);

    const e2 = evaluate({ ...base, currentScore: e1.score, signals: [{ rule: 'perfect_streak', weight: 48 }] });
    expect(e2.level).toBe('suspicious');
    expect(e2.escalate).toBe(false);

    const e3 = evaluate({ ...base, currentScore: e2.score, signals: [{ rule: 'perfect_streak', weight: 72 }] });
    expect(e3.level).toBe('flagged');
    expect(e3.escalate).toBe(true);

    // Ya flagged: no vuelve a escalar.
    const e4 = evaluate({ ...base, currentScore: e3.score, signals: [{ rule: 'perfect_streak', weight: 72 }] });
    expect(e4.escalate).toBe(false);
  });
});
