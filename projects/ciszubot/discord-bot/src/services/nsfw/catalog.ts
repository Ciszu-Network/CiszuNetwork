import type {
  NsfwContentPreferences,
  NsfwFetish,
  NsfwLgbt,
} from '../configService';

export type NsfwStyle = 'anime' | 'cartoon' | 'real';
export type NsfwCommandGender = 'girl' | 'boy' | 'mixed';

export const NSFW_STYLES: NsfwStyle[] = ['anime', 'cartoon', 'real'];
export const NSFW_GENDERS: NsfwCommandGender[] = ['girl', 'boy', 'mixed'];

export interface NsfwBaseDef {
  base: string;
  label: string;
  description: string;
  group: 'acts' | 'body' | 'waifu' | 'lgbt' | 'fetish';
  genders: NsfwCommandGender[];
  defaultStyle: NsfwStyle;
  defaultGender: NsfwCommandGender | 'preference';
  purrbot?: string | Partial<Record<NsfwCommandGender, string[]>>;
  purrbotVariants?: Record<string, string>;
  lgbt?: NsfwLgbt;
  fetish?: NsfwFetish;
  search?: string;
  extraAliases?: string[];
  usage?: string;
}

export interface NsfwSelection {
  def: NsfwBaseDef;
  style: NsfwStyle;
  gender: NsfwCommandGender | 'preference';
  variant?: string;
}

const ALL_GENDERS: NsfwCommandGender[] = ['girl', 'boy', 'mixed'];

