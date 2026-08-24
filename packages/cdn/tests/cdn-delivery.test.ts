import { describe, expect, it } from 'vitest';
import { deliveryVariants } from '../index';

// NOTA: deliveryVariants devuelve [webp, original] para imágenes raster — AVIF
// se descarta por defecto porque el cliente no puede verificar la existencia de
// la derivada (pedir un .avif inexistente genera 400 en el CDN).

describe('deliveryVariants (Sistema de Formatos — Capa 4)', () => {
  it('imagen foto -> webp -> original (sin avif por defecto)', () => {
    const v = deliveryVariants('projects/ciszu/content/banners/images/banner.png');
    expect(v).toEqual([
      'projects/ciszu/content/banners/images/banner.webp',
      'projects/ciszu/content/banners/images/banner.png',
    ]);
    expect(v.some((p) => p.endsWith('.avif'))).toBe(false);
  });

  it('logo png -> webp -> original', () => {
    const v = deliveryVariants('projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png');
    expect(v).toEqual([
      'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.webp',
      'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png',
    ]);
  });

  it('gif -> webp animado -> original', () => {
    const v = deliveryVariants('a/flyers/video/gif/anim.gif');
    expect(v).toEqual(['a/flyers/video/gif/anim.webp', 'a/flyers/video/gif/anim.gif']);
  });

  it('audio mp3 -> opus -> original', () => {
    const v = deliveryVariants('projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cyber_beat.mp3');
    expect(v).toEqual([
      'projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cyber_beat.opus',
      'projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cyber_beat.mp3',
    ]);
  });

  it('svg/docs sin derivadas -> propio original', () => {
    const v = deliveryVariants('shared/icons/svg/outline/home.svg');
    expect(v).toEqual(['shared/icons/svg/outline/home.svg']);
  });

  it('path avif explícito -> se mantiene (el original es el avif)', () => {
    const v = deliveryVariants('projects/ciszu/content/banners/images/banner.avif');
    expect(v).toEqual(['projects/ciszu/content/banners/images/banner.avif']);
  });
});