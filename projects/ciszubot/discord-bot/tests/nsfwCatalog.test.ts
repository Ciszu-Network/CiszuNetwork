import { describe, expect, it } from 'vitest';
import type { NsfwContentPreferences, NsfwFetish, NsfwLgbt } from '../src/services/configService';
import {
  effectiveGender,
  isNsfwSelectionEnabled,
  purrbotTag,
  resolveNsfwSelection,
} from '../src/services/nsfw/catalog';

function prefs(patch: {
  default_gender?: NsfwContentPreferences['default_gender'];
  lgbt?: Partial<Record<NsfwLgbt, boolean>>;
  fetishes?: Partial<Record<NsfwFetish, boolean>>;
} = {}): NsfwContentPreferences {
  return {
    default_gender: patch.default_gender ?? 'women',
    lgbt: {
      gay: true,
      lesbian: true,
      trans: true,
      bisexual: true,
      pansexual: true,
      nonbinary: true,
      ...patch.lgbt,
    },
    fetishes: {
      femboy: true,
      tomboy: true,
      blonde: true,
      ebony: true,
      latina: true,
      milf: true,
      feet: true,
      thighs: true,
      belly: true,
      ...patch.fetishes,
    },
  };
}

describe('catálogo +18', () => {
  it('resuelve aliases con estilo y género', () => {
    const animeGirl = resolveNsfwSelection('boobsanimegirl', []);
    expect(animeGirl?.def.base).toBe('boobs');
    expect(animeGirl?.style).toBe('anime');
    expect(animeGirl?.gender).toBe('girl');

    const realBoy = resolveNsfwSelection('waifurealboy', []);
    expect(realBoy?.def.base).toBe('waifu');
    expect(realBoy?.style).toBe('real');
    expect(realBoy?.gender).toBe('boy');
  });

  it('permite sobreescribir estilo, género y variante con argumentos', () => {
    const selection = resolveNsfwSelection('boobs', ['real', 'boy']);
    expect(selection?.style).toBe('real');
    expect(selection?.gender).toBe('boy');

    const threesome = resolveNsfwSelection('threesome', ['fff', 'cartoon']);
    expect(threesome?.variant).toBe('fff');
    expect(threesome?.style).toBe('cartoon');
  });

  it('usa ffm como variante por defecto del trío', () => {
    expect(resolveNsfwSelection('threesome', [])?.variant).toBe('ffm');
  });

  it('devuelve null para un alias desconocido', () => {
    expect(resolveNsfwSelection('no-existe', [])).toBeNull();
  });

  it('aplica el género por preferencia solo a comandos genéricos', () => {
    expect(effectiveGender(resolveNsfwSelection('solo', [])!, prefs({ default_gender: 'men' }))).toBe('boy');
    expect(effectiveGender(resolveNsfwSelection('solo', [])!, prefs({ default_gender: 'women' }))).toBe('girl');
    expect(effectiveGender(resolveNsfwSelection('gay', [])!, prefs({ default_gender: 'women' }))).toBe('boy');
    expect(effectiveGender(resolveNsfwSelection('lesbian', [])!, prefs({ default_gender: 'men' }))).toBe('girl');
  });

  it('respeta los toggles de LGBT y fetiches', () => {
    expect(isNsfwSelectionEnabled(resolveNsfwSelection('gay', [])!, prefs({ lgbt: { gay: false } }))).toBe(false);
    expect(isNsfwSelectionEnabled(resolveNsfwSelection('feet', [])!, prefs({ fetishes: { feet: false } }))).toBe(false);
    expect(isNsfwSelectionEnabled(resolveNsfwSelection('boobs', [])!, prefs())).toBe(true);
  });

  it('elige el tag correcto de Purrbot', () => {
    expect(purrbotTag(resolveNsfwSelection('waifu', [])!, 'girl')).toBe('neko');
    expect(purrbotTag(resolveNsfwSelection('waifu', [])!, 'boy')).toBe('solo_male');
    expect(purrbotTag(resolveNsfwSelection('threesome', ['fff'])!, 'mixed')).toBe('threesome_fff');
    expect(purrbotTag(resolveNsfwSelection('gay', [])!, 'boy')).toBe('yaoi');
  });
});
