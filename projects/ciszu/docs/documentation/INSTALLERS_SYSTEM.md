# INSTALLERS_SYSTEM — Sistema de Instaladores y Distribución de Escritorio (Ciszu Network)

Versión: 1.1.0
Actualización: 2026-11-16
Identificador: INSTALLERS_SYSTEM_V1.1.0_2026_11_16_ciszunetwork

> **Definición**: sistema que documenta cómo se generan, instalan, mantienen, actualizan,
> reinstalan y distribuyen las aplicaciones de escritorio de Ciszu Network (MuzicMania con
> Tauri como referencia), incluyendo el hub de mantenimiento y el desinstalador.

---

## 1. ¿Qué es un instalador? (concepto)

Un **instalador** es un ejecutable que empaqueta una app y la coloca en el sistema del
usuario (crea accesos directos, registra la app, copia archivos). Formas comunes:

| Tipo | Extensión | Sistema | Qué hace |
|---|---|---|---|
| **NSIS** | `.exe` (setup) | Windows | Asistente de instalación |
| **MSI** | `.msi` | Windows | Instalador de Microsoft (Windows Installer) |
| **AppImage** | `.AppImage` | Linux | Portable sin instalación |
| **DMG** | `.dmg` | macOS | Disco de instalación |
| **Portable/ZIP** | `.zip` | Cualquiera | Descomprimir y ejecutar |

## 2. Framework de instalación: Tauri bundler

- Tauri 2 incluye **bundling nativo** (no hace falta herramienta externa).
- Genera instaladores de la plataforma desde `tauri build`.
- MuzicMania: **NSIS (`.exe`)** como instalador de Windows.

### 2.1 Cadena de build del instalador

```
pnpm --filter muzicmania-website tauri build
  → compila frontend (Next build/export)
  → compila binario Rust (release)
  → empaqueta en src-tauri/target/release/
     ├── bundle/nsis/*-setup.exe      (instalador NSIS)
     ├── bundle/msi/*.msi             (opcional)
     └── <app>.exe                    (binario portable)
```

### 2.2 Configuración del bundle

En `projects/muzicmania/launcher/src-tauri/tauri.conf.json`:

```json
{
  "productName": "MuzicMania",
  "version": "2.0.1",
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "identifier": "com.ciszunetwork.muzicmania",
    "publisher": "Ciszuko Antony"
  }
}
```

- `identifier` (bundle id) es único por app.
- Se puede activar `msi` añadiendo al array `targets`.
- Para Linux/macOS se añaden los targets correspondientes.

## 3. Distribución de instaladores

### 3.1 Ubicación en el repo

- Los instaladores se sirven vía **CDN / `public/downloads/`** de la web de MuzicMania.
- NO se suben al repo de Git (binarios grandes excluidos por `.gitignore`).

### 3.2 Ruta de descarga pública

```
https://muzicmania.vercel.app/downloads/MuzicMania-Setup-2.0.1.exe
```

- Se actualiza al publicar cada versión (cambiar `2.0.1` por la nueva versión).
- Ver `CDN_SYSTEM.md` para cómo sirven los assets.

### 3.3 Publicar una nueva versión

| Paso | Acción |
|---|---|
| 1 | Cambiar versión en `tauri.conf.json` (y `package.json`) |
| 2 | `pnpm --filter muzicmania-website tauri build` |
| 3 | Comprobar que se generó el `.exe` en `target/release/bundle/nsis/` |
| 4 | Subir a `public/downloads/` (o CDN) con el nuevo nombre/versión |
| 5 | Actualizar la página de descarga de MuzicMania |
| 6 | Actualizar `STATUS_SYSTEM.md` / changelog |

## 4. Verificación de instaladores (integridad)

- Probar instalación en Windows limpio (o máquina virtual).
- Comprobar que la app abre, la versión es correcta y el acceso directo se crea.
- Opcional: calcular **hash** (SHA-256) para publicarlo junto al enlace:

```powershell
Get-FileHash "MuzicMania-Setup-2.0.1.exe" -Algorithm SHA256
```

## 5. Firmas, reputación y falsos positivos de antivirus

### 5.1 Situación actual