export const NSFW_BASES: NsfwBaseDef[] = [
  {
    base: 'nsfwpic',
    label: 'Imagen +18',
    description: 'Imagen +18 aleatoria',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'neko',
    search: 'nsfw',
    extraAliases: ['nsfw', 'pic18'],
  },
  {
    base: 'fuck',
    label: 'Sexo',
    description: 'Contenido +18 de sexo',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'fuck',
    search: 'fuck',
  },
  {
    base: 'blowjob',
    label: 'Mamada',
    description: 'Contenido +18 de sexo oral',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'blowjob',
    search: 'blowjob',
  },
  {
    base: 'anal',
    label: 'Anal',
    description: 'Contenido +18 anal',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'anal',
    search: 'anal',
  },
  {
    base: 'cum',
    label: 'Cum',
    description: 'Contenido +18 de eyaculación',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'cum',
    search: 'cum',
  },
  {
    base: 'pussylick',
    label: 'Pussylick',
    description: 'Contenido +18 de sexo oral femenino',
    group: 'acts',
    genders: ['girl', 'mixed'],
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'pussylick',
    search: 'pussy lick',
  },
  {
    base: 'solo',
    label: 'Solo',
    description: 'Contenido +18 en solitario',
    group: 'acts',
    genders: ['girl', 'mixed'],
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'solo',
    search: 'solo',
  },
  {
    base: 'solomale',
    label: 'Solo masculino',
    description: 'Contenido +18 masculino en solitario',
    group: 'acts',
    genders: ['boy'],
    defaultStyle: 'anime',
    defaultGender: 'boy',
    purrbot: 'solo_male',
    search: 'solo male',
  },
  {
    base: 'threesome',
    label: 'Trío',
    description: 'Contenido +18 de trío',
    group: 'acts',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'mixed',
    purrbot: 'threesome_ffm',
    purrbotVariants: {
      fff: 'threesome_fff',
      ffm: 'threesome_ffm',
      mmf: 'threesome_mmf',
    },
    search: 'threesome',
    usage: 'cz!threesome [fff|ffm|mmf] [estilo] [género]',
  },
  {
    base: 'neko',
    label: 'Neko',
    description: 'Contenido +18 de neko',
    group: 'acts',
    genders: ['girl', 'mixed'],
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: 'neko',
    search: 'neko',
  },
  {
    base: 'boobs',
    label: 'Pechos',
    description: 'Contenido +18 de pechos',
    group: 'body',
    genders: ['girl', 'mixed'],
    defaultStyle: 'real',
    defaultGender: 'girl',
    extraAliases: ['tetas', 'pechos', 'boob'],
    search: 'boobs',
  },
  {
    base: 'dick',
    label: 'Pene',
    description: 'Contenido +18 masculino',
    group: 'body',
    genders: ['boy', 'mixed'],
    defaultStyle: 'real',
    defaultGender: 'boy',
    extraAliases: ['polla', 'pene'],
    search: 'dick',
  },
  {
    base: 'ass',
    label: 'Culo',
    description: 'Contenido +18 de glúteos',
    group: 'body',
    genders: ALL_GENDERS,
    defaultStyle: 'real',
    defaultGender: 'mixed',
    extraAliases: ['culo', 'nalgas', 'butt'],
    search: 'ass',
  },
  {
    base: 'pussy',
    label: 'Vulva',
    description: 'Contenido +18 femenino',
    group: 'body',
    genders: ['girl'],
    defaultStyle: 'real',
    defaultGender: 'girl',
    extraAliases: ['vulva', 'vagina'],
    search: 'pussy',
  },
  {
    base: 'feet',
    label: 'Pies',
    description: 'Contenido +18 de pies',
    group: 'body',
    genders: ALL_GENDERS,
    defaultStyle: 'real',
    defaultGender: 'mixed',
    fetish: 'feet',
    extraAliases: ['pies', 'foot'],
    search: 'feet',
  },
  {
    base: 'thighs',
    label: 'Muslos',
    description: 'Contenido +18 de muslos',
    group: 'body',
    genders: ALL_GENDERS,
    defaultStyle: 'real',
    defaultGender: 'mixed',
    fetish: 'thighs',
    extraAliases: ['muslos'],
    search: 'thighs',
  },
  {
    base: 'belly',
    label: 'Vientre',
    description: 'Contenido +18 de vientre',
    group: 'body',
    genders: ALL_GENDERS,
    defaultStyle: 'real',
    defaultGender: 'mixed',
    fetish: 'belly',
    extraAliases: ['vientre'],
    search: 'belly',
  },
  {
    base: 'waifu',
    label: 'Waifu',
    description: 'Waifu +18',
    group: 'waifu',
    genders: ALL_GENDERS,
    defaultStyle: 'anime',
    defaultGender: 'preference',
    purrbot: {
      girl: ['neko'],
      boy: ['solo_male'],
      mixed: ['neko', 'solo_male'],
    },
    extraAliases: ['waifus'],
    search: 'waifu',
  },
  {
    base: 'gay',
    label: 'Gay',
    description: 'Contenido +18 gay',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'anime',
    defaultGender: 'boy',
    lgbt: 'gay',
    purrbot: 'yaoi',
    extraAliases: ['gays'],
    search: 'gay',
  },
  {
    base: 'lesbian',
    label: 'Lesbiana',
    description: 'Contenido +18 lésbico',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'anime',
    defaultGender: 'girl',
    lgbt: 'lesbian',
    purrbot: 'yuri',
    extraAliases: ['lesbiana', 'lesbianas'],
    search: 'lesbian',
  },
  {
    base: 'trans',
    label: 'Trans',
    description: 'Contenido +18 trans',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'mixed',
    lgbt: 'trans',
    extraAliases: ['transsexual', 'transexual', 'transgenero'],
    search: 'trans',
  },
  {
    base: 'bisexual',
    label: 'Bisexual',
    description: 'Contenido +18 bisexual',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'mixed',
    lgbt: 'bisexual',
    extraAliases: ['bi', 'bisexuales'],
    search: 'bisexual',
  },
  {
    base: 'pansexual',
    label: 'Pansexual',
    description: 'Contenido +18 pansexual',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'mixed',
    lgbt: 'pansexual',
    extraAliases: ['pan', 'pansexuales'],
    search: 'pansexual',
  },
  {
    base: 'nonbinary',
    label: 'No binario',
    description: 'Contenido +18 no binario',
    group: 'lgbt',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'mixed',
    lgbt: 'nonbinary',
    extraAliases: ['nobinario', 'nobinarie'],
    search: 'nonbinary',
  },
  {
    base: 'femboy',
    label: 'Femboy',
    description: 'Contenido +18 femboy',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'boy',
    fetish: 'femboy',
    extraAliases: ['femboys'],
    search: 'femboy',
  },
  {
    base: 'tomboy',
    label: 'Tomboy',
    description: 'Contenido +18 tomboy',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'girl',
    fetish: 'tomboy',
    search: 'tomboy',
  },
  {
    base: 'blonde',
    label: 'Rubias',
    description: 'Contenido +18 de rubias',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'girl',
    fetish: 'blonde',
    extraAliases: ['rubia', 'rubias'],
    search: 'blonde',
  },
  {
    base: 'ebony',
    label: 'Negras',
    description: 'Contenido +18 de mujeres negras',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'girl',
    fetish: 'ebony',
    extraAliases: ['negra', 'negras'],
    search: 'ebony',
  },
  {
    base: 'latina',
    label: 'Latinas',
    description: 'Contenido +18 de latinas',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'girl',
    fetish: 'latina',
    extraAliases: ['latinas'],
    search: 'latina',
  },
  {
    base: 'milf',
    label: 'MILF',
    description: 'Contenido +18 MILF',
    group: 'fetish',
    genders: [],
    defaultStyle: 'real',
    defaultGender: 'girl',
    fetish: 'milf',
    extraAliases: ['maduras'],
    search: 'milf',
  },
];

