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
// FabStack: sistema de botones flotantes apilados (coordina PDWA + FeedbackFab)
export {
  FabStackProvider,
  useFabStack,
  useFabRestore,
  restoreFabButtons,
  FabRestore,
  FAB_BASE_BOTTOM,
  FAB_GAP,
} from './FabStack';
// Alias retro-compat (deprecated, usar InstallPdwaButton)
export { default as InstallPwaButton } from './InstallPdwaButton';
// CloudflareGuard: guard de acceso con Turnstile (compartido entre las webs)
export { default as CloudflareGuard } from './CloudflareGuard';
export type { CloudflareGuardProps } from './CloudflareGuard';
// Sistema de Formatos: imagen Capa 4 -> Capa 3 con fallback en cadena
export { default as SmartImage } from './SmartImage';
export type { SmartImageProps } from './SmartImage';
// Analíticas: PostHog (product analytics compartido; NO pisa Cloudflare Web Analytics)
export { default as PostHogAnalytics, captureEvent } from './PostHogAnalytics';
export type { PostHogAnalyticsProps } from './PostHogAnalytics';
// Re-exportar desde @ciszunetwork/cdn para conveniencia
export {
  resolveIcon,
  resolveAssetPath,
  assetResolver,
  cdnUrl,
  CDN_CONFIG,
  resolveDelivery,
  deliveryVariants,
} from '@ciszunetwork/cdn';
export type {
  IconStyle,
  IconFormat,
  ResolveOptions,
  AssetType,
} from '@ciszunetwork/cdn';