El instalador se genera con Tauri + NSIS personalizado. Sin firma Authenticode, Windows
Defender y SmartScreen pueden marcarlo como sospechoso. Un caso real:

```text
Win32/Bearfoos.A!ml
```

`Win32/Bearfoos.A!ml` es una detección **heurística/ML**, no una firma de malware concreta.
Suele aparecer en instaladores NSIS sin firma que extraen y ejecutan un binario anidado, más
aún si el archivo se descargó de una carpeta de usuario y no tiene reputación.

Posibles causas:

- Instalador sin firma ni reputación.
- NSIS extrae el binario y lo ejecuta desde `$PLUGINSDIR` para mostrar la UI personalizada.
- El instalador descarga/ejecuta el setup de reinstall/update en otra fase.
- Copia en `downloads/` generada por el build local, sin historial de distribución.
- Compresión/empaquetado y cadenas genéricas de instalador.

### 5.2 Solución recomendada

1. **Firmar el binario y el instalador con Authenticode** (certificado OV; EV reduce más las
   alertas de SmartScreen).
2. Usar **timestamp** de una autoridad de sellado de tiempo.
3. Firmar el binario **antes** de empaquetar el NSIS y firmar el setup final.
4. Publicar el SHA-256 junto al enlace.
5. Enviar el falso positivo a Microsoft Security Intelligence con el hash y el enlace:
   `https://www.microsoft.com/en-us/wdsi/filesubmission`.
6. Distribuir siempre desde el dominio/CDN oficial, no desde enlaces temporales.
7. Probar en una VM limpia con Defender actualizado.
8. No añadir exclusiones de Defender al instalador de producción; solo para pruebas locales.

### 5.3 Firma disponible en el build

`projects/muzicmania/launcher/build-installer.ps1` llama a
`shared/scripts/sign-windows.ps1` antes y después de empaquetar. Variables:

```powershell
$env:CISZU_CODE_SIGN_CERT = "C:\ruta\certificado.pfx"
$env:CISZU_CODE_SIGN_PASSWORD = "..."   # no commitear
$env:CISZU_TIMESTAMP_URL = "http://timestamp.digicert.com"
pnpm --filter ... build
```

Sin `CISZU_CODE_SIGN_CERT`, el build avisa y produce un instalador sin firma. La firma es la
solución real; una exclusión local no debe considerarse una corrección.

### 5.4 Otras alternativas

- MSI firmado para despliegue empresarial.
- Publicación en Microsoft Store (si aplica).
- ZIP portable firmado para pruebas.
- Reducir ejecuciones anidadas en el instalador en versiones futuras.

## 6. Actualización, reinstalación y hub de mantenimiento

El instalador no es solo un asistente de primera instalación. Cuando detecta una instalación
existente abre el **hub de mantenimiento**:

| Acción | Qué hace | Qué NO hace |
|---|---|---|
| **Buscar actualización** | Consulta GitHub Releases, descarga el setup y lo aplica en modo silencioso | No desinstala ni borra datos locales |
| **Reinstalar** | Muestra el progreso Desinstalando → Instalando → Finalizando, ejecuta el desinstalador y después el instalador | No usa el flujo de update |
| **Desinstalar** | Cierra el instalador y abre el desinstalador oficial | No usa `window.confirm` ni deja procesos huérfanos |
| **Cerrar** | Aborta el IPC y cierra el instalador | No instala nada |

Reglas:

- **Update** y **Reinstall** son sistemas distintos. Update cambia archivos; Reinstall
  desinstala e instala literalmente.
- Update no debe perder la cuenta ni los datos locales.
- Reinstall conserva los datos locales (el desinstalador silencioso no borra `APPDATA`).
- La app debe estar cerrada antes de instalar, actualizar o desinstalar; se muestra un aviso
  modal y se cancela la operación si sigue abierta.
- Un desinstalador huérfano se cierra antes de abrir uno nuevo.
- Los errores se muestran en un modal propio; nunca en un diálogo de `localhost`.
- El flujo completo de shell está en `DESKTOP_SHELL_SYSTEM.md`.

### 6.1 Actualizaciones futuras

