/**
 * GoogleScripts — renderiza los scripts de Google de forma ESTÁTICA (SSR).
 *
 * Server component (sin 'use client'): inyecta en el HTML inicial las etiquetas
 * de GTM, GA4 y AdSense para que los crawlers de Google las vean y la
 * VERIFICACIÓN de AdSense funcione (un script inyectado solo con JS no es
 * detectado por el rastreador).
 *
 * Env (por web): NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_GA4_MEASUREMENT_ID,
 * NEXT_PUBLIC_ADSENSE_CLIENT. Sin env → no renderiza nada.
 *
 * Uso (en cada layout, justo después de abrir <body>):
 *   <GoogleScripts />
 *
 * CONSENTIMIENTO DE COOKIES: este componente incluye el guard de consentimiento
 * (COOKIE_CONSENT_GUARD_JS) ANTES que los scripts de Google. Si el usuario
 * rechazó las cookies (cookies_accepted === 'false'), el guard elimina del DOM
 * los scripts marcados con data-cookie-consent="optional" antes de que se
 * ejecuten (los async se cancelan al quitar el nodo; los inline de config se
 * envuelven en un check de window.__ciszuCookieConsent). Así Google Analytics,
 * GTM y AdSense quedan DESACTIVADOS sin romper nada (degradación segura).
 */

import { COOKIE_CONSENT_GUARD_JS } from './cookieConsent';

/**
 * Limpia IDs de env (GTM/GA4/AdSense): si el valor se pegó desde un editor o
 * un .env guardado en Windows/UTF-8 con BOM, puede arrastrar un U+FEFF inicial
 * (se ve como %EF%BB%BF en la URL) o espacios; eso rompe el ID de Google y
 * dispara bloqueos de CSP al cargar con client=%EF%BB%BFca-pub-….
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
  const ga = cleanId(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
  const ads = cleanId(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  if (!gtm && !ga && !ads) {
    // Sin env no hay scripts de Google, pero el guard igual define la variable
    // global para el resto del ecosistema (PostHog, beacon de Cloudflare…).
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
      {ads && (
        <script
          suppressHydrationWarning
          async
          data-cookie-consent="optional"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads)}`}
          crossOrigin="anonymous"
        />
      )}
      {gtm && (
        <script
          suppressHydrationWarning
          data-cookie-consent="optional"
          dangerouslySetInnerHTML={{
            __html: consentInline(
              `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
            ),
          }}
        />
      )}
      {gtm && (
        <noscript
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtm)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
      )}
      {ga && (
        <>
          <script suppressHydrationWarning async data-cookie-consent="optional" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} />
          <script
            suppressHydrationWarning
            data-cookie-consent="optional"
            dangerouslySetInnerHTML={{
              __html: consentInline(
                `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{send_page_view:false});`,
              ),
            }}
          />
        </>
      )}
    </>
  );
}