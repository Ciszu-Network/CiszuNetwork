/**
 * GoogleScripts — renderiza los scripts de Google de forma ESTÁTICA (SSR).
 *
 * Server component (sin 'use client'): inyecta en el HTML inicial el loader de
 * GTM para que los crawlers de Google lo vean y la VERIFICACIÓN de AdSense
 * funcione (un script inyectado solo con JS no es detectado por el rastreador).
 *
 * DESDE oct 2026, TODO el tracking vive en GTM (tags en los contenedores):
 *   - GA4: tag "GA4 - Configuración" (gtag) con send_page_view=false.
 *   - AdSense: tag "AdSense - Head" (custom HTML).
 * Aquí solo se carga el contenedor GTM (más el guard de consentimiento).
 *
 * Env (por web): NEXT_PUBLIC_GTM_ID. Sin env → no renderiza el loader (solo el
 * guard). GA4/AdSense ya no se cargan directo; los gestiona GTM.
 *
 * Uso (en cada layout, justo después de abrir <body>):
 *   <GoogleScripts />
 *
 * CONSENTIMIENTO DE COOKIES: este componente incluye el guard de consentimiento
 * (COOKIE_CONSENT_GUARD_JS) ANTES que los scripts de Google. Si el usuario
 * rechazó las cookies (cookies_accepted === 'false'), el guard elimina del DOM
 * los scripts de Google antes de que se ejecuten (los async se cancelan al
 * quitar el nodo; los inline de config se envuelven en un check de
 * window.__ciszuCookieConsent). Así Google Analytics, GTM y AdSense quedan
 * DESACTIVADOS sin romper nada (degradación segura).
 *
 * OJO con los atributos de los scripts EXTERNOS: los externos se matan por
 * PATRÓN DE URL desde el guard (googletagmanager.com, pagead2.googlesyndication
 * .com, google-analytics.com); el atributo data-cookie-consent se reserva a los
 * scripts INLINE de configuración, que no se pueden identificar por src.
 */

import { COOKIE_CONSENT_GUARD_JS } from './cookieConsent';

/**
 * Limpia IDs de env (GTM): si el valor se pegó desde un editor o un .env
 * guardado en Windows/UTF-8 con BOM, puede arrastrar un U+FEFF inicial (se ve
 * como %EF%BB%BF en la URL) o espacios; eso rompe el ID de Google y dispara
 * bloqueos de CSP al cargar con id=%EF%BB%BFGTM-….
 */
function cleanId(v: string | undefined): string {
  return (v ?? '').replace(/^\uFEFF+/, '').trim();
}

/** Envuelve un script inline para que NO corra si el usuario rechazó cookies. */
function consentInline(body: string): string {
  return `if (window.__ciszuCookieConsent !== 'rejected') { ${body} }`;
}

export function GoogleScripts() {
  const gtm = cleanId(process.env.NEXT_PUBLIC_GTM_ID);
  if (!gtm) {
    // Sin env no hay GTM, pero el guard igual define la variable global para el
    // resto del ecosistema (PostHog, beacon de Cloudflare…).
    return (
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: COOKIE_CONSENT_GUARD_JS }}
      />
    );
  }

  return (
    <>
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: COOKIE_CONSENT_GUARD_JS }} />
      <script
        suppressHydrationWarning
        data-cookie-consent="optional"
        dangerouslySetInnerHTML={{
          __html: consentInline(
            `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
          ),
        }}
      />
      <noscript
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtm)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        }}
      />
    </>
  );
}