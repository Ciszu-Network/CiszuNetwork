/**
 * Paquete de UI compartido para Ciszu Network
 *
 * Componentes reutilizables que siguen el sistema de diseño de Ciszu Network.
 */

// Componentes de Iconos (inline-first con fallback CDN)
export { Icon, IconButton, IconList, iconUtils } from './Icon';
export type { IconProps, IconButtonProps, IconListProps } from './Icon';


// PWA: registrador de service worker (usar en los layouts de las 4 webs)
export { default as PwaRegister } from './PwaRegister';
// PDWA: botón inteligente "Instalar PDWA" (esquina inf-izq, detecta navegador,
// dismiss local, disclaimer por navegador + app nativa opcional)
export { default as InstallPdwaButton } from './InstallPdwaButton';
export { detectPdwaBrowser } from './InstallPdwaButton';
export type { InstallPdwaButtonProps, PdwaBrowserInfo, BrowserId } from './InstallPdwaButton';
// Alias retro-compat (deprecated, usar InstallPdwaButton)
export { default as InstallPwaButton } from './InstallPdwaButton';
// Re-exportar desde @ciszunetwork/cdn para conveniencia
export {
  resolveIcon,
  resolveAssetPath,
  assetResolver,
  cdnUrl,
  CDN_CONFIG,
} from '@ciszunetwork/cdn';
export type {
  IconStyle,
  IconFormat,
  ResolveOptions,
  AssetType,
} from '@ciszunetwork/cdn';