Tauri updater sigue siendo una opción cuando exista un endpoint `latest.json` firmado. La
implementación actual usa GitHub Releases + setup silencioso para que el instalador también
pueda actualizar sin depender del updater integrado.

## 7. Plataformas objetivo

| Plataforma | Instalador | Estado |
|---|---|---|
| Windows | NSIS `.exe` | ✅ Actual |
| Windows MSI | `.msi` | ⏳ Opcional |
| Linux | AppImage/DEB | ⏳ Futuro |
| macOS | DMG | ⏳ Futuro (requiere Apple) |

## 8. Comparativa de generadores de instaladores (evaluación)

| Herramienta | Windows | Linux | macOS | Notas |
|---|---|---|---|---|
| **Tauri bundler** | ✅ NSIS/MSI | ✅ AppImage/DEB | ✅ DMG | Elegido (integrado) |
| electron-builder | ✅ | ✅ | ✅ | Requiere Electron (rechazado) |
| WiX Toolset | ✅ MSI | ❌ | ❌ | Solo Windows, complejo |
| Inno Setup | ✅ | ❌ | ❌ | Solo Windows, manual |
| pkg (JS) | ✅ | ✅ | ✅ | Solo apps Node |

## 9. Checklist de release de instalador

- [ ] Versión actualizada en `tauri.conf.json` y web.
- [ ] `tauri build` completo y sin errores.
- [ ] `.exe` generado en `bundle/nsis/`.
- [ ] Probado en Windows (instalación + apertura).
- [ ] HUB detecta la instalación y abre mantenimiento.
- [ ] Update desde GitHub funciona sin desinstalar.
- [ ] Reinstall funciona y conserva datos locales.
- [ ] Uninstall desde el hub abre el desinstalador y cierra el instalador.
- [ ] Aviso de app en ejecución probado.
- [ ] Idioma del instalador, hub y notificación final probado.
- [ ] Subido a `public/downloads/` y página de descarga actualizada.
- [ ] Hash SHA-256 publicado (opcional).
- [ ] Changelog + `STATUS_SYSTEM.md` actualizados.

## 10. Terminología de instaladores (contexto informático)

| Término | Definición |
|---|---|
| **Instalador** | Programa que coloca la app en el sistema del usuario |
| **Bundle** | Empaquetado de la app lista para instalar |
| **Build** | Compilación del binario ejecutable |
| **Target** | Formato de salida del bundle (nsis, msi, appimage, dmg) |
| **ProductName** | Nombre visible de la app instalada |
| **Identifier** | ID único de la app (inversa de dominio) |
| **Publisher** | Nombre del publicador (firma) |
| **Setup** | Asistente de instalación de Windows |
| **Portable** | Ejecutable que no requiere instalación |
| **Checksum/hash** | Huella del archivo para verificar integridad |

## 11. Estructura de `src-tauri` (MuzicMania)

```
src-tauri/
├── Cargo.toml          # dependencias Rust
├── tauri.conf.json     # config de la app y bundle
├── capabilities/       # permisos del WebView
├── icons/              # iconos de la app
└── src/
    ├── main.rs         # entry point
    └── lib.rs          # lógica del backend Tauri
```

- Los comandos Rust (`#[tauri::command]`) se invocan desde el frontend con `invoke()`.
- La app embebe la web de MuzicMania (build previo).

## 12. Relación con el CDN y `public/downloads/`

- El binario NO se sube a Git (gitignored por tamaño).
- Se sirve desde `public/downloads/` de la web MuzicMania o desde el CDN Supabase.
- Ver `CDN_SYSTEM.md` para subir assets y `MEDIA_FORMATS_SYSTEM.md` para pesos.

## 13. Seguridad de instaladores

- Verificar que el binario generado corresponde al build oficial (hash).
- Publicar el hash SHA-256 junto al enlace para que el usuario pueda validar.
- SmartScreen: sin firma aparece advertencia; documentar en la página de descarga.
- No distribuir binarios externos/no oficiales.

## 14. Preguntas frecuentes

**¿Por qué Tauri y no Electron?** Tauri genera binarios de 5-10 MB y usa menos RAM;
Electron supera los 100 MB. Decisión fijada en `ARCHITECTURE.md`.

