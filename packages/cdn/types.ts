/**
 * Tipos para el sistema de iconos de Ciszu Network
 */

export type IconStyle = 'outline' | 'filled' | 'flag';
export type IconFormat = 'svg' | 'png' | 'ai';

export interface IconMetadata {
  name: string;
  style: IconStyle;
  formats: IconFormat[];
  tags: string[];
  category: string;
  description?: string;
}

export const ICON_CATEGORIES = {
  NAVIGATION: 'navigation',
  UI: 'ui',
  SOCIAL: 'social',
  ACTIONS: 'actions',
  FILES: 'files',
  DEVICES: 'devices',
  COMMUNICATION: 'communication',
  COMMERCE: 'commerce',
  WEATHER: 'weather',
  TRANSPORTATION: 'transportation',
  HEALTH: 'health',
  EDUCATION: 'education',
  GAMING: 'gaming',
  MUSIC: 'music',
} as const;

export type IconCategory = typeof ICON_CATEGORIES[keyof typeof ICON_CATEGORIES];

// Catálogo de iconos disponibles
export const ICON_CATALOG: Record<string, IconMetadata> = {
  home: {
    name: 'home',
    style: 'outline',
    formats: ['svg', 'png', 'ai'],
    tags: ['house', 'home', 'dwelling'],
    category: ICON_CATEGORIES.NAVIGATION,
    description: 'Icono de inicio/casa',
  },
  projects: {
    name: 'projects',
    style: 'outline',
    formats: ['svg', 'png', 'ai'],
    tags: ['projects', 'grid', 'apps'],
    category: ICON_CATEGORIES.NAVIGATION,
    description: 'Icono de proyectos',
  },
  about: {
    name: 'about',
    style: 'outline',
    formats: ['svg', 'png', 'ai'],
    tags: ['info', 'about', 'circle'],
    category: ICON_CATEGORIES.NAVIGATION,
    description: 'Icono de información',
  },
  // ... más iconos se pueden agregar aquí
};

/**
 * Busca iconos por categoría, estilo o tags
 */
export function searchIcons(query: {
  category?: IconCategory;
  style?: IconStyle;
  tags?: string[];
  searchTerm?: string;
}): IconMetadata[] {
  const { category, style, tags = [], searchTerm } = query;
  
  return Object.values(ICON_CATALOG).filter(icon => {
    if (category && icon.category !== category) return false;
    if (style && icon.style !== style) return false;
    if (tags.length > 0 && !tags.some(tag => icon.tags.includes(tag))) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        icon.name.toLowerCase().includes(term) ||
        icon.description?.toLowerCase().includes(term) ||
        icon.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    return true;
  });
}

/**
 * Genera un sprite SVG a partir de iconos seleccionados
 * (Útil para migración gradual del sistema antiguo)
 */
export function generateSpriteSvg(iconNames: string[]): string {
  const icons = iconNames
    .map(name => ICON_CATALOG[name])
    .filter((icon): icon is IconMetadata => !!icon);

  const symbols = icons.map(icon => {
    // En un sistema real, leeríamos el contenido SVG del archivo
    const svgContent = `<!-- SVG content for ${icon.name} -->`;
    return `<symbol id="${icon.name}" viewBox="0 0 24 24">${svgContent}</symbol>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols}
</svg>`;
}