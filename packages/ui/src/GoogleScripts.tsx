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
 */

/**
 * Limpia IDs de env (GTM/GA4/AdSense): si el valor se pegó desde un editor o
 * un .env guardado en Windows/UTF-8 con BOM, puede arrastrar un U+FEFF inicial
 * (se ve como %EF%BB%BF en la URL) o espacios; eso rompe el ID de Google y
 * dispara bloqueos de CSP al cargar con client=%EF%BB%BFca-pub-….
 */
function cleanId(v: string | undefined): string {
  return (v ?? '').replace(/^\uFEFF+/, '').trim();
}

export function GoogleScripts() {
  const gtm = cleanId(process.env.NEXT_PUBLIC_GTM_ID);
  const ga = cleanId(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
  const ads = cleanId(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  if (!gtm && !ga && !ads) return null;

  return (
    <>
      {ads && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads)}`}
          crossOrigin="anonymous"
        />
      )}
      {gtm && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
          }}
        />
      )}
      {gtm && (
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtm)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
      )}
      {ga && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{send_page_view:false});`,
            }}
          />
        </>
      )}
    </>
  );
}