# RELEASE_POLICY_SYSTEM — Política de versiones y bloqueos

**Versión:** 1.0  
**Actualización:** 18 nov 2026  
**Identificador:** `RELEASE_POLICY_SYSTEM`  
**Definición:** Sistema firmado de política de versiones para el launcher, el hub del instalador y la web de MuzicMania.

---

## 1. Propósito

El sistema decide qué versiones de MuzicMania son compatibles, cuáles tienen una actualización
disponible y cuáles están bloqueadas de forma obligatoria por falta de soporte o por seguridad.
El usuario conserva la libertad de elegir una versión segura dentro del rango encontrado, pero
no puede abrir el hub ni jugar con una versión bloqueada.

El sistema se aplica al launcher, al hub del instalador y a la página de descargas. La política
se publica como un manifiesto firmado y se cachea localmente para que el bloqueo funcione también
sin conexión cuando ya se conoce.

## 2. Fuente de verdad

| Archivo | Responsabilidad |
| --- | --- |
| `projects/muzicmania/launcher/release-policy.json` | Política manual: mínimos, bloqueos, soporte. |
| `projects/muzicmania/website/src/data/downloads-registry.json` | Registro histórico generado por el build. |
| `projects/muzicmania/launcher/release-manifest.json` | Manifiesto final generado y firmado. |
| `projects/muzicmania/launcher/release-manifest.sig` | Firma Ed25519 del manifiesto. |
| `projects/muzicmania/launcher/release-policy.pub` | Clave pública embebida en launcher/setup. |
| `projects/muzicmania/website/public/releases-manifest.json` | Espejo web del manifiesto. |
| `projects/muzicmania/website/public/releases-manifest.sig` | Espejo web de la firma. |

La política manual **no** la edita el build. El build la valida, la fusiona con el registro y firma
el resultado. El manifiesto no se edita a mano.

## 3. Esquema de `release-policy.json`

```json
{
  "schemaVersion": 1,
  "policyVersion": 1,
  "issuedAt": "2026-11-18T00:00:00Z",
  "minimumSupported": {
    "launcher": "2.0.0",
    "beta": "2.0.0",
    "release": "2.0.0"
  },
  "blocks": [
    {
      "id": "security-2.3.2",
      "reason": "security",
      "from": "2.3.2",
      "to": "2.3.2",
      "fixedIn": "2.4.0",
      "message": "Actualización de seguridad obligatoria.",
      "detailsUrl": "https://muzicmania.vercel.app/changelog/..."
    }
  ],
  "support": {
    "downloadsUrl": "https://muzicmania.vercel.app/download",
    "supportUrl": "https://muzicmania.vercel.app/support",
    "changelogUrl": "https://muzicmania.vercel.app/changelog"
  }
}
```

- `minimumSupported` define el mínimo por canal; `launcher` es el mínimo global.
- `blocks` puede ser vacío. Cada bloqueo es obligatorio.
- `reason`: `support`, `security` o el reservado `integrity`.
- `fixedIn` es la primera versión segura conocida. Si está vacío, se usa el mínimo del canal.
- `policyVersion` siempre debe crecer; una política más antigua no reemplaza una caché más nueva.

## 4. Manifiesto generado

El manifiesto incluye:

- `policyVersion`, `issuedAt`, `generatedAt`, `minimumSupported`, `blocks`, `support`.
- `channels.beta` y `channels.release` con `latest` y `minimumSupported`.
- `releases[]` con versión de launcher, versión de juego, canal, OS, arquitectura, nombre de archivo,
  tamaño, SHA256, fecha, changelog, tag de release, URL de descarga y estado (`supported`,
  `blocked_support`, `blocked_security`).

El estado del registro se calcula en el build; no se confía en un estado escrito por el cliente.

## 5. Firma y confianza

1. Launcher y setup llevan embebida la clave pública Ed25519.
2. El manifiesto se sirve por HTTPS desde GitHub raw y desde el espejo web.
3. El cliente descarga manifiesto y `.sig`, y verifica la firma sobre los bytes exactos.
4. Si la firma falla, se ignora la respuesta de red y se usa caché o política embebida.
5. El SHA256 de cada setup se valida antes de aplicar una actualización.
6. La clave privada vive en el vault cifrado (`MUZIC_RELEASE_POLICY_PRIVATE_KEY`) y nunca se
   commitea. La clave pública sí es pública.

El sistema no pretende ser DRM: un usuario con control total del equipo puede modificar un binario.
La defensa real es cliente bloqueado, offline desactivado y rechazo online en servidor cuando
exista el ticket de lanzamiento.

La web expone `GET /api/client/access?version=...&channel=...&os=...&arch=...` para que el
backend o el juego validen una versión contra el manifiesto. Esta ruta devuelve `allowed`,
`mandatory`, `nearest`, `latestSafe`, motivo y URLs de soporte. El ticket de lanzamiento y el
rechazo dentro del juego siguen siendo una integración pendiente del backend online.

## 6. Fuentes de política en runtime

Orden de resolución:

1. Manifiesto de red verificado.
2. Caché local verificada (`%LOCALAPPDATA%\MuzicMania\policy-cache`).
3. `ReleasePolicy` embebida en el binario.

Si la red falla, la política embebida sigue permitiendo bloquear versiones conocidas en el momento
del build. Un binario antiguo que nunca se conectó no puede conocer bloqueos futuros; es una
limitación física del modo offline.

