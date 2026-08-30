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
| 30 ago 2026 | Se añaden secciones operativas: **ANTIVIRUS MALWARE AUDITOR**, **SOC MONITORING**, **PENTESTER UPTIME & TOOLS**; se expande **OSINT** con flujos operativos |

---

## 10. OPEN SOURCE INTELLIGENCE (OSINT) — Flujo operativo expandido

> **Definición**: metodología unificada de inteligencia de fuentes abiertas para el ecosistema Ciszu Network. Integra las herramientas base (Sherlock, Maigret, SpiderFoot, SimpleLogin) en flujos de trabajo repetibles para investigación de amenazas, reconocimiento de superficie de ataque y validación de identidad digital.

### 10.1 Metodología OSINT Ciclo de Inteligencia

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PLANNING    │───▶│  COLLECTION  │───▶│  PROCESSING  │───▶│  ANALYSIS    │───▶│  DISSEMINATION│
│  (Objetivos, │    │  (Sherlock,  │    │  (Normalizar,│    │  (Correlación,│    │  (Reportes,  │
│   Alcance)   │    │   Maigret,   │    │   Enriquecer,│    │   Scoring,    │    │   Alertas,   │
│              │    │   SpiderFoot)│    │   Deduplicar)│    │   Atribución) │    │   Dashboards) │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 10.2 Playbooks OSINT por caso de uso

| Caso de uso | Herramientas | Playbook | Output |
|---|---|---|---|
| **Recon superficie ataque** | SpiderFoot (passive), Maigret, Sherlock | `osint-sfx target --preset full` → `osint-mai user --graph` | Mapa superficie: subdominios, emails, IPs, tecnologías, brechas |
| **Validación identidad** | Sherlock, Maigret, SimpleLogin, Epieos | `osint-sher user` + `osint-mai user --permute` + `osint-slo info` | Perfil unificado: presencia redes, aliases email, verificación Google |
| **Threat hunting alias** | SimpleLogin API, SpiderFoot (email module) | `osint-slo aliases` → `osint-sfx email@domain --module email` | Mapping aliases → exposición real, brechas asociadas |
| **Investigación supply chain** | SpiderFoot (passive DNS, SSL, whois), Maigret (github/gitlab) | `osint-sfx domain --preset full` + `osint-mai org --graph` | Mapa dependencias: paquetes, repos, contributors, secrets leaked |
| **Brand monitoring** | SpiderFoot (monitor), Sherlock (brand terms) | `osint-sfx "Ciszu Network" --monitor` + `osint-sher "CiszuNetwork"` | Alertas: typosquatting, impersonación, leaks, menciones negativas |

### 10.3 Enriquecimiento y correlación automática

- **SpiderFoot** como motor central: módulos `passive_dns`, `ssl_cert`, `whois`, `email`, `social_media`, `breach`, `github`, `gitlab`, `pastebin`, `shodan`, `virustotal` (si API key)
- **Maigret** para recursión social: extrae usernames → busca en otras plataformas → extrae nuevos datos → recursión
- **Correlación simplelogin**: cada alias → `osint-sfx alias@domain` → mapea exposición real por alias
- **Scoring de riesgo**: 0-100 basado en: exposición PII (0-30), brechas conocidas (0-25), superficie técnica expuesta (0-25), reputación IP/dominio (0-20)

---

## 11. ANTIVIRUS MALWARE AUDITOR (Auditor Antivirus/Malware)

> **Definición**: capacidades de análisis estático/dinámico de malware, auditoría de binarios y archivos sospechosos, y validación de integridad de assets del ecosistema.

### 11.1 Herramientas integradas

