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
// FabDismissHint: aviso al cerrar un FAB con contador de 3s y reactivación
export { default as FabDismissHint } from './FabDismissHint';
export type { FabDismissHintProps } from './FabDismissHint';
// Alias retro-compat (deprecated, usar InstallPdwaButton)
export { default as InstallPwaButton } from './InstallPdwaButton';
// CloudflareGuard: guard de acceso con Turnstile (compartido entre las webs)
export { default as CloudflareGuard } from './CloudflareGuard';
export type { CloudflareGuardProps } from './CloudflareGuard';
// AdBlockerGuard: detección de adblockers + concienciación (modal de bloqueo)
export { default as AdBlockerGuard } from './AdBlockerGuard';
export type { AdBlockerGuardProps } from './AdBlockerGuard';
// Sistema de Formatos: imagen Capa 4 -> Capa 3 con fallback en cadena
export { default as SmartImage } from './SmartImage';
export type { SmartImageProps } from './SmartImage';
// Analíticas: PostHog (product analytics compartido; NO pisa Cloudflare Web Analytics)
export { default as PostHogAnalytics, captureEvent } from './PostHogAnalytics';
// Analíticas: Google Analytics 4 (GA4, gtag.js) + eventos de anuncios
export { default as GoogleAnalytics, trackEvent } from './GoogleAnalytics';
export type { GoogleAnalyticsProps } from './GoogleAnalytics';
// Google: scripts estáticos (GTM + GA4 + AdSense) renderizados en SSR para crawlers/verificación
export { GoogleScripts } from './GoogleScripts';
// Guards de comportamiento: aviso de redirección (azul) + acciones no recuperables (rojo)
export { RedirectGuard, ActivityGuardProvider, useActivityGuard } from './BehaviorGuards';
// Anuncios: sistema de ads de Ciszu Network (intrusivos, particulares, recompensa, opcionales)
export { AdsProvider, useAds, useAdsSafe, AdFloat, AdPill, DEFAULT_AD_CATALOG } from './Ads';
export type { AdConfig, AdType, AdContent, AdsProviderProps, AdFloatProps, AdPillProps } from './Ads';
// Legal: enlace a la versión completa de las bases legales (ciszunetwork)
export { LegalCiszuLink } from './LegalCiszuLink';
export type { LegalCiszuLinkProps } from './LegalCiszuLink';
// Ciszugamens: isotipo oficial de la comunidad (botones Discord Server)
export { default as CiszugamensLogo } from './CiszugamensLogo';
export type { CiszugamensLogoProps } from './CiszugamensLogo';
// GlobalAdvisor: sistema de mensajes globales del admin (GLOBAL_ADVISOR_SYSTEM, TODO #3)
export { default as GlobalAdvisor } from './GlobalAdvisor';
export type { GlobalAdvisorProps, Announcement } from './GlobalAdvisor';
// Consentimiento de cookies: helpers + hook reactivo + guard script para layouts
export {
  getCookieConsent,
  setCookieConsent,
  clearCookieConsent,
  useCookieConsent,
  isCookieConsentRejected,
  isCookieConsentAccepted,
  COOKIE_CONSENT_GUARD_JS,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_EVENT,
} from './cookieConsent';
export type { CookieConsent } from './cookieConsent';
// Toast: sistema de notificación unificado (stack centrado inferior, colores por tipo)
export { default as ToastProvider, useToast } from './Toast';
export type { ToastProviderProps, ToastType, ToastData, ToastContextValue } from './Toast';
// Atoms portados desde los proyectos (librería de componentes reales)
export { default as Button } from './Button';
export type { ButtonProps } from './Button';
export { default as RichText } from './RichText';
export type { RichPart, RichTextProps } from './RichText';
export { default as VinylDisc } from './VinylDisc';
export type { VinylDiscProps } from './VinylDisc';
export { default as ScrollSpy } from './ScrollSpy';
export type { ScrollSpyItem } from './ScrollSpy';
// ScrollNavButton: flechas flotantes ir-arriba/ir-abajo (compartido entre footers)
export { default as ScrollNavButton } from './ScrollNavButton';
export type { ScrollNavButtonProps } from './ScrollNavButton';
export { default as FlagIcon } from './FlagIcon';
export { default as SocialIcon, SOCIAL_COLORS } from './SocialIcon';
export type { SocialPlatform } from './SocialIcon';
export { default as ZoomWarning, useZoomStatus, dismissZoomWarning, isZoomWarningActive } from './ZoomWarning';
export type { ZoomState, ZoomStatus } from './ZoomWarning';
// BetaDisclaimer: aviso BETA de extremo a extremo en la cabecera (descartable con X)
export { default as BetaDisclaimer } from './BetaDisclaimer';
export type { BetaDisclaimerProps } from './BetaDisclaimer';
// Sistema de disclaimers: stack global apilable que se adapta al header (full/island)
export {
  DisclaimerProvider,
  DisclaimerStack,
  DisclaimerDebug,
  GlobalDisclaimer,
  useDisclaimer,
  useHeaderMode,
  publishHeaderMode,
} from './Disclaimer';
export type {
  DisclaimerItem,
  DisclaimerKind,
  HeaderMode,
  DisclaimerStackProps,
  DebugDisclaimer,
  GlobalDisclaimerProps,
} from './Disclaimer';
// CopyWithButton: botón de copiar junto a contenido copiable (sistema anti-copy)
export { default as CopyWithButton, copyText } from './CopyWithButton';
export type { CopyWithButtonProps } from './CopyWithButton';
// Radix UI primitives: Modal accesible (Dialog con focus trap + teclado)
export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';
// Auth CISZU ID (LOGIN_REGISTER_PROTOCOLS): componentes compartidos de login/registro
export { default as AuthField } from './auth/AuthField';
export type { AuthFieldProps } from './auth/AuthField';
export { default as PasswordStrengthBar, evaluatePassword, MIN_ACCEPTABLE_SCORE, MAX_SCORE } from './auth/PasswordStrengthBar';
export { passwordMeetsMinimum } from './auth/passwordPolicy';
export { default as OAuthProviders, OAuthProviderButton, GoogleIcon, MicrosoftIcon, DiscordIcon } from './auth/OAuthProviders';
export type { OAuthProvidersProps, OAuthProviderButtonProps } from './auth/OAuthProviders';
export { default as CiszuIdBrand, BrandX } from './auth/CiszuIdBrand';
export type { CiszuIdBrandProps } from './auth/CiszuIdBrand';
export { default as AuthSecondaryActions } from './auth/AuthSecondaryActions';
export type { AuthSecondaryActionsProps } from './auth/AuthSecondaryActions';
export { default as AuthBenefitsPanel } from './auth/AuthBenefits';
export type { AuthBenefitsPanelProps, AuthBenefit } from './auth/AuthBenefits';
export { default as PreferencesModal } from './auth/PreferencesModal';
export type { PreferencesModalProps } from './auth/PreferencesModal';
// LanguagesModal: selector de idioma en modal centrado (preferencias locales, misma lista que el hamburguesa)
export { default as LanguagesModal } from './auth/LanguagesModal';
export type { LanguagesModalProps, LanguageOption } from './auth/LanguagesModal';
// Idioma: lista CANÓNICA compartida de idiomas (4 disponibles + bloqueados)
export {
  LANGUAGE_OPTIONS,
  AVAILABLE_LANG_CODES,
  isLangAvailable,
  getLangLabel,
  LANG_BLOCKED_MESSAGE,
} from './auth/languages';
export type { LangCode } from './auth/languages';
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
