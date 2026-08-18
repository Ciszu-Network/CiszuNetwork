# CIBERSECURITY_SYSTEM — Ciberseguridad del Ecosistema

Versión: 1.0.0
Actualización: 2026-08-18
Identificador: CIBERSECURITY_SYSTEM_V1.0.0_2026_08_18_ciszunetwork

> **Definición**: sistema de ciberseguridad oficial de Ciszu Network — las **herramientas**
> operativas de seguridad/OSINT, el **puente de secretos** (`SECRET_TEMP.env`), las
> **cuentas y APIs** vinculadas (SimpleLogin…), y las **reglas de uso**. Es complementario a
> `SECURITY_PROTOCOLS.md` (política de seguridad de desarrollo) y `VAULT_SYSTEM.md`
> (protección física/criptográfica de los secretos). Los protocolos de inteligencia
> operativa se detallan en `OSINT_PROTOCOLS.md`.

> **Alcance**: vale para las 4 webs, el bot de Discord, MuzicMania y cualquier tarea de
> investigación de seguridad que se haga desde esta máquina. Regla de oro: **verificar con
> fuentes externas** y **tratar todo dato personal ajeno como sensible**.

---

## 1. Términos y principios

| Término | Definición |
|---|---|
| **OSINT** | Open Source INTelligence: obtención de información a partir de fuentes públicas |
| **Username** | Identificador de usuario (perfil) en una o varias plataformas |
| **Alias** | Correo temporal/descartable (SimpleLogin) para proteger el correo real |
| **Puente de secretos** | `SECRET_TEMP.env`: ubicación temporal de tokens/keys/IDs no definitivos (gitignored) |
| **Vault** | `services/supabase/.env` + `.env.age`: almacén cifrado con age (lo escribe Ciszuko) |

Principios operativos:

1. **Solo fuentes públicas y lícitas.** Nunca intentar acceso no autorizado, credenciales
   robadas, ingeniería social ni servicios de pago sin saldo.
2. **Mínimo necesario.** Pedir el dato mínimo que resuelve la pregunta (un username, un
   correo o un alias), no datos masivos de terceros.
3. **No contaminar.** Los reportes con URLs/propiedades personales de terceros NO se
   committean: viven en `test/osint/` o `tools/cibersecurity/osint/output/` (gitignored).
4. **Verificación externa.** Si una tarea afirma un resultado, comprobarlo con la
   herramienta/librería real (curl a la API, salida del biniario, query a la BD).
5. **Rotación y puente.** Ningún valor va en `.md`; los temporales van a `SECRET_TEMP.env`
   y los definitivos al vault (`VAULT_SYSTEM.md`).

---

## 2. Mapa de herramientas oficiales

Inventario de herramientas de ciberseguridad/OSINT integradas al ecosistema. Las que tienen
wrapper están operativas desde PowerShell, opencode (comandos) o CI.

| Herramienta | Versión | Tipo | Estado | Wrapper oficial | Doc detallada |
|---|---|---|---|---|---|
| **Sherlock** | 0.16.0 | Username → presencia en ~400 redes | ✅ operativa | `tools/cibersecurity/osint/sherlock.ps1` | §3.1 |
| **Maigret** | 0.6.4 | Username → URLs + datos extraídos (recursión) | ✅ operativa | `tools/cibersecurity/osint/maigret.ps1` | §3.2 |
| **SimpleLogin** | API v2 | Alias de email temporales (privacidad) | ✅ vinculada | `tools/cibersecurity/osint/simplelogin.ps1` | §3.3 |
| **SpiderFoot** | v4 | Framework integral OSINT (correos, teléfonos, dominios, IPs) | ✅ instalada (clon `clones/spiderfoot`) | `tools/cibersecurity/osint/spiderfoot.ps1` | `OSINT_PROTOCOLS.md` §4.1 |
| **Maltego** | 4.12.1 | Minería de datos + visualización de vínculos (GUI) | ✅ instalada (Ciszuko, 18 ago 2026) — en configuración | `tools/cibersecurity/maltego/maltego.ps1` | `OSINT_PROTOCOLS.md` §4.4 |
| **Epieos** | web | Info de cuenta de Google por email | ✅ aplicada (manual, sin CLI) | — | `OSINT_PROTOCOLS.md` §4.7 |
| **Thatsthem** | web | Búsqueda inversa de correo | ✅ aplicada (manual, sin CLI) | — | `OSINT_PROTOCOLS.md` §4.7 |
| age | 1.2.1 | Cifrado de copias de secretos | ✅ | `scripts/vault.ps1` | `VAULT_SYSTEM.md` |
| Bitwarden | CLI 2026.6.0 | Vault maestro en la nube | ✅ | `bw` + vault `.env` | `VAULT_SYSTEM.md` §3.5 |