| Herramienta | Tipo | Uso | Integración |
|---|---|---|---|
| **ClamAV** | AV engine (open source) | Escaneo ficheros, adjuntos, uploads | `clamscan` CLI + `clamd` daemon |
| **YARA** | Pattern matching | Reglas custom para detectar malware/IOCs | `yara` CLI + reglas `.yar` en `tools/cibersecurity/yara/rules/` |
| **VirusTotal API** | Multi-engine (70+ AV) | Verificación hash/archivo/URL | `vt` CLI + API key (vault) |
| **Hybrid Analysis** | Sandbox dinámico | Análisis comportamiento (solo hashes/URLs) | API key (vault) |
| **MalwareBazaar / Malpedia** | Inteligencia amenazas | IOCs, familias, YARA rules | Feed automático + search manual |
| **PEframe / pefile** | Análisis estático PE | Headers, sections, imports, strings, packers | Python script `tools/cibersecurity/malware/peframe.py` |

### 11.2 Flujo de auditoría de malware

```
Archivo sospechoso
       │
       ▼
┌─────────────────┐
│ Hash (SHA256)   │──▶ VirusTotal / MalwareBazaar lookup (cache 24h)
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ YARA scan       │──▶ Reglas custom + Malpedia rulesets
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ ClamAV scan     │──▶ Detección firmas conocidas
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ PEframe /       │──▶ Análisis estático: imports, sections, entropy, strings,
│ static analysis │     packers, compilers, anti-debug, anti-VM
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Reporte unificado│──▶ JSON + Markdown → `tools/cibersecurity/malware/output/`
└─────────────────┘
```

### 11.3 Reglas YARA custom (ejemplos)

```yara
// tools/cibersecurity/yara/rules/ciszu_suspicious.yar
rule Ciszu_Suspicious_Packer_UPX {
    meta:
        description = "UPX packer detection"
        author = "Ciszu Security"
    strings:
        $upx1 = "UPX!" ascii wide
        $upx2 = "UPX0" ascii wide
        $upx3 = "UPX1" ascii wide
    condition: any of them
}

rule Ciszu_Crypto_Miner_Strings {
    meta:
        description = "Cryptocurrency miner indicators"
    strings:
        $str1 = "stratum+tcp" ascii
        $str2 = "xmrig" ascii nocase
        $str3 = "monero" ascii nocase
        $str4 = "cryptonight" ascii nocase
    condition: 2 of them
}

rule Ciszu_Discord_Token_Grabber {
    meta:
        description = "Discord token stealer patterns"
    strings:
        $t1 = "discord.com/api/v" ascii
        $t2 = "authorization" ascii nocase
        $t3 = "token" ascii nocase
    condition: all of them and filesize < 5MB
}
```

### 11.4 Integración en pipeline CI/CD

```yaml
# .github/workflows/malware-scan.yml
name: Malware Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ClamAV scan
        run: |
          sudo apt-get update && sudo apt-get install -y clamav
          freshclam
          clamscan -r --infected --move=quarantine .
      - name: YARA scan
        run: |
          git clone https://github.com/YARA-Rules/rules.git /tmp/yara-rules
          yara -r /tmp/yara-rules/malware/ .
      - name: PEframe static analysis (Windows artifacts)
        if: runner.os == 'Windows'
        run: python tools/cibersecurity/malware/peframe.py --json output/peframe.json .
```

---

## 12. SECURITY OPERATIONS CENTER MONITORING (SOC MONITORING)

> **Definición**: capacidades de monitoreo continuo de seguridad, detección de anomalías, alerting y respuesta a incidentes para el ecosistema Ciszu Network.

### 12.1 Arquitectura de monitoreo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  DATA SOURCES   │───▶│  COLLECTION     │───▶│  SIEM / LOG     │───▶│  ALERTING &    │
│  (Logs, Metrics,│    │  (Agents,       │    │  AGGREGATION    │    │  RESPONSE      │
│   Traces, Net)  │    │   Forwarders)   │    │  (Loki/ELK/     │    │  (Alertmanager,│
└─────────────────┘    └─────────────────┘    │   Custom)       │    │  PagerDuty,    │
                                               └─────────────────┘    │  Discord,      │
                                                    │                │  Email)        │
                                                    ▼                └─────────────────┘
                                         ┌─────────────────┐
                                         │  DASHBOARDS     │
                                         │  (Grafana/      │
                                         │  Custom)        │
                                         └─────────────────┘
