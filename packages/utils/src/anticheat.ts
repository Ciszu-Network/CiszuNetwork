/**
 * Ciszu Anti-Cheat — motor reutilizable (Fase 2).
 *
 * Modelo de SEÑALES PONDERADAS: cada infracción (incluida la más leve) suma
 * puntos según su peso y el contexto del juego; el resultado es invisible hasta
 * cruzar el umbral del perfil del juego. Ver ANTICHEAT_SYSTEM.md.
 *
 * Módulo PURO (sin dependencias): se testea aparte y lo usan las webs/juegos.
 */

export type AnticheatRule =
  | 'perfect_streak'
  | 'impossible_score'
  | 'speed_anomaly'
  | 'value_tamper'
  | 'bot_pattern'
  | 'stat_outlier';

export type AnticheatLevel = 'clean' | 'watch' | 'suspicious' | 'flagged';

export interface AnticheatSignal {
  rule: AnticheatRule;
  /** Peso final (ya aplicado el multiplicador de contexto por el juego). */
  weight: number;
  details?: Record<string, unknown>;
}

export interface AnticheatProfile {
  game: string;
  /** Score a partir del cual se actúa (nivel `flagged`). */
  threshold: number;
  /** Score a partir del cual pasa a `watch` (invisible). */
  watchAt: number;
  /** Score a partir del cual pasa a `suspicious` (solo staff, invisible). */
  suspiciousAt: number;
  /** Factor de decaimiento diario (0.9 = −10% por día sin señales). */
  decayPerDay: number;
  /** Peso base por regla. */
  rules: Record<AnticheatRule, number>;
}

/** Perfil de MuzicMania (primer juego integrado). */
export const MUZICMANIA_PROFILE: AnticheatProfile = {
  game: 'muzicmania',
  threshold: 80,
  watchAt: 20,
  suspiciousAt: 50,
  decayPerDay: 0.9,
  rules: {
    perfect_streak: 15,
    impossible_score: 50,
    speed_anomaly: 40,
    value_tamper: 60,
    bot_pattern: 30,
    stat_outlier: 10,
  },
};

/** Nivel de cuenta/anticheat para un score acumulado. */
export function levelFor(score: number, profile: AnticheatProfile): AnticheatLevel {
  if (score >= profile.threshold) return 'flagged';
  if (score >= profile.suspiciousAt) return 'suspicious';
  if (score >= profile.watchAt) return 'watch';
  return 'clean';
}

/** Aplica el decaimiento temporal al score acumulado. */
export function applyDecay(
  score: number,
  lastUpdatedMs: number,
  profile: AnticheatProfile,
  nowMs: number = Date.now(),
): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  const days = Math.max(0, (nowMs - lastUpdatedMs) / 86_400_000);
  if (days < 1) return score;
  return score * Math.pow(profile.decayPerDay, Math.floor(days));
}

/** Suma de señales (los pesos ya vienen contextualizados por el juego). */
export function scoreSignals(signals: AnticheatSignal[]): number {
  return signals.reduce((acc, s) => acc + (Number.isFinite(s.weight) ? s.weight : 0), 0);
}

export interface EvaluationInput {
  profile: AnticheatProfile;
  /** Score acumulado previo (de `anticheat.scores`). */
  currentScore: number;
  /** Fecha del último update (ms epoch). */
  lastUpdatedMs: number;
  /** Señales nuevas ya ponderadas por el juego. */
  signals: AnticheatSignal[];
  nowMs?: number;
}

export interface Evaluation {
  score: number;
  level: AnticheatLevel;
  /** true cuando la evaluación anterior NO estaba flagged y ahora sí (dispara acción). */
  escalate: boolean;
  added: number;
}

/**
 * Evalúa las señales nuevas sobre el score acumulado (con decaimiento).
 * `escalate` marca el momento exacto en el que el sistema debe actuar
 * (solo la primera vez que cruza el umbral; después ya está flagged).
 */
export function evaluate(input: EvaluationInput): Evaluation {
  const now = input.nowMs ?? Date.now();
  const decayed = applyDecay(input.currentScore, input.lastUpdatedMs, input.profile, now);
  const prevLevel = levelFor(decayed, input.profile);
  const added = scoreSignals(input.signals);
  const score = decayed + added;
  const level = levelFor(score, input.profile);
  return {
    score: Math.round(score * 100) / 100,
    level,
    escalate: prevLevel !== 'flagged' && level === 'flagged',
    added,
  };
}