Binarios base:

- `C:\Users\fplay\AppData\Local\Programs\Python\Python314\Scripts\sherlock.exe`
- `C:\Users\fplay\AppData\Local\Programs\Python\Python314\Scripts\maigret.exe`
- Entorno: Python 3.14.6 (Scripts en PATH de usuario).

Herramientas candidatas (POST-OSINT, aún sin integrar): ver `OSINT_PROTOCOLS.md` §4.

---

## 3. Herramientas integradas en detalle

### 3.1 Sherlock — presencia social por username

**Qué hace**: comprueba el username contra ~400 redes sociales y devuelve las URLs donde
"existe" un perfil. Salida CSV/terminal; opciones de timeout, proxy/Tor y filtro por sitio.

**Wrapper oficial**: `tools/cibersecurity/osint/sherlock.ps1`

```powershell
# Full (por defecto): CSV + timeout 30
.\tools\cibersecurity\osint\sherlock.ps1 -Usernames foo,bar

# Rápido (pruebas): CSV + timeout 15, salida a test/osint/sherlock
.\tools\cibersecurity\osint\sherlock.ps1 -Usernames foo -Preset quick -Test

# Salida oficial en tools/cibersecurity/osint/output/sherlock/ (sin -Test)
```

**Sintaxis nativa útil**:

```bash
sherlock foo -o foo.txt        # un solo username, salida a archivo
sherlock foo,bar --csv --timeout 30 --folderoutput out/
sherlock "jo-{?}n"             # prueba variantes: jo-n, jo_n, jo.n
sherlock foo --site github.com # limitar a un sitio
```

**Atajos**: PowerShell `osint-sher foo,bar` · opencode `/sherlock foo,bar`.

### 3.2 Maigret — recopilación con recursión

**Qué hace**: igual que Sherlock pero más profundo: además de las URLs, **extrae datos** de
las páginas (nombres, lugares, otros usernames, tags de interés) y permite **recursión** a
otros datos extraídos. Soporta `--graph` (HTML), `--tags` por categoría, y varios formatos.

**Wrapper oficial**: `tools/cibersecurity/osint/maigret.ps1`

```powershell
# Full (por defecto): graph + tags social,tech + CSV + JSON(ndjson) + HTML
.\tools\cibersecurity\osint\maigret.ps1 -Usernames none_xisty_zzz_999

# Rápido (pruebas): solo CSV en test/osint/maigret
.\tools\cibersecurity\osint\maigret.ps1 -Usernames foo -Preset quick -Test
```

**Sintaxis nativa útil** (claves del ejemplo manual de Ciszuko):

```bash
maigret foo bar --graph --tags social,tech --csv --json ndjson --html --folderoutput out/
maigret foo --top-sites 100 --timeout 20       # limitar el nº de sitios
maigret foo --id-type steam_id 76561198078602401   # buscar por id de Steam
maigret foo --permute                          # variantes de usernames
```

**Atajos**: PowerShell `osint-mai foo` · opencode `/maigret foo`.

**Nota de salida**: los reportes por username se generan como `report_<username>.{csv,html,…}`
en la carpeta de salida del `--folderoutput`. Úsese `-Test` para `test/osint/maigret/`
(pruebas) y el default para `tools/cibersecurity/osint/output/maigret/` (uso oficial).

### 3.3 SimpleLogin — alias de email temporales

**Qué hace**: crea y gestiona **alias de correo** (p. ej. `prefijo.xyz@aleeas.com`) que
reenvían a la casilla real (`fplayersoffcial@proton.me`). Si un alias recibe spam, se
desactiva sin tocar el correo real. Ideal para registrar cuentas/boletines de terceros.