**¿MuzicMania se actualiza solo?** El instalador comprueba GitHub Releases y aplica el
setup en modo silencioso sin desinstalar. El launcher también tiene su propio flujo de
actualización. El updater dedicado con `latest.json` sigue como mejora futura.

**¿Hay versión para Linux/macOS?** El instalador oficial es Windows-first (NSIS). El
launcher ya se compila para Linux x64 y macOS arm64; los instaladores nativos de esas
plataformas están en roadmap.

**¿El instalador requiere WebView2?** Windows 11 lo trae; Windows 10 puede necesitar
instalarlo (aviso en la página de descarga).

## 15. Shell reutilizable

El instalador, el hub y el desinstalador forman parte del **Desktop Shell** oficial de Ciszu
Network. Para crear otro producto no se parte de cero:

```powershell
pnpm shell:new --target projects/<producto>/installer --config .\<producto>.shell.json --kind installer
```

- Documentación general: `DESKTOP_SHELL_SYSTEM.md`.
- Launcher: `LAUNCHER_SYSTEM.md`.
- Plantilla: `shared/templates/desktop-shell/`.
- Generador: `shared/scripts/scaffold-desktop-shell.mjs`.
- Referencia canónica: MuzicMania.

## 16. Resumen ejecutivo

- Instalador actual: **NSIS `.exe`** generado por **Tauri bundler**.
- Se distribuye desde `public/downloads/` + página de descarga.
- El instalador incluye **hub de mantenimiento**, **update**, **reinstall** y
  **uninstall**.
- El shell es reutilizable y está documentado en `DESKTOP_SHELL_SYSTEM.md`.
- El update usa manifiesto firmado, política de bloqueos y GitHub Releases; el hub conserva reinstalar/desinstalar.

## 17. Registro de builds, canales y archivo histórico

`build.config.json` es la fuente de `launcherVersion`, `gameVersion`, `channel`,
`buildDate`, `changelogUrl` y `releaseTag`. `build-installer.ps1` sincroniza
`Cargo.toml`/`tauri.conf.json`, genera `splash/build-info.js` y produce dos variantes:

```
downloads/<launcherVersion>/<channel>/<windows10|windows11>/
  MuzicMania_Game-v<game>_Launcher-v<launcher>_<channel>_<os>_x64.exe
```

- Se archiva el mismo artefacto en `projects/muzicmania/launcher/downloads/` y en
  `projects/muzicmania/website/public/downloads/`. La raíz de `downloads/` solo contiene
  `registry.json`, `latest.json` y carpetas `<version>/<canal>/<os>/`; no hay setups sueltos.
- Las builds 2.3.1, 2.3.2, 2.4.0, 2.4.1 y 2.4.2 viven en el esquema nuevo; la 2.3.1 se migró en `2.3.1/beta/windows{10,11}/`, conservando su
  nombre remoto para el fallback de GitHub Releases.
- `registry.json` conserva todas las builds (versión, juego, canal, OS, SHA256, tamaño,
  fecha y changelog); `latest.json` expone la build vigente y los ficheros por OS.
- La página `/download` consume el registro con búsqueda, filtro por canal y orden. La API
  `/api/download/windows` resuelve la última build del OS solicitado.
- El hub muestra un aviso si la versión instalada está al día, desactualizada o es **más
  nueva** que el setup. En el tercer caso desactiva reinstalar para impedir un downgrade.
- Los canales públicos son `beta` y `release`; `testing` se reserva para debug. `alpha` no se
  usa. El tag `releaseTag` enlaza la release de GitHub y los assets deben conservar el
  nombre del fichero.
- Los setups usan barra de ventana propia (isotipo, canal, idioma, minimizar/cerrar); el
  cierre conserva el modal de cancelación y nunca elimina datos locales por defecto.

_Última revisión: 18 nov 2026._ Relacionado: `DESKTOP_SHELL_SYSTEM.md`,
`LAUNCHER_SYSTEM.md`, `RELEASE_POLICY_SYSTEM.md`, `FRAMEWORKS_SYSTEM.md`,
`CDN_SYSTEM.md`, `PROJECTS_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.






