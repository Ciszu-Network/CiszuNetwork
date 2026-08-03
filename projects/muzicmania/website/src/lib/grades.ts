export type GradeRank = 'F-' | 'F' | 'F+' | 'D-' | 'D' | 'D+' | 'C-' | 'C' | 'C+' | 'B-' | 'B' | 'B+' | 'A-' | 'A' | 'A+' | 'S' | 'SS' | 'SSS';

export interface GradeInfo {
  rank: GradeRank;
  label: string;
  color: string;
  accuracy: number;
}

const GRADE_TABLE: { min: number; rank: GradeRank; label: string }[] = [
  { min: 99.5, rank: 'SSS', label: 'PERFECTO' },
  { min: 99, rank: 'SS', label: 'EXCELENTE' },
  { min: 97, rank: 'S', label: 'SUPREMO' },
  { min: 95, rank: 'A+', label: 'ASOMBROSO+' },
  { min: 92, rank: 'A', label: 'ASOMBROSO' },
  { min: 89, rank: 'A-', label: 'ASOMBROSO-' },
  { min: 85, rank: 'B+', label: 'BUENO+' },
  { min: 80, rank: 'B', label: 'BUENO' },
  { min: 75, rank: 'B-', label: 'BUENO-' },
  { min: 70, rank: 'C+', label: 'COMÚN+' },
  { min: 65, rank: 'C', label: 'COMÚN' },
  { min: 60, rank: 'C-', label: 'COMÚN-' },
  { min: 55, rank: 'D+', label: 'DÉBIL+' },
  { min: 50, rank: 'D', label: 'DÉBIL' },
  { min: 45, rank: 'D-', label: 'DÉBIL-' },
  { min: 40, rank: 'F+', label: 'FRACASADO+' },
  { min: 35, rank: 'F', label: 'FRACASADO' },
  { min: 0, rank: 'F-', label: 'FRACASADO-' },
];

const GRADE_COLORS: Record<GradeRank, string> = {
  'SSS': '#ffd700',
  'SS': '#ffaa00',
  'S': '#ff66cc',
  'A+': '#68cfff',
  'A': '#4db8ff',
  'A-': '#3a9fff',
  'B+': '#b400ff',
  'B': '#9900e6',
  'B-': '#7f00cc',
  'C+': '#00ff88',
  'C': '#00cc6a',
  'C-': '#00994f',
  'D+': '#ffd900',
  'D': '#cca800',
  'D-': '#997a00',
  'F+': '#ff6600',
  'F': '#ff4444',
  'F-': '#cc2222',
};

export function getGrade(accuracy: number): GradeInfo {
  const entry = GRADE_TABLE.find(e => accuracy >= e.min) ?? GRADE_TABLE[GRADE_TABLE.length - 1];
  return {
    rank: entry.rank,
    label: entry.label,
    color: GRADE_COLORS[entry.rank] ?? '#ffffff',
    accuracy,
  };
}