**Flujo de vinculación completado (18 ago 2026)**:

1. API key recuperada desde `TODO.md` y movida al puente `SECRET_TEMP.env`
   (`SIMPLELOGIN_API_KEY`).
2. Guardada en el vault `services/supabase/.env` con:
   - `SIMPLELOGIN_API_KEY` (usada por los wrappers)
   - `SIMPLELOGIN_EMAIL` (`fplayersoffcial@proton.me`)
   - `SIMPLELOGIN_RECOVERY_CODES` (8 códigos)
3. `vault.ps1 crypt` + `backup` + `verify` → OK (hash verificado).
4. Item **Bitwarden**: "SimpleLogin - fplayersoffcial (Ciszu Network)"
   (id `9c6fa289-…`, type login, username + api key en password + recovery codes en notes).

**Verificación externa de la API** (curl):

| Endpoint | Resultado |
|---|---|
| `GET /api/user_info` | `fplayersoffcial@proton.me`, premium false |
| `GET /api/v2/aliases?page_id=0` | 2 aliases activos |
| `GET /api/v5/alias/options` | 4 suffixes (aleeas, slmails, silomails, slmail) |

**API SimpleLogin (base `https://api.simplelogin.io`)**: auth por header
`Authentication: <api_key>`. Endpoints usados por el wrapper:

| Acción | Método/ruta | Notas |
|---|---|---|
| Validar key | `GET /api/user_info` | devuelve email, premium |
| Listar aliases | `GET /api/v2/aliases?page_id=N` | paginado de 20 |
| Opciones de alias | `GET /api/v5/alias/options` | `can_create`, suffixes con `signed_suffix` |
| Crear alias custom | `POST /api/v3/alias/custom/new` | body `{alias_prefix, signed_suffix}` |
| Crear alias aleatorio | `POST /api/alias/random/new` | `{}` |

**Wrapper oficial**: `tools/cibersecurity/osint/simplelogin.ps1` (lee la key del vault; nunca la imprime)

```powershell
.\tools\cibersecurity\osint\simplelogin.ps1 info
.\tools\cibersecurity\osint\simplelogin.ps1 aliases
.\tools\cibersecurity\osint\simplelogin.ps1 options
.\tools\cibersecurity\osint\simplelogin.ps1 create <prefijo>
.\tools\cibersecurity\osint\simplelogin.ps1 random
```

**Atajos**: PowerShell `osint-slo info|aliases|options|create <prefijo>|random` ·
opencode `/simplelogin <acción>`.

**Seguridad SimpleLogin**:

- La API key da control total de aliases: NO exponerla en conductorias, logs ni navegador.
- Los **recovery codes** permiten recuperar la cuenta 2FA: vivir solo en vault + Bitwarden.
- Regla de uso: para cada alta de terceros, alias nuevo; si se filtra/trafica, se desactiva.

---

## 4. Comandos de IA y de la persona

Capa de acceso a las herramientas desde opencode (IA) y PowerShell (persona).

### 4.1 opencode (comandos `/`)

| Comando | Acción |
|---|---|
| `/osint <herramienta> <args>` | Dispatcher genérico (maigret, sherlock, simplelogin, spiderfoot) |
| `/maigret <usernames>` | Maigret con preset full |
| `/sherlock <usernames>` | Sherlock con preset full |
| `/simplelogin <acción>` | SimpleLogin por API |
| `/spiderfoot <targets>` | SpiderFoot con preset full (`-u passive`) |

Reglas de los comandos: si el usuario no indica lo contrario, la salida oficial va a
`tools/cibersecurity/osint/output/<herramienta>/`; nunca imprimir API keys/recovery codes; al final
resumir usernames consultados, nº de hallazgos y carpeta de salida.

### 4.2 PowerShell (perfil de usuario)

Funciones definidas en `Microsoft.PowerShell_profile.ps1`:

| Función | Equivale a |
|---|---|
| `osint` | `tools/cibersecurity/osint/osint.ps1` (dispatcher) |
| `osint-mai` | `tools/cibersecurity/osint/maigret.ps1` |
| `osint-sher` | `tools/cibersecurity/osint/sherlock.ps1` |
| `osint-slo` | `tools/cibersecurity/osint/simplelogin.ps1` |
| `osint-sfx` | `tools/cibersecurity/osint/spiderfoot.ps1` |
| `maltego` | `tools/cibersecurity/maltego/maltego.ps1` (GUI; `-Config`/`-Log`) |