export const NSFW_BASE_MAP = new Map(NSFW_BASES.map((def) => [def.base, def]));

function buildAliases(def: NsfwBaseDef): string[] {
  const aliases = new Set<string>(def.extraAliases ?? []);
  if (def.lgbt || def.fetish || def.genders.length === 0) {
    for (const style of NSFW_STYLES) aliases.add(`${def.base}${style}`);
  } else {
    for (const style of NSFW_STYLES) {
      aliases.add(`${def.base}${style}`);
      for (const gender of def.genders) aliases.add(`${def.base}${style}${gender}`);
    }
    for (const gender of def.genders) aliases.add(`${def.base}${gender}`);
  }
  return [...aliases];
}

function defaultSelection(def: NsfwBaseDef): NsfwSelection {
  const variant = def.purrbotVariants
    ? 'ffm' in def.purrbotVariants
      ? 'ffm'
      : Object.keys(def.purrbotVariants)[0]
    : undefined;
  return { def, style: def.defaultStyle, gender: def.defaultGender, variant };
}

function aliasSelection(def: NsfwBaseDef, alias: string): NsfwSelection {
  const selection = defaultSelection(def);
  if (alias === def.base) return selection;
  const suffix = alias.slice(def.base.length);
  for (const style of NSFW_STYLES) {
    if (!suffix.startsWith(style)) continue;
    selection.style = style;
    const gender = suffix.slice(style.length);
    if (gender === 'girl' || gender === 'boy' || gender === 'mixed') selection.gender = gender;
    return selection;
  }
  if (suffix === 'girl' || suffix === 'boy' || suffix === 'mixed') selection.gender = suffix;
  return selection;
}

export const NSFW_ALIASES = new Map<string, NsfwSelection>();
for (const def of NSFW_BASES) {
  NSFW_ALIASES.set(def.base, defaultSelection(def));
  for (const alias of buildAliases(def)) {
    NSFW_ALIASES.set(alias, aliasSelection(def, alias));
  }
}

function isStyle(value: string): value is NsfwStyle {
  return (NSFW_STYLES as string[]).includes(value);
}

function isGender(value: string): value is NsfwCommandGender {
  return (NSFW_GENDERS as string[]).includes(value);
}

export function resolveNsfwSelection(invokedName: string, args: string[]): NsfwSelection | null {
  const name = invokedName.toLowerCase();
  const found = NSFW_ALIASES.get(name);
  if (!found) return null;
  const selection: NsfwSelection = { ...found };
  for (const arg of args) {
    const value = arg.toLowerCase();
    if (isStyle(value)) selection.style = value;
    else if (isGender(value)) selection.gender = value;
    else if (selection.def.purrbotVariants && value in selection.def.purrbotVariants) selection.variant = value;
  }
  return selection;
}

export function effectiveGender(
  selection: NsfwSelection,
  prefs: NsfwContentPreferences,
): NsfwCommandGender {
  if (selection.gender !== 'preference') return selection.gender;
  if (prefs.default_gender === 'men') return 'boy';
  if (prefs.default_gender === 'mixed') return 'mixed';
  return 'girl';
}

export function isNsfwSelectionEnabled(
  selection: NsfwSelection,
  prefs: NsfwContentPreferences,
): boolean {
  if (selection.def.lgbt && !prefs.lgbt[selection.def.lgbt]) return false;
  if (selection.def.fetish && !prefs.fetishes[selection.def.fetish]) return false;
  return true;
}

export function purrbotTag(selection: NsfwSelection, gender: NsfwCommandGender): string | undefined {
  const { def, variant } = selection;
  if (variant && def.purrbotVariants) return def.purrbotVariants[variant];
  if (typeof def.purrbot === 'string') return def.purrbot;
  if (def.purrbot) {
    const tags = def.purrbot[gender];
    if (!tags || tags.length === 0) return undefined;
    return tags[Math.floor(Math.random() * tags.length)];
  }
  return undefined;
}

export function nsfwAliasesFor(def: NsfwBaseDef): string[] {
  return buildAliases(def);
}
