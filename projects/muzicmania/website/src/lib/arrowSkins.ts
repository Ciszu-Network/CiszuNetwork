import { ArrowSkinId } from '@/types/level';

/**
 * ArrowSkin = skin exclusivo para las flechas/notas del juego.
 * No confundir con game-skins completos (UI, backgrounds, sonidos, etc).
 * En el futuro pueden existir otros sistemas de skins independientes.
 *
 * Sistema de skins:
 * - Cada skin tiene su carpeta en public/arrowskins/<id>/
 * - skin.json describe el skin (autor, version, estados, animaciones)
 * - Estados: normal, fail, press (cada flecha tiene su SVG/PNG)
 * - Hold trail: estela de notas mantenibles (head + body + tail)
 * - Animaciones: sprite sheet con JSON para animaciones en loop
 */

export interface ArrowSkinFileRefs {
  arrowUp: string;
  arrowDown: string;
  arrowLeft: string;
  arrowRight: string;
  arrowUpFail?: string;
  arrowDownFail?: string;
  arrowLeftFail?: string;
  arrowRightFail?: string;
  arrowUpPress?: string;
  arrowDownPress?: string;
  arrowLeftPress?: string;
  arrowRightPress?: string;
  holdTrail?: string;
  holdHead?: string;
  holdTail?: string;
  spriteSheet?: string | null;
  spriteJson?: string | null;
  arrowUpPng?: string;
  arrowDownPng?: string;
  arrowLeftPng?: string;
  arrowRightPng?: string;
  arrowUpFailPng?: string;
  arrowDownFailPng?: string;
  arrowLeftFailPng?: string;
  arrowRightFailPng?: string;
  arrowUpPressPng?: string;
  arrowDownPressPng?: string;
  arrowLeftPressPng?: string;
  arrowRightPressPng?: string;
  holdTrailPng?: string;
  holdHeadPng?: string;
  holdTailPng?: string;
}

export interface ArrowSkinDescriptor {
  id: ArrowSkinId;
  name: string;
  author: string;
  description: string;
  type: 'arrow';
  version: string;
  format: 'svg' | 'png' | ('svg' | 'png')[];
  colorType: ArrowSkinColorType;
  hasTrail: boolean;
  states: {
    normal: boolean;
    fail: boolean;
    press: boolean;
    holdTrail: boolean;
  };
  animations: boolean;
  hold: {
    tileMode: 'stretch' | 'repeat';
    parts: string[];
  };
  files: ArrowSkinFileRefs;
}

export type ArrowSkinColorType = 'direct' | 'hsv_mixed' | 'hsv_indirect';

export type ArrowState = 'normal' | 'fail' | 'press';

export interface ArrowSkin {
  id: ArrowSkinId;
  name: string;
  author: string;
  description: string;
  colorType: ArrowSkinColorType;
  hasTrail: boolean;
  drawArrow: (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    direction: number,
    color: string,
    state: ArrowState
  ) => void;
  drawHoldTrail?: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) => void;
  descriptor?: ArrowSkinDescriptor;
}

function drawDefaultArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  direction: number,
  color: string,
  state: ArrowState
) {
  ctx.save();
  ctx.translate(cx, cy);
  const rotations = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
  ctx.rotate(rotations[direction]);

  const isPress = state === 'press';
  const isFail = state === 'fail';

  if (isPress) {
    ctx.shadowBlur = 50;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
  } else if (isFail) {
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff2244';
    ctx.globalAlpha = 0.5;
  } else {
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
  }

  const s = isPress ? size * 1.08 : size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.6, s * 0.3);
  ctx.lineTo(s * 0.25, s * 0.15);
  ctx.lineTo(s * 0.25, s);
  ctx.lineTo(-s * 0.25, s);
  ctx.lineTo(-s * 0.25, s * 0.15);
  ctx.lineTo(-s * 0.6, s * 0.3);
  ctx.closePath();

  if (isFail) {
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = `${color}44`;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.35);
    ctx.lineTo(s * 0.35, s * 0.35);
    ctx.moveTo(-s * 0.35, s * 0.35);
    ctx.lineTo(s * 0.35, -s * 0.35);
    ctx.strokeStyle = '#ff2244';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  } else if (isPress) {
    const grad = ctx.createLinearGradient(-s, -s, s, s);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#e0e0ff');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    const grad = ctx.createLinearGradient(-s, -s, s, s);
    grad.addColorStop(0, `${color}dd`);
    grad.addColorStop(1, `${color}77`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawShinyArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  direction: number,
  color: string,
  state: ArrowState
) {
  ctx.save();
  ctx.translate(cx, cy);
  const rotations = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
  ctx.rotate(rotations[direction]);

  const s = size;
  const isPress = state === 'press';
  const isFail = state === 'fail';

  if (isPress) {
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffffff';
  } else if (isFail) {
    ctx.globalAlpha = 0.4;
  }

  ctx.beginPath();
  ctx.moveTo(0, -s * 1.1);
  ctx.lineTo(s * 0.5, -s * 0.2);
  ctx.lineTo(s * 0.7, s * 0.1);
  ctx.lineTo(s * 0.2, s * 0.1);
  ctx.lineTo(s * 0.2, s * 0.9);
  ctx.lineTo(-s * 0.2, s * 0.9);
  ctx.lineTo(-s * 0.2, s * 0.1);
  ctx.lineTo(-s * 0.7, s * 0.1);
  ctx.lineTo(-s * 0.5, -s * 0.2);
  ctx.closePath();

  const baseColor = isPress ? '#ffffff' : isFail ? '#ff444488' : `${color}66`;
  ctx.fillStyle = baseColor;
  ctx.fill();

  if (!isFail) {
    const c = ctx.createLinearGradient(-s, -s, s, s);
    c.addColorStop(0, isPress ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)');
    c.addColorStop(0.5, 'rgba(255,255,255,0)');
    c.addColorStop(1, 'rgba(255,255,255,0.2)');
    ctx.fillStyle = c;
    ctx.fill();
  }

  if (isFail) {
    ctx.strokeStyle = '#ff444488';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.5);
    ctx.lineTo(s * 0.5, s * 0.5);
    ctx.moveTo(-s * 0.5, s * 0.5);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.stroke();
  } else {
    ctx.strokeStyle = isPress ? color : `${color}88`;
    ctx.lineWidth = isPress ? 3 : 1.5;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawMinimalArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  direction: number,
  color: string,
  state: ArrowState
) {
  ctx.save();
  ctx.translate(cx, cy);
  const rotations = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
  ctx.rotate(rotations[direction]);
  const s = size;
  const isPress = state === 'press';
  const isFail = state === 'fail';

  const strokeC = isPress ? '#ffffff' : isFail ? '#ff444466' : `${color}44`;
  const lw = isPress ? 5 : isFail ? 1.5 : 2;

  ctx.strokeStyle = strokeC;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(0, isFail ? -s * 0.5 : -s);
  ctx.lineTo(s * 0.5, 0);
  ctx.moveTo(0, isFail ? -s * 0.5 : -s);
  ctx.lineTo(-s * 0.5, 0);
  ctx.stroke();

  if (!isFail) {
    const stemAlpha = isPress ? 0.8 : 0.2;
    ctx.strokeStyle = isPress ? '#ffffff' : `${color}44`;
    ctx.globalAlpha = stemAlpha;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(0, s);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#ff444466';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.4);
    ctx.lineTo(s * 0.4, s * 0.4);
    ctx.moveTo(-s * 0.4, s * 0.4);
    ctx.lineTo(s * 0.4, -s * 0.4);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawDefaultHoldTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, y + h, 0, y);
  grad.addColorStop(0, `${color}cc`);
  grad.addColorStop(0.3, `${color}50`);
  grad.addColorStop(1, `${color}10`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [4, 4, 0, 0]);
  ctx.fill();
  ctx.shadowBlur = 8;
  ctx.shadowColor = `${color}60`;
  ctx.strokeStyle = `${color}60`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [4, 4, 0, 0]);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawShinyHoldTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, `${color}99`);
  grad.addColorStop(0.3, `${color}60`);
  grad.addColorStop(1, `${color}05`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [0, 0, 6, 6]);
  ctx.fill();
  for (let i = 0; i < h; i += 12) {
    ctx.fillStyle = `${color}15`;
    ctx.fillRect(x, y + i, w, 2);
  }
  ctx.restore();
}