### 4.3 Reglas de ejecución (obligatorias)

1. **Diagnóstico antes de pedir datos**: si el target no se indica, usar un username
   sintético (`none_xisty_zzz_999`) para validar el pipeline.
2. **Datos personales fuera de git**: `test/osint/` y `tools/cibersecurity/osint/output/` están
   gitignored; si se obtienen datos reales, guardarlos ahí, jamás en `docs/` ni commits.
3. **Sin credenciales en resúmenes**: al reportar, decir "API validada" sin pegar la key.
4. **Verificación externa**: tras modificar wrappers o config, ejecutar la herramienta y
   mostrar la salida real (no el "supuesto" resultado).
5. **Timeout sensato**: default 30 s (sherlock) / 30 s por request (maigret); en redes
   lentas subir con `--timeout`.

---

## 5. Puente de secretos (`SECRET_TEMP.env`) y flujo de credenciales

### 5.1 El puente `SECRET_TEMP.env`

- **Ruta**: `projects/ciszu/docs/documentation/SECRET_TEMP.env` (gitignored).
- **Naturaleza**: transitorio y **nunca cifrado** (se abre constantemente) y **nunca se
  sube a ningún sitio**. Solo existe local en `E:\Ciszu Network`.
- **Función**: recibir los secretos que Ciszuko pasa (API keys, tokens, IDs, secrets) SIN
  escribirlos en texto plano en el chat ni en `.md`. Formato `.env` (`VAR="valor"`).

### 5.2 Flujo completo (protocolo)

1. **Entrada**: Ciszuko escribe el secreto como variable en `SECRET_TEMP.env` y lo
   referencida en docs/TODO como `ver SECRET_TEMP.env → <VAR>` (nunca lo pasa en el chat).
2. **Lectura**: el agente abre el puente y lee el valor de la variable (sin imprimirlo).
   Si la variable no existe, la pide.
3. **Persistencia oficial**: el agente **añade la variable al vault**
   (`services/supabase/.env`, al final, sin tocar lo existente) y ejecuta
   `vault.ps1 crypt` + `backup` + `verify`. El vault cifrado (`services/supabase/.env.age`)
   es la **copia oficial** que alimenta Bitwarden.
4. **Bitwarden**: el mismo valor se guarda en el item correspondiente de Bitwarden
   (`pw`/`fields`/`notes`), según `VAULT_SYSTEM.md` §3.5.
5. **Uso**: el agente usa el valor al vuelo para la tarea (curT, wrappers, llamadas a API).
6. **Cierre**: cuando la tarea está terminada, **Ciszuko** elimina la variable de
   `SECRET_TEMP.env`; el valor permanece cifrado en vault + Bitwarden.

### 5.3 Mapa de secretos actual (18 ago 2026)

| Variable | Dónde vive (persistencia) | Bitwarden |
|---|---|---|
| `SIMPLELOGIN_API_KEY` | vault `.env` (cifrado) | item "SimpleLogin - fplayersoffcial…" |
| `SIMPLELOGIN_RECOVERY_CODES` | vault `.env` (cifrado) | ídem (notes) |
| `SIMPLELOGIN_EMAIL` | vault `.env` | ídem |
| `PLASMIC_TOKEN/CMS_ID/PUBLIC/SECRET` | vault `.env` (cifrado) | item "Editor visual…" |
| `PUCK_KEY` / `PUCK_ORG_KEY` | vault `.env` (cifrado) | ídem |
| `SUBFRAME_KEY` | vault `.env` (cifrado) | ídem |

### 5.4 Reglas críticas

> **Regla crítica**: `services/supabase/.env` **solo lo edita Ciszuko Antony**. El agente
> nunca borra/modifica/reordena entradas existentes; solo lee para usar variables o correr
> `vault.ps1 crypt|verify|backup`, o añade variables nuevas al final cuando Ciszuko las
> entrega por el puente. P.ej. el wrapper de SimpleLogin lee `SIMPLELOGIN_API_KEY`
> de ahí sin tocarlo.
>
> **Regla de oro**: `SECRET_TEMP.env` y `services/supabase/.env` **nunca** se suben ni se
> importan; cualquier valor que llegue de ahí se usa al vuelo y solo se persiste en el vault
> cifrado (+ Bitwarden).

