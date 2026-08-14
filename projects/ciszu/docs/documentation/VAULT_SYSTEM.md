# VAULT_SYSTEM — Protección del vault de credenciales — plan y estado (10 ago 2026)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: VAULT_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: protección de los archivos locales de credenciales (`.env`/vault) de Ciszu
> Network contra robo físico, acceso no autorizado, filtraciones y pérdida. Plan maestro con
> estado por capa.

> **Objetivo**: proteger los archivos locales de credenciales (`.env` / vault) de Ciszu Network
> contra robo físico del disco, acceso no autorizado del sistema, filtraciones accidentales y
> pérdida de credenciales. Este doc es el plan maestro; el estado de cada capa se actualiza
> aquí mismo tras cada implementación.

---

## 1. Modelo de amenazas (¿de qué nos protegemos?)

| Amenaza | Impacto | Capa que la mitiga |
|---|---|---|
| Robo físico del PC/HDD (E: es HDD SATA 1TB) | Todos los secrets legibles | **BitLocker en E:** (usuario) |
| Malware/proceso que corre con el usuario del PC | Lee los `.env` | ACLs NTFS + minimizar superficie |
| Otros usuarios de Windows | Idem | ACLs NTFS (solo fplay + SYSTEM) |
| Subida accidental a git/nube de una copia | Fuga | `.gitignore` + historial limpio + gitleaks + copias cifradas con age |
| Pérdida del disco / corrupción del `.env` | Pérdida de los 26 secrets | Copia maestra **cifrada** (age) + vault en la nube (usuario) |
| Exposición si el repo se hace público | Secrets en historial | Rotación (`scripts/tokens_a_rotar.md`) |

**Estado honesto**: hoy (10 ago 2026) el archivo `.env` en claro sigue existiendo en disco
porque los scripts del flujo diario lo leen. La protección REAL en reposo la da BitLocker
(capa del usuario). age protege las **copias y backups** (lo que se puede filtrar/llevar),
y el vault de la nube asegura la **recuperación**.

---

## 2. Inventario de archivos de credenciales (verificado 10 ago 2026)