/* --------------------- Constructores de señales (MuzicMania) --------------------- */

export interface MuzicScoreSample {
  score: number;
  accuracy: number;
  maxCombo: number;
  difficulty?: string | null;
  trackId: string;
  createdAtMs: number;
}

/** Multiplicador por dificultad (perfiles conocidos del juego). */
export function difficultyMultiplier(difficulty?: string | null): number {
  const d = (difficulty ?? '').toLowerCase();
  if (['expert', 'experto', 'insane', 'extremo'].includes(d)) return 2;
  if (['hard', 'dificil', 'difícil'].includes(d)) return 1.6;
  if (['normal', 'medium', 'medio'].includes(d)) return 1.2;
  if (['easy', 'facil', 'fácil'].includes(d)) return 1;
  return 1.2;
}

/**
 * Construye las señales del anticheat para una nueva puntuación de MuzicMania a
 * partir del histórico reciente (últimas ~10 partidas). NO emite señales de
 * puntuaciones normales: solo de anomalías, con contexto (dificultad/racha).
 */
export function buildMuzicmaniaSignals(
  entry: MuzicScoreSample,
  history: MuzicScoreSample[],
  nowMs: number = Date.now(),
): AnticheatSignal[] {
  const signals: AnticheatSignal[] = [];
  const mult = difficultyMultiplier(entry.difficulty);
  const P = MUZICMANIA_PROFILE.rules;

  // 1) Valores imposibles/alterados: nunca penalizan jugadas normales.
  if (!Number.isFinite(entry.accuracy) || entry.accuracy < 0 || entry.accuracy > 100) {
    signals.push({ rule: 'value_tamper', weight: P.value_tamper * mult, details: { accuracy: entry.accuracy } });
  }
  if (!Number.isFinite(entry.score) || entry.score < 0 || !Number.isInteger(entry.score)) {
    signals.push({ rule: 'value_tamper', weight: P.value_tamper, details: { score: entry.score } });
  }
  if (entry.maxCombo > Math.max(1, entry.score)) {
    signals.push({ rule: 'impossible_score', weight: P.impossible_score, details: { maxCombo: entry.maxCombo, score: entry.score } });
  }
  // Partida “demasiado perfecta”: 100% de precisión es legal; el peso depende de
  // la dificultad y de lo que venga detrás (la racha).
  const isPerfect = entry.accuracy >= 100;

  // 2) Racha de perfectos (el caso del enunciado: 3 seguidos sin fallar).
  if (isPerfect) {
    let streak = 1;
    for (let i = history.length - 1; i >= 0 && streak < 5; i--) {
      const h = history[i];
      if (!h || nowMs - h.createdAtMs > 3 * 60 * 60 * 1000) break; // solo sesión reciente
      if (h.accuracy >= 100) streak++;
      else break;
    }
    if (streak >= 2) {
      signals.push({ rule: 'perfect_streak', weight: P.perfect_streak * mult * Math.min(streak - 1, 3), details: { streak, difficulty: entry.difficulty } });
    }
  }

  // 3) Patrón de bot: precisión exactamente idéntica en partidas seguidas del
  //    mismo track (misma puntuación al dígito durante la sesión).
  const sameTrack = history.filter((h) => h.trackId === entry.trackId).slice(-3);
  if (sameTrack.length >= 2 && sameTrack.every((h) => h.score === entry.score && h.accuracy === entry.accuracy)) {
    signals.push({ rule: 'bot_pattern', weight: P.bot_pattern * mult, details: { trackId: entry.trackId, repeats: sameTrack.length + 1 } });
  }

  // 4) Outlier de estadísticas: la última media docena de partidas se superó a
  //    sí misma en menos de 10 min (récord tras récord sin meseta).
  let rising = 0;
  for (let i = history.length - 1; i >= 1; i--) {
    if (nowMs - history[i].createdAtMs > 10 * 60 * 1000) break;
    if (history[i].score > history[i - 1].score) rising++;
    else break;
  }
  const lastScore = history.length ? history[history.length - 1].score : 0;
  if (rising >= 5 && entry.score > lastScore) {
    signals.push({ rule: 'stat_outlier', weight: P.stat_outlier, details: { rising } });
  }

  return signals;
}