---

## 6. Relación con la política de desarrollo

| Doc | Complementa |
|---|---|
| `SECURITY_PROTOCOLS.md` | Reglas de seguridad de TODO el código (RLS, rate limits, XSS, secretos) |
| `VAULT_SYSTEM.md` | Protección física/criptográfica de las credenciales |
| `OSINT_PROTOCOLS.md` | Protocolos específicos de inteligencia de código abierto (basado en este sistema) |
| `TODO.md` | Tareas pendientes (solo Ciszuko edita; los secretos se refieren vía SECRET_TEMP) |

Recordatorio de `SECURITY_PROTOCOLS` para esta área:

1. Secretos NUNCA en fallbacks de código ni hardcodes; solo `process.env.X` (server-only).
2. `NEXT_PUBLIC_` solo para valores públicos por diseño.
3. Verificación externa en todo cambio de policies/funciones/endpoints.
4. Rotar cualquier secreto expuesto (`scripts/tokens_a_rotar.md`).

---

## 7. Checklist de verificación de CIBERSECURITY_SYSTEM

Tras tocar las herramientas, ejecutar:

1. `osint-sher none_xxx_zzz999 -Preset quick -Test` → outputs CSV en `test/osint/sherlock/`.
2. `osint-mai none_xxx_zzz999 -Preset quick -Test` → CSV en `test/osint/maigret/`.
3. `osint-slo info` → devuelve la cuenta (email), sin imprimir la key.
4. `vault verify` → hash OK de `.env` vs `.env.age`.
5. `git status` → `test/osint/` y `tools/cibersecurity/osint/output/` NO aparecen (gitignored).
6. `git check-ignore SECRET_TEMP.env` → ruta ignorada.
7. `bw get item 9c6fa289-ccd2-46e3-b5e2-b4aa004d37f9` (con sesión desbloqueada) →
   item SimpleLogin presente.

---

## 8. Estado

| Elemento | Estado (18 ago 2026) |
|---|---|
| Sherlcok + Maigret wrappers | ✅ operativos (presets full/quick, -Test) |
| SimpleLogin API vinculada | ✅ key válida, 2 aliases, creados/verificados |
| SimpleLogin en vault cifrado | ✅ crypt+backup+verify OK |
| SimpleLogin en Bitwarden | ✅ item creado (login + notes recovery) |
| Puente SECRET_TEMP.env | ✅ creado y gitignored; secretos fuera de MDs |
| Regla de vault solo-Ciszuko | ✅ AGENTS.md §6.6 |
| Command opencode / PowerShell | ✅ `/osint`, `/maigret`, `/sherlock`, `/simplelogin`, `/spiderfoot` + funciones |
| POST-OSINT (PhoneInfoga, HIBP…) | ✅ investigación hecha; SpiderFoot integrado como framework oficial (§4.1). APIs/herramientas de pago **descartadas hasta tener capital** (decision Ciszuko, `OSINT_PROTOCOLS.md` §4.0) |

---

## 9. Historial

| Fecha | Cambio |
|---|---|
| 18 ago 2026 | Doc creada (v1.0.0). Sherlock+Maigret+SimpleLogin integrados; puente SECRET_TEMP creado; vault y Bitwarden actualizados |
| 18 ago 2026 | POST-OSINT investigado; SpiderFoot elegido como framework integral e **instalado** (clon `clones/spiderfoot`, lxml 6.1.1 para Python 3.14); wrapper `spiderfoot.ps1` + `/spiderfoot` + `osint-sfx` (quick = gravatar/keybase/social, full = passive); PhoneInfoga/SEON/HIBP/Hunter/etc. evaluados en `OSINT_PROTOCOLS.md` §4 |

---

_Última revisión: 2026-08-18._ Relacionado: `SECURITY_PROTOCOLS.md`, `OSINT_PROTOCOLS.md`,
`VAULT_SYSTEM.md`, `TODO.md`.