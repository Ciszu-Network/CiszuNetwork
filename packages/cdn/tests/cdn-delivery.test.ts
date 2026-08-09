import { describe, expect, it } from 'vitest';
import { deliveryVariants } from '../index';

describe('deliveryVariants (Sistema de Formatos — Capa 4)', () => {
  it('imagen foto: candidatos avif -> webp -> original', () => {
    const v = deliveryVariants('projects/ciszu/content/banners/images/banner.png');
    expect(v).toEqual([
      'projects/ciszu/content/banners/images/banner.avif',
      'projects/ciszu/content/banners/images/banner.webp',
      'projects/ciszu/content/banners/images/banner.png',
    ]);
  });

  it('logo png -> cadena avif -> webp -> original (fallback si no existe el avif)', () => {
    const v = deliveryVariants('projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png');
    expect(v).toEqual([
      'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.avif',
      'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.webp',
      'projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png',
    ]);
  });

  it('gif -> webp animado -> original', () => {
    const v = deliveryVariants('a/flyers/video/gif/anim.gif');
    expect(v).toEqual(['a/flyers/video/gif/anim.webp', 'a/flyers/video/gif/anim.gif']);
  });

  it('audio mp3 -> opus -> original', () => {
    const v = deliveryVariants('projects/muzica/content/music/albums/genesis_neon/cyber_beat/cyber_beat.mp3');
    expect(v).toEqual([
      'projects/muzica/content/music/albums/genesis_neon/cyber_beat/cyber_beat.opus',
      'projects/muzica/content/music/albums/genesis_neon/cyber_beat/cyber_beat.mp3',
    ]);
  });

  it('svg/docs sin derivadas -> propio original', () => {
    const v = deliveryVariants('shared/icons/svg/outline/home.svg');
    expect(v).toEqual(['shared/icons/svg/outline/home.svg']);
  });
});