| Archivo | Qué contiene | Protección actual |
|---|---|---|
| `services/supabase/.env` | **Vault principal** (26 vars: Supabase, Discord, Vercel, PostHog, IA…) | gitignored + ACL fplay/SYSTEM + copia `.env.age` cifrada |
| `services/supabase/.env.age` | Copia maestra cifrada (age) del vault | ACL fplay/SYSTEM; solo descifrable con identity |
| `.env.local` (raíz) | `VERCEL_TOKEN` | gitignored + ACL + incluido en bundle cifrado |
| `projects/*/website/.env.local` (×4) | `NEXT_PUBLIC_*`, Turnstile, PostHog | gitignored + incluidos en bundle cifrado |
| `projects/ciszubot/discord-bot/.env` | Token bot Discord, TOP_GG, DBL | gitignored + incluido en bundle cifrado |
| `archives/backups/envs/vault-*.env.age` | **Bundle cifrado** de TODOS los `.env` (zip + age) | ACL fplay/SYSTEM |
| `C:\Users\fplay\.ciszu\ciszu-vault-key.txt` | **Identity age** (clave privada) | ACL fplay/SYSTEM + copia en Bitwarden (usuario) |
| `C:\Users\fplay\Tools\age\` | Binario age v1.2.1 | — |
| Bitwarden (nube) | Copia maestra de secrets + identity age (org Ciszu + vault personal) | Org "Ciszu Network" + cuenta Francisco Garcia (Free) |

### Eliminados en la limpieza (10 ago 2026)

- `services/supabase/.env.local` (copia vieja duplicada, 29 jul) — su referencia en
  `scripts/update-env-keys.js` también se quitó.
- `archives/backups/envs/2025-08-21/` (9 backups en **texto plano**, incluidos los
  `.vercel.env.production.local`) — sustituidos por el bundle cifrado.
- `.env` raíz (placeholder vacío `OPENAI_API_KEY=`).

---

## 3. Capas de protección

### 3.1 IMPLEMENTADA — age (cifrado de archivo) ✅

**age v1.2.1** (`C:\Users\fplay\Tools\age\`, añadido al PATH de usuario) cifra los archivos
de credenciales con X25519. El flujo diario no cambia: los scripts siguen leyendo el `.env`
en claro; lo cifrado son las **copias maestras y backups**.

- **Identity**: `C:\Users\fplay\.ciszu\ciszu-vault-key.txt`
  - Public key: `age1jut59wen44w4r7e92c9faxqxk7wdlkpyhdutf9p8980xvg359utqj4xl32`
  - ⚠️ **El usuario debe guardar una copia en Bitwarden/Proton Pass** (si se pierde la
    identity, las copias `.age` son irrecuperables).
- **Copia maestra**: `services/supabase/.env.age` (descifrable con identity).
- **Bundle periódico**: `archives/backups/envs/vault-<fecha>.env.age` (zip cifrado con
  todos los `.env` del repo).
- **`scripts/vault.ps1`** — gestión: `crypt | decrypt | verify | backup | keygen | lock-acl`.
  - `verify` comprueba integridad (roundtrip + hash SHA256).
  - `backup` regenera el bundle cifrado de todos los `.env`.
- **`scripts/update-env-keys.js`** — desde el 10 ago cifra automáticamente los backups que
  genera antes de cada rotación (archivo por archivo, con age).

### 3.2 IMPLEMENTADA — ACLs NTFS restrictivas ✅

`icacls /inheritance:r /grant:r fplay:(F) SYSTEM:(F)` aplicado a:

- `C:\Users\fplay\.ciszu\ciszu-vault-key.txt`
- `services/supabase/.env` y `.env.age`
- `.env.local` (raíz)
- `archives/backups/envs/vault-*.env.age`

Re-aplicar tras cambios con: `.\scripts\vault.ps1 lock-acl`.
✅ `projects/ciszubot/discord-bot/.env` — ACL aplicada 10 ago 2026 (takeown + icacls
elevado, UAC aceptado): propiedad fplay, permisos solo fplay + SYSTEM. Docker lo sigue
leyendo (corre con privilegios de SYSTEM/fplay).

### 3.3 IMPLEMENTADA — Limpieza de superficie ✅

Ver §2 "Eliminados". Menos copias en claro = menos superficie de ataque.

### 3.4 IMPLEMENTADA — BitLocker (cifrado de disco) ✅

**Habilitado y verificado 11 ago 2026**. E: (HDD, donde vive el repo y el `.env` en claro)
está cifrado al **100% (FullyEncrypted) con Protection Status: ON** y protectores
**Password** (fplay) + **RecoveryPassword**. La recovery key está guardada en:
Bitwarden (vault personal, item "BitLocker - E: (PC Ciszuko)") y en el vault local
(`BITLOCKER_PASSWORD` / `BITLOCKER_RECOVERY_KEY` en `services/supabase/.env`, cifrado con age).

Cifrado (11 ago, PowerShell admin): `Enable-BitLocker -MountPoint E: -EncryptionMethod XtsAes128 -UsedSpaceOnly`.

> ⚠️ **Restante (opcional, futuro)**: C: (SSD del sistema, 222 GB) y D: (931 GB) siguen
> `FullyDecrypted`. En C: vive la identity de age (`C:\Users\fplay\.ciszu\...`) — si se
> quiere protección completa del sistema, habilitar BitLocker también en C: (requiere
> reinicio y nueva recovery key). No es urgente: los secrets principales están en E:,
> ya cifrado, y las copias están cifradas con age.

### 3.5 IMPLEMENTADA — Vault maestro en la nube (Bitwarden) ✅

**Cuenta**: `fplayersoffcial@gmail.com` (Francisco Garcia, plan Free, creada 10 ago 2026).
Copia de recuperación de los secrets + la identity age. Garantiza que la pérdida del PC no
destruya el acceso a Supabase/Vercel/Discord/PostHog. Estructura (10 ago 2026):

- **Org "Ciszu Network"** (id `daea0e3b-…`) — SOLO lo de la empresa:
  - Colección **"Ciszu Network"** (id `9ec56b0a-…`, owner con manage) — 7 items:
    Supabase, Vercel, PostHog, IA, Infra, Bitwarden machine account y age identity.
    Cada item: Custom Fields `nombre=valor` por variable, carpeta "Ciszu Network".
- **Vault personal (Francisco Garcia, fuera de la org)** — sus carpetas:
  - Carpeta **"Francisco Garcia"** — auth keys y recovery: Cloudflare API key,
    Discord 2FA backup codes, Recovery codes, cert `prod-ca-2021.crt`, item PDF recovery
    de Bitwarden (nota con ruta local; adjuntos requieren Premium).
  - Carpeta **"Ciszu Network"** (vault personal) — vista del usuario de los items de org.
- **Machine account** (client_id `user.09b89e6b-…`) — token API `api` para automatizar
  (`BW_CLIENT_ID`/`BW_CLIENT_SECRET` añadidos al vault local `.env`, item en la org).
  ⚠️ El secret fue pegado en el chat de opencode (10 ago) — rotar desde
  web vault → Settings → API → Rotate cuando se considere oportuno.

Flujo de carga (lección): `bw login --apikey` + `bw unlock` + `bw import bitwardenjson
<file>` (el CLI v2026.6.0 pide el formato POSICIONAL, no `--format`). Mover items a la org
se hace borrando y recreando con `organizationId`+`collectionIds` en el payload (el edit
de items importados falla con "decryption operation failed"). Scripts one-shot en
`.opencode/temp/bw-setup.mjs` / `bw-import.json` (gitignored, borrados al cierre).

### 3.6 EN PENDIENTE — Secret manager de pago (Infisical / 1Password) ⏳

**No descartado**: evaluar cuando haya método de pago disponible. Infisical (self-host
gratis, cloud de pago) o 1Password (pago) añaden: UI central, sharing por equipos, auditoría,
inyección de secrets en scripts sin `.env` en claro. Criterio de activación: cuando el
equipo crezca (>1 persona) o se manejen credenciales de terceros/clientes. Mientras tanto
las capas 3.1–3.5 cubren el caso de 1 persona.

---

## 4. Procedimientos

### Recuperación del vault desde `.env.age`

```powershell
powershell -File scripts\vault.ps1 decrypt    # .env.age -> services/supabase/.env
powershell -File scripts\vault.ps1 verify     # comprobar integridad
```

### Nuevo backup cifrado (recomendado: semanal y antes de tocar el vault)

```powershell
powershell -File scripts\vault.ps1 backup
```

### Rotación de claves Supabase

1. Rotar en Dashboard → Settings → API.
2. `node scripts/update-env-keys.js <anon> <service-role>` — el script CIFRA los backups
   automáticamente antes de actualizar.
3. `powershell -File scripts\vault.ps1 backup` para el bundle.
4. Deploy de las webs (los `.env.local` se actualizan en el paso 2).

### Pérdida de la identity age

1. Recuperar la copia de Bitwarden/Proton Pass (usuario) → restaurar
   `C:\Users\fplay\.ciszu\ciszu-vault-key.txt` con ACL.
2. Si se pierde por completo: `vault.ps1 keygen` genera una NUEVA identity → re-cifrar
   todos los `.env.age` (`crypt` + `backup`) — los `.age` viejos quedan inútiles.

---

## 5. Checklist de verificación (periódica, recomendada: mensual)

1. `git status` limpio de `.env*` (solo plantillas `.example` trackeadas).
2. `git log --all --name-only | grep '\.env$'` → nada.
3. `powershell -File scripts\vault.ps1 verify` → `VERIFY OK`.
4. `Get-ChildItem archives\backups\envs` → solo `.env.age` (nunca texto plano).
5. `git check-ignore services/supabase/.env` → devuelve la regla del `.gitignore`.
6. BitLocker activo: `Get-BitLockerVolume` (como admin) → Protection ON en C: y E:.
7. Vault de la nube actualizado (coincide con `services/supabase/.env`).
8. `Get-ChildItem C:\Users\fplay\.ciszu` → identity presente (ACL fplay+SYSTEM).
9. `scripts/tokens_a_rotar.md` — sin ítems abiertos.

---

## 6. Historial

| Fecha | Cambio |
|---|---|
| 10 ago 2026 | Diagnóstico (26 secrets, texto plano, backups sin cifrar, sin BitLocker verificado) |
| 10 ago 2026 | age v1.2.1 instalado + identity + `.env.age` + bundle cifrado + ACLs + limpieza + `vault.ps1` + `update-env-keys.js` cifra backups |
| 10 ago 2026 | Doc creada; pendientes del usuario: BitLocker (3.4), vault nube (3.5), pago futuro (3.6) |
| 10 ago 2026 | **Vault Bitwarden implementado (3.5 ✅)**: cuenta creada, org Ciszu Network + colección, 7 items de empresa (Supabase/Vercel/PostHog/IA/Infra/machine account/age identity), auth keys y recovery codes personales en el vault personal (fuera de la org), `BW_CLIENT_ID`/`BW_CLIENT_SECRET` en vault local. Pendiente del usuario: activar BitLocker en C:/E: (3.4) |
| 11 ago 2026 | **BitLocker E: completado (3.4 ✅)**: cifrado 100% verificado (Protection ON, Password + RecoveryPassword), recovery key en Bitwarden y vault local. C: y D: siguen sin cifrar (opcional futuro) |
