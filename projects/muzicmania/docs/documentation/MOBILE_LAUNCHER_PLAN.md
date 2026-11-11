# MOBILE_LAUNCHER_PLAN

**Versión:** 1.0
**Actualización:** 2026-11-10
**Identificador:** MOBILE_LAUNCHER_PLAN
**Definición:** Plan de empaquetado Android APK e iOS del launcher de MuzicMania.

## 1. Objetivo

Llevar el launcher de escritorio a Android e iOS sin bifurcar el producto: misma
inicialización, actualización, bienvenida, tutorial, login CISZU ID, hub pre-game y
arranque online/offline. En móvil no existen ventanas flotantes: toda la experiencia
ocupa la app completa y el splash es una vista interna.

El launcher de PC sigue siendo el objetivo principal. Móvil es una adaptación del
mismo flujo y de los mismos servicios.

## 2. Decisiones de arquitectura

- **Tauri v2 mobile** para Android (Kotlin + WebView) e iOS (Swift + WKWebView).
- Una sola SPA de launcher (`splash/index.html`, `launcher.css`, `launcher.js`) y un
  único shell Rust. Las vistas se adaptan con CSS `max-width`; no se crean apps
  separadas por plataforma.
- **OAuth del sistema** prioritario:
  - Android: Google Sign-In / Credential Manager o navegador del sistema con
    `ASWebAuthenticationSession` equivalente; callback mediante deep link
    `muzicmania://auth/callback`.
  - iOS: `ASWebAuthenticationSession` con Apple ID / Google; callback Universal Link
    o esquema registrado.
- La sesión CISZU ID se obtiene de la web y se devuelve al shell mediante el mismo
  callback que usa Windows (`/launcher-auth?session=...`), adaptado a deep link.
- El modo invitado offline usa el mismo almacenamiento local que PC.
- El hub ocupa la pantalla completa; las vistas de actualización, tutorial y login se
  presentan como pantallas internas a tamaño completo o modal centrado, nunca como
  ventanas del SO.
- En Android/iOS la actualización de la app se delega a Play Store/App Store; el
  update checker solo se usa para AAB/APK sideload o builds internas.

## 3. Estructura de proyecto

```text
projects/muzicmania/launcher/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   ├── gen/android/          # generado por tauri android init
│   └── gen/apple/            # generado por tauri ios init
├── src/                      # si se migra la SPA a framework; hoy splash/
└── android/                  # wrapper Gradle si Tauri lo requiere
```

## 4. Android

### 4.1 Requisitos

- Android Studio estable + Android SDK 35+.
- JDK 17.
- Rust targets: `aarch64-linux-android`, `armv7-linux-androideabi`,
  `x86_64-linux-android`.
- NDK 27+ y `cargo-ndk` o el toolchain que use Tauri v2.
- Firma de release en `android/keystore.properties` (NUNCA en git) o vault local.

### 4.2 Flujo de build

1. `pnpm --filter muzicmania-website build` si el launcher se sirve desde assets web;
   en Tauri el frontend es local y se empaqueta.
2. `pnpm tauri android init`.
3. Configurar `tauri.conf.json` móvil: identifier `com.ciszunetwork.muzicmania`,
   orientación landscape, fullscreen y `mobile.entry`.
4. `pnpm tauri android build --apk` para APK de pruebas.
5. `pnpm tauri android build --aab` para Play Store.
6. Verificar que el WebView tenga WebGL/audio habilitados para el juego online.

### 4.3 OAuth Android

- Usar Credential Manager/Google Identity para Google.
- Registrar SHA-256 del keystore y el client ID en Google Cloud.
- Callback: intent-filter `muzicmania://auth/callback` y, si se publica, App Links.
- El token de CISZU ID se entrega al shell sin pasar por logs.
- Si Google no está disponible, ofrecer correo/contraseña en el WebView de CISZU ID;
  nunca permitir registro desde el launcher.

## 5. iOS

### 5.1 Requisitos

- macOS + Xcode 16+.
- Rust targets iOS (`aarch64-apple-ios`, simulador).
- Apple Developer Program, bundle ID, provisioning profiles y Associated Domains.
- Firma y notarización gestionadas por Xcode.

### 5.2 Flujo de build

1. `pnpm tauri ios init`.
2. Configurar `WKWebView`, audio de fondo y orientación landscape.
3. `pnpm tauri ios build` para simulator/device.
4. Archivo `.ipa`/TestFlight desde Xcode Organizer.
5. Revisar App Store Review Guidelines para login, contenido de usuario y compras.

### 5.3 OAuth iOS

- `ASWebAuthenticationSession` para Apple ID/Google.
- `CFBundleURLTypes` con `muzicmania`.
- Universal Links para `muzicmania.vercel.app/launcher-auth` cuando el dominio esté
  configurado en Apple Developer.
- Keychain para refresh tokens si se mantiene sesión; nunca UserDefaults en claro.

## 6. Flujo de launcher móvil

1. Splash fullscreen: logo, progreso, versión.
2. Update check: en store se omite; en sideload descarga APK/IPA y abre el instalador
   del sistema.
3. Tutorial de primera ejecución.
4. Login CISZU ID con OAuth del OS; offline salta a invitado.
5. Hub fullscreen con las mismas tarjetas y acciones que PC.
6. Jugar online abre el juego en el WebView fullscreen; offline abre las pistas
   locales.
7. Cuenta y ajustes dentro del hub; enlace a web para perfil completo.

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| WebView móvil sin WebGL/audio suficiente | Pruebas de rendimiento en gama media; fallback de calidad |
| OAuth distinto entre plataformas | Interfaz común y proveedor por plataforma |
| Escalado de UI del hub | CSS responsive y safe-area insets |
| Actualizaciones fuera de tienda | Solo builds internas/sideload; no saltarse políticas de store |
| Tokens en logs | Nunca imprimir tokens; almacenamiento seguro Keychain/Keystore |
| Tamaño de asset offline | Pistas opus locales ya optimizadas |

## 8. Criterios de aceptación

- APK debug instala y completa splash → tutorial → login/invitado → hub.
- OAuth Google funciona en Android con callback profundo.
- iOS ASWebAuthenticationSession completa login y devuelve sesión.
- Hub y juego funcionan landscape, fullscreen y sin ventanas del SO.
- Offline usa invitado y pistas locales.
- Logout limpia sesión local y vuelve a login/ invitado.
- Builds no incluyen secretos; firma y credenciales viven fuera del repo.

## 9. Estado

Planificado. La implementación Android/iOS queda pendiente de Android Studio, Xcode,
cuentas de desarrollador y firma. El launcher web compartido se mantiene listo para
reutilizarse en Tauri mobile.

_Última revisión: 10 nov 2026. Relacionados: `TAURI_SYSTEM`, `PROJECT_STATE`,
`AUTH_SYSTEM`, `LOCAL_TESTING_PROTOCOLS`._