```

### 12.2 Fuentes de datos (Data Sources)

| Fuente | Tipo | Herramienta | Métricas clave |
|---|---|---|---|
| **Web Apps (4)** | App logs, Access logs, Error tracking | Sentry + Vercel Analytics + custom middleware | Error rate, Latency (p50/p95/p99), 4xx/5xx rate, RPS |
| **Discord Bot** | Gateway events, Command latency, DB queries | Custom metrics + Prometheus exporter | Commands/sec, Latency p95, DB pool, Gateway latency |
| **Supabase (Postgres)** | Query logs, Slow queries, Connections | `pg_stat_statements` + `pg_stat_activity` | Slow queries (>1s), Connection pool usage, Lock waits |
| **CDN (Supabase Storage)** | Access logs, Bandwidth, Errors | Supabase logs + Cloudflare Analytics | Bandwidth, Cache hit ratio, 4xx/5xx, Latencia |
| **Infra (Vercel, GitHub)** | Deploy status, Build logs, Secrets scan | Vercel API, GitHub API, TruffleHog | Deploy success rate, Build time, Secrets leaked |
| **Discord Server** | Audit log, Member joins/leaves, Mod actions | Discord API + bot logging | Raid detection, Mass join/leave, Role changes |

### 12.3 Reglas de alerting (Alerting Rules)

| Alerta | Condición | Severidad | Canal | SLA respuesta |
|---|---|---|---|---|
| **Web Error Rate Spike** | Error rate 5xx > 5% por 5min | Critical | Discord #alerts + PagerDuty | < 15 min |
| **Bot Command Latency** | p95 > 3s por 10min | Warning | Discord #alerts | < 1 hora |
| **DB Slow Query** | Query > 5s sostenido 10min | Warning | Discord #alerts | < 4 horas |
| **CDN Cache Miss Spike** | Hit ratio < 80% por 15min | Warning | Discord #alerts | < 2 horas |
| **Secret Leak (TruffleHog)** | Secret detectado en push | Critical | Discord #alerts + Email CEO | < 30 min |
| **Discord Raid Detected** | >50 joins/min + cuentas <7d | Critical | Discord #mod-log + Bot lockdown | < 5 min |
| **Secret Expiry** | Cert/Token expira < 30 días | Info | Email CEO | < 7 días |
| **Cert SSL Expiry** | Cert expira < 14 días | Warning | Discord + Email | < 7 días |

### 12.4 Stack de monitoreo (actual / objetivo)

| Capa | Actual | Objetivo (Q1 2027) |
|---|---|---|
| **Logs** | Sentry + Vercel logs + Discord bot file logs | Grafana Loki (self-hosted en VPS) |
| **Métricas** | Sentry metrics + Vercel Analytics | Prometheus + Grafana (VPS) |
| **Traces** | Sentry (sampled) | Tempo (Grafana) |
| **Alerting** | Discord webhooks + custom scripts | Alertmanager + PagerDuty (free tier) |
| **Dashboards** | Vercel/Sentry dashboards | Grafana (unificado) |
| **Uptime** | UptimeRobot (5 min) | UptimeRobot + Blackbox Exporter |

### 12.5 Runbooks de respuesta a incidentes

| Incidente | Pasos (Runbook) | Responsable |
|---|---|---|
| **Web 5xx Spike** | 1. Verificar Sentry → 2. Revisar deploy reciente → 3. Rollback Vercel si deploy reciente → 4. Hotfix si bug código | Dev Lead |
| **Bot Offline** | 1. Verificar Docker container → 2. Revisar logs → 3. Reiniciar container → 3. Verificar DB connectivity | Dev Lead |
| **Secret Leak** | 1. Rotar secreto inmediatamente → 2. Revocar token expuesto → 3. Auditar acceso → 4. Post-mortem | CEO + Security |
| **Discord Raid** | 1. Bot: lockdown automático → 2. Mods: verificación captcha → 3. Ban masivo alts → 4. Ajustar verification level | Mods + Bot |
| **Cert/Token Expiry** | 1. Renovación automática (si ACME) / Manual → 2. Desplegar → 3. Verificar | Dev Lead |

---

## 13. PENTESTER UPTIME & MORE TOOLS (Pentester / Uptime / Herramientas Avanzadas)

> **Definición**: toolkit ofensivo/defensivo para validación de seguridad proactiva: pentesting autorizado, monitoreo de uptime avanzado, y herramientas especializadas de hardening.

### 13.1 Herramientas de Pentesting (Autorizado / Scope Interno)

| Herramienta | Categoría | Uso en Ciszu | Integración |
|---|---|---|---|
| **Nmap** | Network scanner | Escaneo puertos, servicios, OS fingerprinting VPS | `nmap -sS -sV -O -T4 target` |
| **Masscan** | Fast port scanner | Descubrimiento rápido superficie red | `masscan -p1-65535 --rate 1000 target` |
| **Nuclei** | Vulnerability scanner | Plantillas CVE, misconfigs, exposed panels | `nuclei -t cves/ -t misconfig/ -u target` |
| **Nikto** | Web server scanner | CGI, headers, outdated software | `nikto -h target` |
| **OWASP ZAP** | DAST / Active scan | Escaneo activo apps web (staging) | `zap-baseline.py -t https://staging.ciszu.app` |
| **SQLMap** | SQLi automation | Prueba inyección SQL en endpoints (scope limitado) | `sqlmap -u "url" --batch --risk=1` |
| **FFUF / Gobuster** | Fuzzing / Dir enum | Descubrimiento directorios, archivos, vhosts | `ffuf -w wordlist -u https://target/FUZZ` |
| **Subfinder / Amass** | Subdomain enum | Descubrimiento subdominios wildcard | `subfinder -d ciszu.app -all` |
| **HTTPX** | HTTP probe | Validar hosts vivos, tech detect, screenshots | `httpx -l subs.txt -title -tech-detect -sc` |
| **DalFox** | XSS scanner | Detección XSS reflejo/almacenado | `dalfox url https://target?param=test` |
| **Kiterunner** | API endpoint enum | Descubrimiento endpoints GraphQL/REST | `kr scan routes -w wordlist` |

