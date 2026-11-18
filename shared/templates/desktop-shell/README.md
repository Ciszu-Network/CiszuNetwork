# Desktop Shell Template — Ciszu Network

Plantilla oficial para crear la capa de escritorio de un producto de Ciszu Network sin
empezar desde cero. Incluye el instalador, el hub de mantenimiento, el desinstalador y el
launcher.

La implementación canónica es MuzicMania:

- `projects/muzicmania/launcher/src-tauri/splash/`
- `projects/muzicmania/launcher/src-tauri/src/main.rs`
- `projects/muzicmania/website/scripts/patch-nsis-lang.ps1`
- `projects/muzicmania/launcher/build-installer.ps1`

La plantilla no duplica esos archivos para evitar que se desincronicen. El generador copia
la versión vigente, aplica la configuración del producto y deja una guía de adaptación.

## Requisitos

- Node.js >= 24.
- Ejecutar desde la raíz del monorepo.
- Producto destino con su carpeta de proyecto ya definida.
- Revisar `DESKTOP_SHELL_SYSTEM.md` y `INSTALLERS_SYSTEM.md` antes de generar.

## Uso

```powershell
pnpm shell:new --target projects/ciszubot/installer --config shared/templates/desktop-shell/config.example.json --kind installer
```

Para un launcher:

```powershell
pnpm shell:new --target projects/ciszubot/launcher-shell --config .\ciszubot.shell.json --kind launcher
```

Para ambas capas:

```powershell
pnpm shell:new --target projects/ciszubot/desktop-shell --config .\ciszubot.shell.json --kind all
```

El generador:

1. Valida la configuración.
2. Copia los archivos de la implementación canónica correspondientes al `kind`.
3. Sustituye nombre, slug, app id, URLs, repositorio y redes sociales.
4. Escribe `SHELL_CONFIG.json` y `SHELL_NEXT_STEPS.md` en el destino.
5. No toca archivos fuera del destino.

Nunca sobrescribe un destino existente salvo que se indique `--force`.

## Configuración

Copiar `config.example.json`, cambiar los valores y usarlo como `--config`.

| Campo | Obligatorio | Uso |
|---|---|---|
| `product.name` | Sí | Nombre visible del producto y del ejecutable |
| `product.slug` | Sí | Identificador técnico en minúsculas |
| `product.appId` | Sí | Identificador Tauri / bundle |
| `product.version` | Sí | Versión inicial |
| `brand.owner` | No | Empresa propietaria; por defecto Ciszu Network |
| `brand.websiteUrl` | No | Web corporativa |
| `urls.productUrl` | Sí | Web oficial del producto |
| `urls.supportUrl` | No | Página de soporte |
| `urls.githubRepo` | No | Repositorio de releases |
| `urls.whatsapp` | No | Enlace de soporte WhatsApp |
| `socials.*` | No | Redes sociales del producto |
| `shell.kind` | No | `installer`, `launcher` o `all`; `--kind` manda |
| `shell.languages` | No | Códigos de idioma que se activarán en la adaptación |
| `shell.source` | No | Ruta alternativa a la implementación canónica |

## Qué cambia el generador

- `MuzicMania` → `product.name`
- `muzicmania` → `product.slug`
- `com.ciszunetwork.muzicmania` → `product.appId`
- URL de MuzicMania → `urls.productUrl`
- Repositorio de releases → `urls.githubRepo`
- Enlaces sociales → `socials.*`
- Enlaces de soporte / WhatsApp → `urls.*`

## Qué NO cambia

- Logo e iconos: reemplazar `logo.svg`, `icons/` y los assets de marca.
- Audio offline, pistas, fondos y contenido del producto.
- Comandos Rust de Tauri: adaptar `main.rs` y el contrato de la sección 10 de
  `DESKTOP_SHELL_SYSTEM.md`.
- NSIS: adaptar `patch-nsis-lang.ps1` y el nombre del binario.
- Traducciones específicas del producto: ampliar los diccionarios del shell.
- Textos legales, licencia y condiciones del producto.
- Acciones de negocio: login, compra, descarga, soporte y actualización.

## Adaptador web

Para un instalador que sea una página web normal (por ejemplo, CiszuBot), copiar
`adapters/web-adapter.js` antes de los scripts del shell y registrar las acciones HTTP:

```html
<script src="adapters/web-adapter.js"></script>
<script src="installer.js"></script>
```

El adaptador expone `window.CISZU_SHELL_ADAPTER.invoke(command, args)`. Cada comando del
contrato (`installer_info`, `installer_start_install`, `installer_read_progress`, etc.) debe
tener su equivalente HTTP. No simular una instalación real si el producto no puede
instalarse.

## Checklist posterior

- [ ] Reemplazar logo, isotipo, iconos y assets.
- [ ] Aplicar tokens de color y tipografía del producto.
- [ ] Revisar todos los textos legales y de soporte.
- [ ] Configurar los 18 idiomas oficiales o el subconjunto aprobado.
- [ ] Adaptar los comandos Rust, IPC y NSIS.
- [ ] Configurar GitHub Releases y el actualizador.
- [ ] Firmar binario y setup con Authenticode + timestamp (ver `INSTALLERS_SYSTEM.md` §5).
- [ ] Probar instalación limpia, hub, update, reinstall y uninstall.
- [ ] Probar launcher, login, offline, bandeja, cierre y autostart.
- [ ] Verificar que no quedan referencias a MuzicMania.
- [ ] Ejecutar la checklist de `DESKTOP_SHELL_SYSTEM.md`.

## Reglas de plantilla

1. No copiar secretos, tokens ni `.env` al destino.
2. No generar binarios, música ni archivos de usuario.
3. La configuración de marca es del producto, no de la plantilla.
4. La lógica genérica vive en el shell; las acciones de producto viven en adaptadores.
5. Si se cambia el shell canónico, actualizar documentación y probar la generación.

## Referencias

- `DESKTOP_SHELL_SYSTEM.md`
- `INSTALLERS_SYSTEM.md`
- `LAUNCHER_SYSTEM.md`
- `projects/muzicmania/launcher/src-tauri/splash/`
- `shared/scripts/scaffold-desktop-shell.mjs`

