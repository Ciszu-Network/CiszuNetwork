/**
 * ParticleSkin = sistema de partículas visuales independiente de ArrowSkin.
 * Controla efectos como perfect burst, miss, fallo, aciertos, etc.
 * Cada skin define sus sprites (SVG/PNG), cantidad, color, velocidad, animacion.
 * Soporta sprite sheets para animaciones en loop.
 */

export interface ParticleSprite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  spriteIndex?: number;
}

export type ParticleSkinColorType = 'direct' | 'hsv_mixed' | 'hsv_indirect';

export interface ParticleSkinDescriptor {
  id: string;
  name: string;
  author: string;
  description: string;
  type: 'particle';
  version: string;
  format: 'svg' | 'png' | 'spritesheet' | ('svg' | 'png' | 'spritesheet')[];
  colorType: ParticleSkinColorType;
  hasParticles: boolean;
  syncColorWithArrows?: boolean;
  config: {
    perfect: ParticleEffectConfig;
    great: ParticleEffectConfig;
    miss: ParticleEffectConfig;
    fail: ParticleEffectConfig;
  };
  files: {
    sprites?: string;
    spritesPng?: string;
    spriteSheet?: string;
    spriteJson?: string;
  };
}

export interface ParticleEffectConfig {
  count: number;
  sizeMin: number;
  sizeMax: number;
  speedMin: number;
  speedMax: number;
  lifeMs: number;
  colors: string[];
  shape: 'circle' | 'star' | 'diamond' | 'spark';
  rotation: boolean;
  gravity: number;
}

export interface ParticleSkin {
  id: string;
  name: string;
  author: string;
  description: string;
  colorType: ParticleSkinColorType;
  hasParticles: boolean;
  syncColorWithArrows: boolean;
  spawnParticles: (
    x: number,
    y: number,
    effect: keyof ParticleSkinDescriptor['config'],
    color?: string
  ) => ParticleSprite[];
  updateParticle: (p: ParticleSprite, dt: number) => ParticleSprite;
  renderParticle: (ctx: CanvasRenderingContext2D, p: ParticleSprite) => void;
  descriptor?: ParticleSkinDescriptor;
}

function spawnDefaultParticles(
  x: number,
  y: number,
  effect: keyof ParticleSkinDescriptor['config'],
  color?: string
): ParticleSprite[] {
  const configs: Record<string, { count: number; speed: number; life: number; colors: string[] }> = {
    perfect: { count: 12, speed: 4, life: 600, colors: ['#68cfff', '#b400ff', '#ff33cc', '#00ff88'] },
    great: { count: 6, speed: 3, life: 400, colors: ['#b400ff', '#a020f0'] },
    miss: { count: 4, speed: 2, life: 300, colors: ['#ff4444', '#ff6666'] },
    fail: { count: 3, speed: 1.5, life: 250, colors: ['#ff444488', '#ff222266'] },
  };

  const cfg = configs[effect] || configs.fail;
  const particles: ParticleSprite[] = [];

  for (let i = 0; i < cfg.count; i++) {
    const angle = (Math.PI * 2 * i) / cfg.count + (Math.random() - 0.5) * 0.5;
    const speed = cfg.speed * (0.5 + Math.random() * 0.8);
    const baseColor = color || cfg.colors[Math.floor(Math.random() * cfg.colors.length)];

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 3,
      color: baseColor,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  return particles;
}

function updateDefaultParticle(p: ParticleSprite, dt: number): ParticleSprite {
  return {
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vy: p.vy + 0.3,
    life: p.life - dt / 600,
    rotation: p.rotation + p.rotationSpeed,
  };
}

function renderDefaultParticle(ctx: CanvasRenderingContext2D, p: ParticleSprite) {
  if (p.life <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.life);
  ctx.fillStyle = p.color;
  ctx.shadowBlur = 8;
  ctx.shadowColor = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.beginPath();
  ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

export const PARTICLE_SKINS: Record<string, ParticleSkin> = {
  default: {
    id: 'default',
    name: 'Clásico',
    author: 'MuzicMania',
    description: 'Partículas circulares con brillo neón',
    colorType: 'hsv_indirect',
    hasParticles: true,
    syncColorWithArrows: true,
    spawnParticles: spawnDefaultParticles,
    updateParticle: updateDefaultParticle,
    renderParticle: renderDefaultParticle,
    descriptor: {
      id: 'default',
      name: 'Clásico',
      author: 'MuzicMania',
      description: 'Partículas circulares con brillo neón',
      type: 'particle',
      version: '1.0',
      format: ['svg', 'png'],
      colorType: 'hsv_indirect',
      hasParticles: true,
      syncColorWithArrows: true,
      config: {
        perfect: { count: 12, sizeMin: 2, sizeMax: 5, speedMin: 2, speedMax: 5, lifeMs: 600, colors: ['#68cfff', '#b400ff', '#ff33cc', '#00ff88'], shape: 'circle', rotation: true, gravity: 0.3 },
        great: { count: 6, sizeMin: 2, sizeMax: 4, speedMin: 1.5, speedMax: 4, lifeMs: 400, colors: ['#b400ff', '#a020f0'], shape: 'circle', rotation: true, gravity: 0.3 },
        miss: { count: 4, sizeMin: 1, sizeMax: 3, speedMin: 1, speedMax: 3, lifeMs: 300, colors: ['#ff4444', '#ff6666'], shape: 'circle', rotation: false, gravity: 0.4 },
        fail: { count: 3, sizeMin: 1, sizeMax: 2, speedMin: 0.5, speedMax: 2, lifeMs: 250, colors: ['#ff444488', '#ff222266'], shape: 'circle', rotation: false, gravity: 0.4 },
      },
      files: { sprites: '/projects/muzicmania/content/particleskins/default/particle.svg', spritesPng: '/projects/muzicmania/content/particleskins/default/particle.png' },
    },
  },
};

export const DEFAULT_PARTICLE_SKIN = 'default';

export function getParticleSkin(id: string): ParticleSkin {
  return PARTICLE_SKINS[id] || PARTICLE_SKINS[DEFAULT_PARTICLE_SKIN];
}

export function getParticleSkinList(): ParticleSkin[] {
  return Object.values(PARTICLE_SKINS);
}

export function ensureParticleSkin(skin: ParticleSkin): ParticleSkin {
  if (skin.hasParticles) return skin;
  return PARTICLE_SKINS[DEFAULT_PARTICLE_SKIN];
}