### 13.2 Uptime Monitoring Avanzado

| Herramienta | Función | Configuración Ciszu |
|---|---|---|
| **UptimeRobot** | HTTP/HTTPS/Ping/Port monitoring | 4 webs (5 min), API health endpoints, Discord webhook alerts |
| **Uptime Kuma** | Self-hosted status page + monitoring | VPS: `https://status.ciszu.app` — checks: HTTP, TCP, DNS, Keyword, Push |
| **Blackbox Exporter + Prometheus** | Probing sintético (HTTP, DNS, TCP, ICMP) | VPS: probes cada 30s, alertas Alertmanager |
| **Healthchecks.io** | Cron job monitoring | Backups, scripts `cdn:upload`, `docs:sync`, `globaldocsgen` — ping al finalizar |
| **Better Uptime** | Status page público + incident management | `status.ciszu.network` (si budget) |

### 13.3 Herramientas de Hardening y Post-Exploitation (Defensivo)

| Herramienta | Uso | Integración |
|---|---|---|
| **Lynis** | Auditoría hardening Linux (VPS) | `lynis audit system` — mensual en VPS |
| **OpenSCAP / oscap** | Compliance SCAP (CIS, STIG) | `oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_cis` |
| **Dockle / Hadolint** | Container security (Dockerfile, image) | CI: `hadolint Dockerfile` + `dockle image:tag` |
| **TruffleHog / GitLeaks / Detect-Secrets** | Secret scanning (git history + staged) | Pre-commit + CI: `trufflehog git file://. --fail` |
| **Syft + Grype** | SBOM + Vulnerability scan (containers) | `syft image:tag -o json | grype -o table` |
| **Cosign / Sigstore** | Firmado/verificación artifacts | `cosign sign --key env://COSIGN_PRIVATE_KEY image:tag` |
| **Falco** | Runtime security (K8s/host) | Rules custom: shell spawn, file write /etc, network conn suspicious |

