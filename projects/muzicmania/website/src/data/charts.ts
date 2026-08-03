export interface GameEvent {
  time: number;
  lane: number;
}

export interface ChartData {
  trackId: string;
  events: GameEvent[];
}

/**
 * Generador algorítmico de charts basado en BPM y Dificultad.
 * Mantiene la generación predecible mediante una semilla simple (usando el ID del track)
 * para que todos jueguen exactamente el mismo mapa.
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateChart(trackId: string, durationSec: number, bpm: number, difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert'): ChartData {
  const events: GameEvent[] = [];
  const bps = bpm / 60;
  const beatInterval = 1 / bps; // tiempo en segundos entre cada beat
  
  // Modificadores de dificultad
  let noteDensity = 1; // 1 = cada beat, 0.5 = cada medio beat
  let chordProbability = 0; // probabilidad de generar un acorde (2 teclas)
  let tripleProbability = 0; // probabilidad de generar un triple (3 teclas)
  
  switch (difficulty) {
    case 'Easy':
      noteDensity = 1; 
      chordProbability = 0.05;
      break;
    case 'Normal':
      noteDensity = 0.5; // Medias notas
      chordProbability = 0.15;
      break;
    case 'Hard':
      noteDensity = 0.25; // Cuartos de nota
      chordProbability = 0.3;
      tripleProbability = 0.05;
      break;
    case 'Expert':
      noteDensity = 0.125; // Octavos (muy rápido)
      chordProbability = 0.4;
      tripleProbability = 0.15;
      break;
  }

  let seed = Array.from(trackId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Empezar a arrojar notas desde el segundo 3 hasta 2 segundos antes de terminar
  for (let t = 3; t < durationSec - 2; t += (beatInterval * noteDensity)) {
    // A veces omitimos notas para crear silencios y ritmo (10% de probabilidad de silencio)
    if (seededRandom(seed++) < 0.1) continue;

    const baseLane = Math.floor(seededRandom(seed++) * 4);
    events.push({ time: t, lane: baseLane });

    // Tirada para Acordes (Chords x2)
    if (seededRandom(seed++) < chordProbability) {
      let extraLane = Math.floor(seededRandom(seed++) * 4);
      while (extraLane === baseLane) {
        extraLane = Math.floor(seededRandom(seed++) * 4);
      }
      events.push({ time: t, lane: extraLane });

      // Tirada para Triples (Chords x3)
      if (seededRandom(seed++) < tripleProbability) {
        let thirdLane = Math.floor(seededRandom(seed++) * 4);
        while (thirdLane === baseLane || thirdLane === extraLane) {
          thirdLane = Math.floor(seededRandom(seed++) * 4);
        }
        events.push({ time: t, lane: thirdLane });
      }
    }
  }

  return {
    trackId,
    events
  };
}

// Caché en memoria para no recalcular siempre
const chartsCache: Record<string, ChartData> = {};

export function getChartForTrack(trackId: string, durationSec: number, bpm: number, difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert'): ChartData {
  if (!chartsCache[trackId]) {
    chartsCache[trackId] = generateChart(trackId, durationSec, bpm, difficulty);
  }
  return chartsCache[trackId];
}