## 7. Cálculo de actualización

- `mandatory` si la versión actual es menor que el mínimo de su canal o cae en un bloqueo.
- Las opciones se filtran por OS, arquitectura, canal, mínimo y bloqueos.
- `nearest` es la primera versión segura compatible; `latestSafe` es la más nueva segura.
- `rangeTotal` cuenta las versiones compatibles del rango.
- Una actualización opcional permite: quedarse, ir a la más nueva, ir a la más cercana o elegir
  una versión del rango.
- Una actualización obligatoria elimina “quedarse”; solo permite elegir una versión segura,
  descargar manualmente, pedir soporte o cerrar.
- Si no existe un destino seguro, se muestra un error de política y no se permite jugar.

## 8. Canales beta y release

- `update_channel` se guarda en la configuración local; por defecto es el canal del build.
- `auto_switch_release` se guarda y se puede cambiar en Ajustes.
- Beta con release nueva: se avisa siempre y se pregunta. La elección se recuerda por versión
  (`release_prompted_version`).
- Si `auto_switch_release` está activo, se cambia a release y se usa su última versión.
- Beta en su última versión muestra “actualizado en beta” aunque exista una release más nueva.
- Si un bloqueo no tiene destino seguro en beta, se ofrecen versiones release seguras y se avisa
  del cambio de canal.

## 9. Bloqueo y anti-bypass

Cuando `mandatory=true`:

- No se abre el hub.
- Se desactivan online y offline en la UI.
- `launcher_offline_game` y `offline_start_game` devuelven `launcher_update_required`.
- `launcher_ready` no abre el juego.
- El único camino es actualizar, descargar el setup oficial, soporte, reintentar o cerrar.

La comprobación se ejecuta al arrancar aunque `auto_update` esté desactivado, porque la
obligatoriedad no es opcional.

## 10. Instalador y hub

- El hub consulta la misma política con la versión instalada.
- Si hay actualización, muestra opciones de versión y descarga.
- Si la versión está bloqueada, desactiva Reinstalar y muestra actualización obligatoria.
- Instalar manualmente una versión antigua sigue permitido; al abrir el launcher se aplicará el
  bloqueo si la política lo marca.
- Reinstalar nunca degrada por debajo de la versión instalada.
- Los setups incluyen la política embebida para funcionar sin red.

## 11. Errores y recuperación

| Situación | Respuesta |
| --- | --- |
| Red caída | Caché, luego política embebida; aviso de origen. |
| Firma inválida | Rechazar red; usar caché/embebida. |
| JSON inválido | Rechazar red; usar caché/embebida. |
| Versión de política antigua | Rechazar red; conservar caché. |
| OS/arquitectura incompatible | Error de plataforma con descarga oficial y soporte. |
| Sin versión segura | Error de política, sin habilitar juego. |
| Descarga corrupta | Borrar, reintentar y ofrecer descarga manual. |
| Sin conexión y bloqueo conocido | Bloqueo; solo descarga manual/soporte/cierre. |

Todas las pantallas de error deben ofrecer al menos una salida: reintentar, descargar, soporte o
cerrar.

## 12. Build y publicación

1. Editar `release-policy.json` y subir `policyVersion`.
2. Compilar con `build-installer.ps1` y `-PolicyKeyFile` (o
   `MUZIC_RELEASE_POLICY_PRIVATE_KEY_FILE`).
3. El script sincroniza Cargo/Tauri, archiva el setup, genera el manifiesto, lo firma y copia
   `release-manifest.json`, `.sig` y los datos web.
4. Publicar la release de GitHub con el nombre exacto del asset.
5. Commit/push del manifiesto público y del changelog.

Generación de claves:

```powershell
node scripts/release-policy-keygen.mjs projects/muzicmania/launcher
# mover release-policy.private al vault; conservar release-policy.pub
```

La build debe firmarse con la clave privada para que el manifiesto de red sea aceptado.

## 13. Detección no oficial (standby)

El esquema reserva `reason: integrity` y el campo de estado del release para futuras
verificaciones de builds no oficiales. No se activa todavía: una comprobación incompleta podría
bloquear instalaciones legítimas si el servidor no está disponible.

## 14. Pruebas

- Firma válida e inválida del manifiesto.
- Orden de versiones y rangos.
- Filtro por OS/arquitectura/canal.
- Bloqueo por mínimo y por rango.
- Caché y política embebida.
- Actualización opcional: quedarse, cercana, última, elegir.
- Actualización obligatoria: sin “quedarse”, offline/online cerrados.
- Beta/release y cambio automático.
- Instalador con versión bloqueada.
- Web: API de registro, estados y build.

## 15. Relación con otros documentos

- `LAUNCHER_SYSTEM.md`: UX y contrato del launcher.
- `INSTALLERS_SYSTEM.md`: build, hub y releases.
- `DESKTOP_SHELL_SYSTEM.md`: shell reutilizable.
- `SECURITY_PROTOCOLS.md`: firma, secretos y validación.
- `CHANGELOG_SYSTEM.md`: changelog de cada versión.

---

_Última revisión: 18 nov 2026._ Relacionado: `LAUNCHER_SYSTEM.md`, `INSTALLERS_SYSTEM.md`,
`DESKTOP_SHELL_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.