### 13.4 Playbooks de Pentesting Interno (Trimestral)

| Alcance | Herramientas | Entregable |
|---|---|---|
| **Recon externo** | Subfinder + Amass + HTTPX + Nuclei | Mapa superficie: subdominios, tech stack, puertos, vulns conocidos |
| **Web App (Staging)** | OWASP ZAP (baseline + active), Nuclei (cves/web), DalFox (XSS) | Reporte: hallazgos CVSS ≥ 7, falsos positivos filtrados |
| **API (Staging)** | Kiterunner + Nuclei (api) + custom scripts | Endpoints descubiertos, auth bypass, rate limit, info disclosure |
| **Infra (VPS)** | Lynis + OpenSCAP + Nmap (localhost) + Dockle (images) | Hardening score, CIS benchmark compliance |
| **Supply Chain** | Syft + Grype (images), TruffleHog (repo), npm audit | SBOM, vulns en deps, secrets leaked |
| **Post-Exploitation (Simulado)** | BloodHound (AD — N/A), custom scripts | Lateral movement paths, privilege escalation vectors |

### 13.5 Métricas de programa de seguridad ofensiva

| Métrica | Target | Frecuencia |
|---|---|---|
| **Cobertura recon externo** | 100% subdominios conocidos escaneados | Mensual |
| **Vulns críticas/altas (CVSS ≥ 7)** | 0 en producción | Cada release + mensual |
| **Tiempo medio detección (MTTD)** | < 1 hora (alertas SOC) | Continuo |
| **Tiempo medio respuesta (MTTR)** | < 4 horas (P1) | Por incidente |
| **Hardening score (Lynis)** | ≥ 80/100 | Trimestral |
| **Secrets leaked en repo** | 0 (pre-commit + CI) | Continuo |

---

## 14. INTEGRACIÓN TRANSVERSAL: OSINT + MALWARE + SOC + PENTEST