export const ARROW_SKINS: Record<ArrowSkinId, ArrowSkin> = {
  default: {
    id: 'default',
    name: 'Clásico',
    author: 'MuzicMania',
    description: 'Estilo clásico con brillo neón MuzicMania',
    colorType: 'hsv_indirect',
    hasTrail: true,
    drawArrow: drawDefaultArrow,
    drawHoldTrail: drawDefaultHoldTrail,
    descriptor: {
      id: 'default',
      name: 'Clásico',
      author: 'MuzicMania',
      description: 'Estilo clásico con brillo neón MuzicMania',
      type: 'arrow',
      colorType: 'hsv_indirect',
      hasTrail: true,
      version: '1.0',
      format: ['svg', 'png'],
      states: { normal: true, fail: true, press: true, holdTrail: true },
      animations: false,
      hold: { tileMode: 'stretch', parts: ['head', 'body', 'tail'] },
      files: {
        arrowUp: '/arrowskins/default/arrow-up.svg',
        arrowDown: '/arrowskins/default/arrow-down.svg',
        arrowLeft: '/arrowskins/default/arrow-left.svg',
        arrowRight: '/arrowskins/default/arrow-right.svg',
        arrowUpFail: '/arrowskins/default/arrow-up-fail.svg',
        arrowDownFail: '/arrowskins/default/arrow-down-fail.svg',
        arrowLeftFail: '/arrowskins/default/arrow-left-fail.svg',
        arrowRightFail: '/arrowskins/default/arrow-right-fail.svg',
        arrowUpPress: '/arrowskins/default/arrow-up-press.svg',
        arrowDownPress: '/arrowskins/default/arrow-down-press.svg',
        arrowLeftPress: '/arrowskins/default/arrow-left-press.svg',
        arrowRightPress: '/arrowskins/default/arrow-right-press.svg',
        holdTrail: '/arrowskins/default/hold-trail.svg',
        holdHead: '/arrowskins/default/hold-head.svg',
        holdTail: '/arrowskins/default/hold-tail.svg',
        spriteSheet: null,
        spriteJson: null,
        arrowUpPng: '/arrowskins/default/arrow-up.png',
        arrowDownPng: '/arrowskins/default/arrow-down.png',
        arrowLeftPng: '/arrowskins/default/arrow-left.png',
        arrowRightPng: '/arrowskins/default/arrow-right.png',
        arrowUpFailPng: '/arrowskins/default/arrow-up-fail.png',
        arrowDownFailPng: '/arrowskins/default/arrow-down-fail.png',
        arrowLeftFailPng: '/arrowskins/default/arrow-left-fail.png',
        arrowRightFailPng: '/arrowskins/default/arrow-right-fail.png',
        arrowUpPressPng: '/arrowskins/default/arrow-up-press.png',
        arrowDownPressPng: '/arrowskins/default/arrow-down-press.png',
        arrowLeftPressPng: '/arrowskins/default/arrow-left-press.png',
        arrowRightPressPng: '/arrowskins/default/arrow-right-press.png',
        holdTrailPng: '/arrowskins/default/hold-trail.png',
        holdHeadPng: '/arrowskins/default/hold-head.png',
        holdTailPng: '/arrowskins/default/hold-tail.png',
      },
    },
  },
  shiny: {
    id: 'shiny',
    name: 'Brillante',
    author: 'MuzicMania',
    description: 'Flechas con acabado brillante y reflejos',
    colorType: 'hsv_indirect',
    hasTrail: true,
    drawArrow: drawShinyArrow,
    drawHoldTrail: drawShinyHoldTrail,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    author: 'MuzicMania',
    description: 'Estilo minimalista de líneas',
    colorType: 'hsv_indirect',
    hasTrail: false,
    drawArrow: drawMinimalArrow,
    drawHoldTrail: drawDefaultHoldTrail,
  },
};

export const DEFAULT_ARROW_SKIN: ArrowSkinId = 'default';

export function getArrowSkin(id: ArrowSkinId): ArrowSkin {
  return ARROW_SKINS[id] || ARROW_SKINS[DEFAULT_ARROW_SKIN];
}

export function getSkinList(): ArrowSkin[] {
  return Object.values(ARROW_SKINS);
}

export function getArrowTrailSkin(skin: ArrowSkin): ArrowSkin {
  if (skin.hasTrail && skin.drawHoldTrail) return skin;
  return ARROW_SKINS[DEFAULT_ARROW_SKIN];
}
