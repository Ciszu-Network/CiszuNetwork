export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  duration_sec: number;
  bpm: number;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  stars: number;
  plays: number;
  downloads: number;
  likes: number;
  colorKey: 'cyan' | 'purple' | 'pink' | 'blue' | 'green' | 'orange';
  bgColor: string;
  hexColor: string;
  hexColor2: string;
  grad: string;
  url: string;
  cover_url?: string;
  on_soundcloud: boolean;
  description: string;
  copyright: string;
  release_date: string;
  icon?: string;
  global_record_score?: number;
  global_record_user?: string;
}

export const TRACK_COLOR_MAP: Record<string, { border: string; bg: string; text: string; shadow: string; glow: string }> = {
  cyan:   { border: 'border-neon-cyan',   bg: 'bg-neon-cyan/10',   text: 'text-neon-cyan',   shadow: 'shadow-neon-cyan',   glow: 'drop-shadow-neon-cyan' },
  purple: { border: 'border-neon-purple', bg: 'bg-neon-purple/10', text: 'text-neon-purple', shadow: 'shadow-neon-purple', glow: 'drop-shadow-neon-purple' },
  pink:   { border: 'border-neon-pink',   bg: 'bg-neon-pink/10',   text: 'text-neon-pink',   shadow: 'shadow-neon-pink',   glow: 'drop-shadow-neon-pink' },
  blue:   { border: 'border-neon-blue',   bg: 'bg-neon-blue/10',   text: 'text-neon-blue',   shadow: 'shadow-neon-blue',   glow: 'drop-shadow-neon-blue' },
  green:  { border: 'border-neon-green',  bg: 'bg-neon-green/10',  text: 'text-neon-green',  shadow: 'shadow-neon-green',  glow: 'drop-shadow-neon-green' },
  orange: { border: 'border-neon-orange', bg: 'bg-neon-orange/10', text: 'text-neon-orange', shadow: 'shadow-neon-orange', glow: 'drop-shadow-neon-orange' },
};

export function getStarColor(stars: number): string {
  if (stars <= 4)  return '#00ff88';
  if (stars <= 8)  return '#ffd900';
  if (stars <= 13) return '#ff6600';
  return '#ff2244';
}

export const TRACKS_DATA: Track[] = [
  { id: 'oled_darkness', name: 'OLED Darkness', artist: 'CiszukoAntony', album: 'Genesis Neon', duration: '5:01', duration_sec: 301, bpm: 110, difficulty: 'Easy', stars: 2, plays: 750, downloads: 120, likes: 0, colorKey: 'blue', bgColor: '#000a1a', hexColor: '#59b4ff', hexColor2: '#68cfff', grad: 'from-neon-blue to-neon-cyan',     url: '/music/albums/genesis_neon/oled_darkness/oled_darkness.ogg', description: 'Texturas atmosféricas y líneas de bajo profundas.', copyright: '© 2026 CiszukoAntony Music', release_date: '2026-01-25', icon: 'zap', global_record_score: 1250000, global_record_user: 'CiszuMaster', on_soundcloud: false },
  { id: 'neon_dreams', name: 'Neon Dreams', artist: 'CiszukoAntony', album: 'Genesis Neon', duration: '3:45', duration_sec: 225, bpm: 124, difficulty: 'Normal', stars: 5, plays: 1250, downloads: 450, likes: 0, colorKey: 'cyan', bgColor: '#00101a', hexColor: '#68cfff', hexColor2: '#4800ff', grad: 'from-neon-blue to-neon-purple',     url: '/music/albums/genesis_neon/neon_dreams/neon_dreams.ogg', description: 'Una odisea synthwave profunda a través de una metrópolis digital.', copyright: '© 2026 CiszukoAntony Music', release_date: '2026-01-10', icon: 'music', global_record_score: 2450000, global_record_user: 'NeonRider', on_soundcloud: false },
  { id: 'digital_soul', name: 'Digital Soul', artist: 'CiszukoAntony', album: 'Genesis Neon', duration: '4:12', duration_sec: 252, bpm: 128, difficulty: 'Hard', stars: 12, plays: 980, downloads: 320, likes: 0, colorKey: 'purple', bgColor: '#0a0018', hexColor: '#b400ff', hexColor2: '#ff33cc', grad: 'from-neon-purple to-neon-pink',     url: '/music/albums/genesis_neon/digital_soul/digital_soul.ogg', description: 'El corazón pulsante de la máquina. Melódico y emocional.', copyright: '© 2026 CiszukoAntony Music', release_date: '2026-01-15', icon: 'disc', global_record_score: 3100000, global_record_user: 'DigiGod', on_soundcloud: false },
  { id: 'cyber_beat', name: 'Cyber Beat', artist: 'CiszukoAntony', album: 'Genesis Neon', duration: '3:28', duration_sec: 208, bpm: 140, difficulty: 'Expert', stars: 18, plays: 2500, downloads: 890, likes: 0, colorKey: 'pink', bgColor: '#1a0010', hexColor: '#ff33cc', hexColor2: '#59b4ff', grad: 'from-neon-pink to-neon-blue',     url: '/music/albums/genesis_neon/cyber_beat/cyber_beat.ogg', description: 'Energía rítmica de alta precisión para máxima concentración.', copyright: '© 2026 CiszukoAntony Music', release_date: '2026-01-20', icon: 'terminal', global_record_score: 4500000, global_record_user: 'CyberPhantom', on_soundcloud: false },
];