### 14.1 Flujo de inteligencia unificado

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   OSINT      │────▶│  THREAT      │────▶│   SOC        │────▶│  PENTEST     │
│  (Recon,     │     │  INTEL       │     │  (Detect,    │     │  (Validate,  │
│  Attribution)│     │  (IOCs, TTPs)│     │  Alert,      │     │  Harden)     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   IOCs feeds         YARA rules          Alert rules         Nuclei templates
   (SpiderFoot)       (Malware auditor)   (Alertmanager)      (Pentester)
```

### 14.2 Feeds de inteligencia compartidos

| Feed | Fuente | Consumidor | Frecuencia |
|---|---|---|---|
| **IOCs (IP, domain, hash)** | SpiderFoot + VirusTotal + AbuseIPDB | SOC (blocklist), Malware Auditor (YARA), Pentester (scope) | Horaria |
| **YARA rules** | Malpedia + custom | Malware Auditor (scan), SOC (file monitoring) | Diaria |
| **Nuclei templates** | ProjectDiscovery + custom | Pentester (scan), SOC (passive) | Semanal |
| **Blocklists (IP/domain)** | AbuseIPDB + Spamhaus + custom | SOC (WAF/Cloudflare), VPS (iptables/nftables) | Horaria |
| **CVE watchlist** | NVD + GitHub Security Advisories | Pentester (Nuclei), SOC (vuln mgmt) | Diaria |

### 14.3 Automatización cross-funcional (scripts)

```bash
# tools/cibersecurity/intel/sync-feeds.sh
# Ejecutar cada hora via cron/systemd timer

# 1. Descargar feeds IOCs
curl -s https://rules.emergingthreats.net/blockrules/emerging-drop.suricata.rules > /tmp/et_drop.rules
curl -s https://www.spamhaus.org/drop/drop.txt > /tmp/spamhaus_drop.txt
curl -s https://www.binarydefense.com/banlist.txt > /tmp/binarydefense.txt

# 2. Procesar y unificar (IP/CIDR)
cat /tmp/*.txt /tmp/*.rules | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(/[0-9]+)?' | sort -u > /tmp/blocklist_ips.txt

# 3. Actualizar Cloudflare WAF (API)
python tools/cibersecurity/soc/update_waf.py --ips /tmp/blocklist_ips.txt

# 4. Actualizar VPS iptables/nftables
python tools/cibersecurity/soc/update_firewall.py --ips /tmp/blocklist_ips.txt

# 4. Generar YARA rules desde IOCs hash
python tools/cibersecurity/malware/ioc_to_yara.py --iocs /tmp/iocs.json --output tools/cibersecurity/yara/rules/auto_iocs.yar

# 5. Actualizar Nuclei templates (custom)
git -C tools/cibersecurity/pentest/nuclei-templates pull
python tools/cibersecurity/pentest/generate_templates.py --iocs /tmp/iocs.json

# 5. Log y métricas
echo "$(date -Iseconds) | IPs: $(wc -l < /tmp/blocklist_ips.txt) | YARA: $(grep -c '^rule ' tools/cibersecurity/yara/rules/auto_iocs.yar) | Nuclei: $(grep -c '^id:' tools/cibersecurity/pentest/nuclei-templates/custom/*.yaml)" >> tools/cibersecurity/intel/sync.log
```

---

## 15. GOVERNANCE Y COMPLIANCE

### 15.1 Matriz de responsabilidades (RACI)

| Actividad | CEO | Dev Lead | Security | Mods |
|---|---|---|---|---|
| OSINT Recon | I | C | **R** | I |
| Malware Audit | I | C | **R** | I |
| SOC Monitoring | A | R | **R** | C |
| Pentesting | A | C | **R** | I |
| Incident Response | A | R | **R** | R |
| Vulnerability Mgmt | A | R | **R** | I |
| Compliance (Lynis/OpenSCAP) | I | R | **R** | I |

### 15.2 Políticas de autorización (Scope interno)

- **Todo pentesting/escaneo**: Solo sobre infraestructura propia (VPS, staging, staging APIs, subdominios confirmados). **Nunca** sobre terceros sin autorización escrita.
- **OSINT**: Solo fuentes públicas. Nunca acceder a sistemas, forzar autenticación, ni usar credenciales filtradas.
- **Malware analysis**: Solo muestras propias (uploads de usuarios, adjuntos Discord, artifacts CI). Uso de sandbox aislado (VM snapshot).
- **Datos personales**: Nunca almacenar PII de terceros en git. Outputs en `test/osint/`, `tools/cibersecurity/*/output/` (gitignored).

### 15.3 Auditoría y revisión

| Revisión | Frecuencia | Responsable |
|---|---|---|
| **Revisión herramientas** | Trimestral | Security |
| **Actualización playbooks** | Semestral | Security |
| **Revisión scope/autorizaciones** | Anual | CEO |
| **Ejercicio Red Team (simulado)** | Anual | Security + Dev Lead |
| **Revisión compliance (Lynis/OpenSCAP)** | Trimestral | Dev Lead + Security |

---

_Última revisión: 30 ago 2026._ Relacionado: `SECURITY_PROTOCOLS.md`, `OSINT_PROTOCOLS.md`, `VAULT_SYSTEM.md`, `TODO.md`, `TESTING_SYSTEM.md` §10 (FULL_TESTING).