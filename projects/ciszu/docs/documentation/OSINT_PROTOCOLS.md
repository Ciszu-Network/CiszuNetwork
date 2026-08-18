# OSINT_PROTOCOLS — Protocolos de Inteligencia de Código Abierto

Versión: 1.0.0
Actualización: 2026-08-18
Identificador: OSINT_PROTOCOLS_V1.0.0_2026_08_18_ciszunetwork

> **Definición**: protocolos operativos de **OSINT** (Open Source INTelligence) del
> ecosistema Ciszu Network. Complementa `CIBERSECURITY_SYSTEM.md`: mientras ese doc define
> **qué herramientas son oficiales y su estado**, este define **cómo se investiga** de forma
> ética, repetible y segura.

> **Alcance**: cualquier tarea de búsqueda de perfiles (Sherlock/Maigret), alias de email
> (SimpleLogin) o, en fase POST-OSINT, teléfonos/correos/frameworks. Se aplica a todo uso
> desde PowerShell, opencode o CI.

---

## 1. Principios

1. **Licitud y ética.** OSINT usa fuentes públicas con fines legítimos: verificación de
   identidad, monitorización de marca, seguridad de cuentas propias, marketing/altas.
   Prohibido el acoso, doxxing, fraude o cualquier fin ilícito.
2. **Mínimo necesario.** Se pide el dato mínimo que responde la pregunta. Un username, un
   correo o un alias; nada de barridos masivos de terceros sin motivo.
3. **Datos personales en cuarentena.** Cualquier hallazgo con datos de terceros se guarda
   SOLO en `test/osint/<herramienta>/` o `tools/cibersecurity/osint/output/<herramienta>/` (gitignored).
   Jamás se committea ni se copia a `docs/` o `projects/`.
4. **No confiar en el propio estado.** Cada afirmación se verifica con la herramienta real
   (curl a la API, salida del binario, salida del wrapper).
5. **Proporcionalidad y destrucción.** Los reportes de prueba se limpian al terminar la
   tarea (o se mantienen solo si Ciszuko lo pide); nunca persisten más de lo necesario.

---

## 2. Estructura de carpetas y flujo de ejecución

### 2.1 Carpetas

| Carpeta | Uso | Git |
|---|---|---|
| `test/osint/maigret/` | Pruebas rápidas con Maigret (reportes CSVs/HTML) | ignorada |
| `test/osint/sherlock/` | Pruebas rápidas con Sherlock | ignorada |
| `test/osint/simplelogin/` | Pruebas/registros con SimpleLogin | ignorada |
| `tools/cibersecurity/osint/` | Wrappers oficiales + README + `output/` | ✅ versionada (scripts) |
| `tools/cibersecurity/osint/output/<tool>/` | Salida OFICIAL de las herramientas | ignorada |

Regla: en **modo test** se usa `-Test` (envía a `test/osint/`); en **modo oficial** se usa
sin `-Test` (envía a `tools/cibersecurity/osint/output/`).

### 2.2 Flujo estándar de una búsqueda de usernames

1. **Definir el objetivo**: ¿qué queremos saber? (¿existe en X? ¿qué perfiles principales?)
2. **Elegir herramienta**: barrido amplio = Sherlock; profundizar con datos extraídos =
   Maigret (recursión), ambos: primero Sherlock (rápido), luego Maigret sobre hallazgos.
3. **Ejecutar en test**: `osint-sher foo,bar -Preset quick -Test` (valida pipeline, sin
   ensuciar el output oficial).
4. **Repetir en oficial** si la respuesta se usará. `osint-sher foo,bar` (default full).
5. **Documentar/responder**: resumen usernames, nº de hallazgos y ruta de salida; SIN pegar
   credenciales ni datos personales innecesarios.
6. **Limpiar**: los reportes de prueba se mantienen solo si hacen falta; el resto se borra
   (`.opencode/temp/` para temporales del agente).

### 2.3 Flujo estándar con SimpleLogin

1. `osint-slo info` → validar key y ver la cuenta (email).
2. `osint-slo options` → ver dominios disponibles (`can_create`, suffixes).
3. `osint-slo create <prefijo>` → alias nuevo para la alta concreta.
4. Usar el alias en el registro/boletín; si trafica/spam: `osint-slo aliases` para ver el id
   y desactivarlo (toggle por id) — o anotar para desactivar desde la web/API.
5. Los aliases creados se registran (si aplica) para no reutilizar el correo real.

---

## 3. Herramientas operativas — protocolos de uso

### 3.1 Sherlock (v0.16.0)

**Presets del wrapper**:

| Preset | Flags | Cuándo |
|---|---|---|
| `full` (default) | `--csv --timeout 30` | uso real, respuesta formal |
| `quick` | `--csv --timeout 15` | smoke tests, iteración rápida |

**Reglas**:

- Usar `-Test` para validar el pipeline con usernames sintéticos o de prueba.
- `--site <site>` para acotar a la red de interés (evita falsos positivos).
- Un resultado "encontrado" es una URL potencialmente existente: **verificar con la fuente**
  (algunas redes devuelven 404/302). Maigret hace esto más robusto con su mismatch logic.
- Los CSV resultantes contienen el username y las URLs: tratar como dato intern.

### 3.2 Maigret (v0.6.4)

**Presets del wrapper**:

| Preset | Flags | Cuándo |
|---|---|---|
| `full` (default) | `--graph --tags social,tech --csv --json ndjson --html` | análisis en profundidad con visualización |
| `quick` | `--csv` | iteración rápida |

**Reglas**:

- Usar `--tags` para acotar categorías (social, tech, games…): reduce ruido y tiempo.
- `--folderoutput` (alias `-fo`) guarda los reportes por username; el wrapper lo fija.
- Recursión por defecto: Maigret extrae "otros datos" (nombres, lugares, otros usernames);
  si interesa solo el barrido, usar `--no-recursion`.
- Para IDs concretos (p. ej. Steam): `--id-type steam_id 76561198078602401`.

**Ejemplo oficial Ciszuko** (equivalente exacto al manual):

```powershell
.\tools\cibersecurity\osint\maigret.ps1 -Usernames none_xisty_zzz_999             # preset full
```

### 3.3 SimpleLogin (API v2, vinculada 18 ago 2026)

**Cuenta**: `fplayersoffcial@proton.me` (premium false; 4 dominios de alias).

**Protocolo de credenciales**:

- API key: vive en `services/supabase/.env` (`SIMPLELOGIN_API_KEY`) y en Bitwarden
  (item "SimpleLogin - fplayersoffcial (Ciszu Network)"). El wrapper la lee del vault.
- Recovery codes: `SIMPLELOGIN_RECOVERY_CODES` en vault + notes del item de Bitwarden.
- Regla de acceso: SIEMPRE a través de `tools/cibersecurity/osint/simplelogin.ps1`; nunca teclear la key
  en línea de comandos ni loguearla.

**Pautas de creación de alias**:

1. Prefijo descriptivo y corto: `prefijo = servicio-marca` (p. ej. `figma-ciszu`).
2. Ver dominio disponible con `options` (si `can_create` false → cuota superada).
3. Guardar el alias creado en los apuntes de la tarea (no en un `.md` público).
4. Si se filtra: desactivar el alias (web/API toggle); el correo real nunca se expone.

---

## 4. POST-OSINT — herramientas candidatas (investigación, aún sin integrar)

Investigación realizada el 18 ago 2026 (tarea 5 del TODO). Estado de cada familia y
conclusiones para la integración.

### 4.0 Resumen ejecutivo de la investigación

| Familia | Herramienta | Veredicto | Integrarla |
|---|---|---|---|
| framework | **SpiderFoot** | ✅ MIT, activo, Python 3.7+, **200+ módulos**, CLI+web, sin keys para la mayoría | **SÍ (prioridad)** |
| teléfono | **PhoneInfoga** | ⚠️ GPL-3.0 pero "stable but **unmaintained**"; requiere scanners externos | evaluación |
| teléfono | SEON | Comercial (API de pago) | marcada sin usar |
| teléfono | Sherlockeye | Comercial (IA, sube datos a terceros) | descartada |
| email | HaveIBeenPwned | API free con rate limit (vía SpiderFoot) | vía SpiderFoot |
| email | Epieos / Thatsthem | Servicios web/manuales | manual |
| email | Hunter.io | Freemium con cupo | vía SpiderFoot (tiered) |
| framework | Maltego | Community gratuita (GUI desktop) | ✅ **INSTALADA (Ciszuko)** — en configuración |
| técnica | Google Dorking | Gratuito, operadores de búsqueda | protocolo (no herramienta) |

**Integrado (18 ago 2026)**: SpiderFoot instalado en `clones/spiderfoot` (§4.1).

**Decisión (18 ago 2026, Ciszuko)**: toda API o herramienta de pago queda **DESCARTADA**
hasta que haya capital. SEON, Hunter.io, HIBP (uso con key) y similares **no se integran ni se
compran** por ahora. Si un día hay capital y se revisa de nuevo, el criterio será: se evalúa si
el módulo/función aporta algo que SpiderFoot free no cubra ya. Excepción: **Maltego** fue
instalada por Ciszuko (Community, gratuita) y está en configuración — su uso será manual/GUI
(no hay CLI para CI).

### 4.1 SpiderFoot (framework integral) — integración oficial

**Veredicto**: integrar como herramienta oficial de framework de investigación (cubre
correos, teléfonos, dominios, IPs, usernames y analítica). Motivos:

- Open source (MIT), Python 3.7+, **activamente desarrollado** (2012→hoy).
- **200+ módulos**; la mayoría gratis y muchos sin API key (internos). Integra HIBP,
  Hunter.io, SEON, CallerName, TextMagic, Twilio, numverify, AbstractAPI, etc.
- **CLI** (`sf.py`) + web UI local opcional.
- Escanea **un target por scan**; exporta tab/csv/json a stdout y persiste a SQLite.

**Estado**: **instalado** (18 ago 2026, clon en `clones/spiderfoot`; aprobación AGENTS §7.1).
Nota de instalación: `lxml<5` no tiene rueda para Python 3.14 (solo 6.x). Se instaló
`lxml 6.1.1` (compatible) y el resto de dependencias sin `--only-binary` (ipaddr y otras
son pure-python). Verificar: `python sf.py -V` → `SpiderFoot 4.0.0`.

```bash
git clone https://github.com/smicallef/spiderfoot "clones\spiderfoot"   # dentro del repo
cd "clones\spiderfoot" && pip install -r requirements.txt
python ./sf.py -l 127.0.0.1:5001   # web UI (opcional)
```

**Wrapper oficial**: `tools/cibersecurity/osint/spiderfoot.ps1` (busca el clon en `clones\spiderfoot\sf.py`).
Presets:
- `full` (default): `-u passive` — todos los módulos pasivos sin API keys (lento, exhaustivo).
- `quick`: módulos gratuitos seleccionados automáticamente según el **tipo de target**:
  email (`sfp_email,sfp_haveibeenpwned,sfp_pgp,sfp_botscout,sfp_psbdmp,sfp_threatcrowd,
  sfp_emailrep`), teléfono (`sfp_phone,sfp_intelx`), dominio (`sfp_whois,sfp_crt,sfp_viewdns,
  sfp_hunter`) o username (`sfp_gravatar,sfp_keybase,sfp_social,sfp_accounts`).

Salida CSV por target a `test/osint/spiderfoot/` (test) y `tools/cibersecurity/osint/output/spiderfoot/`
(oficial).

**Comandos**: PowerShell `osint-sfx` · opencode `/spiderfoot <target>`.

### 4.1.1 Uso por tipo de target (email / dominio / teléfono)

SpiderFoot (vía `helpers.targetTypeFromString`) detecta el tipo por el **formato** del target:
`@` → email · `+` solo dígitos → teléfono · formato DNS → dominio · resto → username.

| Tipo | Ejemplo | Comando PowerShell | Comando opencode |
|---|---|---|---|
| **Email** | `foo@example.com` | `osint-sfx foo@example.com` | `/spiderfoot foo@example.com` |
| **Dominio** | `example.com` | `osint-sfx example.com -Preset quick -Test` | `/spiderfoot example.com` |
| **Teléfono** | `+584165551234` (con `+`) | `osint-sfx +584165551234` | `/spiderfoot +584165551234` |
| **Username** | `none_xisty_zzz_999` | `osint-sfx none_xisty_zzz_999` | `/spiderfoot none_xisty_zzz_999` |

Reglas:
- El teléfono debe pasar **con `+` y solo dígitos** (`+584165551234`); sin `+` se trataría como
  username.
- `quick` tarda ~10-15 s por target y usa solo módulos gratuitos. `full` (`-u passive`) cubre
  todo (brechas, social, DNS, PGP, etc.) pero es lento.
- Verificado 18 ago 2026: dominio → WHOIS real de example.com; teléfono de prueba → proveedor
  (Movilnet) retornado por `sfp_phone`; email sintético → solo cabecera (no existe).
- El CSV puede contener `sfp_whois` con saltos de línea embebidos en la celda (normal al
  volcar whois multilínea; leerlo con parser CSV, no con `Get-Content` por líneas).

### 4.2 Búsqueda de números de teléfono

| Herramienta | Para qué | Modelo/licencia | Estado |
|---|---|---|---|
| **PhoneInfoga** | Dato técnico del número: país, carrier, tipo de línea + rastros web | GPL-3.0, Go | ⚠️ **unmaintained** (repositorio `sundowndev/phoneinfoga`, 17.5k★, "stable but unmaintained, podría archivarse"). Requiere compilar en Go y configurar scanners externos (Twilio API, etc.) para ser útil. |
| **SEON** | "Digital footprint": en qué servicios está registrado un número | Comercial (API de pago) | **DESCARTADA (sin capital)**. SpiderFoot la integra como módulo tiered (requiere key/seuro, cosa que no se paga hoy). |
| **Sherlockeye** | Búsqueda inversa profunda con IA | Plátaforma comercial | **Descartada**: sube datos del objetivo a un tercero con IA; riesgo de privacidad injustificado. |

Conclusión teléfonos: para el ecosistema, **usar los módulos de teléfono de SpiderFoot**
(no requiere herramienta aparte; los de pago quedan descartados). PhoneInfoga se descarta
también por estar unmaintained y requerir scanners externos (API) para ser útil.

### 4.3 Búsqueda de correos electrónicos

| Herramienta | Para qué | Modelo/licencia | Notas |
|---|---|---|---|
| **Have I Been Pwned?** | Saber si un correo/teléfono apareció en brechas | API free con rate limit / vía SpiderFoot | **SÍ** vía SpiderFoot (módulo `sfp_haveibeenpwned`); el endpoint público es free con límites estrictos — sin pagar |
| **Epieos** | Info de cuenta de Google (Maps/Calendar/Photos) | Servicio web | Uso manual cuidado; líder a servicios con auth |
| **Hunter.io** | Correos corporativos por dominio | Freemium (cupo) | **DESCARTADA (sin capital)**: solo vía SpiderFoot tiered cuando haya cupo pagado — no hoy |
| **Thatsthem** | Búsqueda inversa de correo con registros públicos | Web con límites | Manual |

### 4.4 Frameworks de investigación integral / técnicas

| Herramienta | Para qué | Modelo/licencia | Estado |
|---|---|---|---|
| **Maltego** | Minería de datos + visualización de vínculos (entidades) | Community gratuita (GUI) | ✅ **Instalada** (18 ago 2026, Ciszuko); en configuración. Uso manual/GUI; sin CLI para CI |
| **SpiderFoot** | Automatizar búsqueda en cientos de fuentes (correos, números, dominios, IPs) | Open source (MIT), CLI/web | **Integrado oficial** (§4.1) |
| **Google Dorking** | Operadores de búsqueda avanzada | Gratuito | **Protocolo** (no herramienta): ver §4.5 |

### 4.5 Google Dorking — operadores útiles

```text
"correo@ejemplo.com"                        # apariciones literales
site:linkedin.com "nombre apellido"         # perfiles en LinkedIn
intitle:"index of" "backup"                 # directorios expuestos
inurl:admin site:dominio.com                # paneles de admin
filetype:env "DB_PASSWORD" dominio.com      # archivos de configuración filtrados
```

Reglas: operadores combinables, no requieren cuenta, respetar los TOS del buscador y no
usar para datos no públicos de terceros.

---

## 4.6 Cuadro consolidado — aplicadas vs descartadas (18 ago 2026)

| Herramienta | Categoría | Estado | Por qué (aplicada / descartada) |
|---|---|---|---|
| **Sherlock** | username | ✅ **APLICADA** | Open source (MIT), instalada, wrapper `sherlock.ps1`, comandos `/sherlock` + `osint-sher` |
| **Maigret** | username | ✅ **APLICADA** | Open source, instalada, wrapper `maigret.ps1`, comandos `/maigret` + `osint-mai` |
| **SimpleLogin** | email (alias) | ✅ **APLICADA** | API gratuita vinculada (cuenta `fplayersoffcial@proton.me`), vault + Bitwarden, `/simplelogin` + `osint-slo` |
| **SpiderFoot** | framework integral (email + teléfono + dominio + IP) | ✅ **APLICADA** | Open source (MIT), activo, **200+ módulos**, instalada en `clones/spiderfoot` (v4.0.0), `/spiderfoot` + `osint-sfx`. Cubre el hueco de email/teléfono que sherlock/maigret no tienen |
| **Google Dorking** | técnica | ✅ **PROTOCOLO** | Gratuito, sin instalación; operadores documentados (§4.5) |
| **HIBP (Have I Been Pwned)** | email (brechas) | ✅ **VÍA SPIDERFOOT** | Free con rate limit estricto; se usa como módulo pasivo de SpiderFoot (sin key) |
| **PhoneInfoga** | teléfono | ❌ **DESCARTADA** | "stable but **unmaintained**" (podría archivarse); requiere compilar Go + scanners externos con API para ser útil |
| **SEON** | teléfono/email | ❌ **DESCARTADA** | API de **pago**; descartada hasta tener capital |
| **Sherlockeye** | teléfono | ❌ **DESCARTADA** | Sube datos del objetivo a un tercero con IA (riesgo de privacidad); servicio comercial |
| **Hunter.io** | email corporativo | ❌ **DESCARTADA** | Freemium con cupo; módulo tiered de SpiderFoot — no se paga hasta tener capital |
| **Epieos** | email Google | ⏸️ **SIN INTEGRAR** | Servicio web manual; requiere auth de Google del objetivo (uso manual cuidado, sin wrapper) |
| **Thatsthem** | email inverso | ⏸️ **SIN INTEGRAR** | Web con límites; solo uso manual |
| **Maltego** | framework GUI | ✅ **INSTALADA** | Community gratuita (GUI desktop); instalada por Ciszuko 18 ago 2026, en configuración. Uso manual; sin CLI para CI (la complementa SpiderFoot) |
| **AbstractAPI/numverify/Twilio/CallerName/TextMagic** | teléfono | ❌ **DESCARTADAS** | Módulos de SpiderFoot que requieren API key de pago (abstractapi, numverify, Twilio, CallerName…) — sin capital |
| **SEON/Epieos/Thatsthem** | email | ❌ **DESCARTADAS/SIN INTEGRAR** | Ver filas individuales |

**Resumen**: el stack OSINT hoy cubre **username** (Sherlock/Maigret), **email y teléfono**
(SpiderFoot, gratis sin API keys) y **alias** (SimpleLogin). Todo lo de pago queda descartado
hasta haber capital (ver §4.0).

---

## 5. Seguridad y manejo de datos

1. **Datos de terceros = sensibles.** Aunque sean "públicos", no se exponen en el repo ni en
   reportes que viajen. Carpeta de trabajo: gitignored.
2. **Sin credenciales en texto.** Wrapper leen del vault; `SECRET_TEMP.env` es el puente
   transitorio; nada en `.md`.
3. **Rate limits**: respetar los límites de cada servicio (SimpleLogin paginado, HIBP
   límites, etc.). No abusar: cada ítem por separado y con tiempos.
4. **Rotación**: si un token aparece en logs/chat/commit → rotar (SimpleLogin: regenerar key
   desde el panel; anotar rotación en `scripts/tokens_a_rotar.md`).
5. **Bitwarden/vault**: alias, keys y recovery codes de herramientas de seguridad viven en
   vault + Bitwarden según `VAULT_SYSTEM.md`.

### 5.1 Flujo de credenciales (SECRET_TEMP → vault → Bitwarden)

Cuando Ciszuko pase un secreto (API key, token, ID, secret), **nunca lo escribe en el
chat**: lo pone como variable en `SECRET_TEMP.env` y lo referencida en TODO/docs. El agente:

1. Abre `SECRET_TEMP.env` y lee la variable (sin imprimirla).
2. La añade al vault `services/supabase/.env` (al final, sin tocar lo existente) y ejecuta
   `vault.ps1 crypt` + `backup` + `verify`. El `.env.age` es la copia oficial cifrada.
3. La registra en el item de Bitwarden correspondiente.
4. La usa al vuelo en la tarea (curl, wrappers, llamadas a API).
5. Al terminar la tarea, Ciszuko elimina la variable de `SECRET_TEMP.env`; el valor queda
   persistido y cifrado en vault + Bitwarden.

Reglas: `SECRET_TEMP.env` nunca se cifra (se abre constantemente) ni se sube a ningún
sitio; los `.env` no se committean; los valores nunca se imprimen en logs/resúmenes.
Detalle: `CIBERSECURITY_SYSTEM.md` §5 y `VAULT_SYSTEM.md` §3.7.

---

## 6. Comandos de referencia rápida

### 6.1 Comandos PowerShell (funciones del perfil)

| Necesidad | Comando |
|---|---|
| Presencia social de un username | `osint-sher none_xisty_zzz_999` |
| Idem rápido (test) | `osint-sher none_xisty_zzz_999 -Preset quick -Test` |
| Profundizar con datos extraídos | `osint-mai none_xisty_zzz_999` |
| Validar pipeline Maigret | `osint-mai none_xisty_zzz_999 -Preset quick -Test` |
| Validar cuenta SimpleLogin | `osint-slo info` |
| Ver dominios disponibles | `osint-slo options` |
| Crear alias `figma-ciszu` | `osint-slo create figma-ciszu` |
| **SpiderFoot: email** | `osint-sfx foo@example.com` |
| **SpiderFoot: dominio** | `osint-sfx example.com` |
| **SpiderFoot: teléfono** | `osint-sfx +584165551234` |
| **SpiderFoot: username** | `osint-sfx none_xisty_zzz_999` |
| Dispatcher genérico | `osint maigret -Usernames none_xisty_zzz_999` |

### 6.2 Comandos opencode (IA, comando `/`)

| Comando | Acción | Ejemplo |
|---|---|---|
| `/osint <herramienta> [args]` | Dispatcher genérico | `/osint spiderfoot example.com` |
| `/sherlock <usernames>` | Sherlock (usernames) | `/sherlock none_xisty_zzz_999` |
| `/maigret <usernames>` | Maigret (usernames, recursión) | `/maigret none_xisty_zzz_999` |
| `/simplelogin <acción>` | SimpleLogin (alias email) | `/simplelogin info` |
| `/spiderfoot <target>` | SpiderFoot (email/dominio/teléfono/username) | `/spiderfoot example.com` |

### 6.3 Ejemplos SpiderFoot por tipo (formato del target = tipo)

| Tipo | Formato | Ejemplo con `osint-sfx` | Salida típica |
|---|---|---|---|
| **Email** | contiene `@` | `osint-sfx foo@example.com` | brechas (HIBP), PGP, reputación |
| **Dominio** | formato DNS | `osint-sfx example.com` | WHOIS, certificados (crt.sh), subdominios |
| **Teléfono** | `+` + solo dígitos | `osint-sfx +584165551234` | proveedor/línea (sfp_phone) |
| **Username** | resto | `osint-sfx none_xisty_zzz_999` | Gravatar, Keybase, redes sociales |

Verificado 18 ago 2026 en modo `-Test`: teléfono `+584165551234` → proveedor **Movilnet**;
dominio `example.com` → WHOIS real de IANA; email sintético `nonexiste@example.com` → solo
cabecera (la cuenta no existe). Preset `quick` tarda ~10-15 s por target.

### 6.4 Reglas

- Si el usuario no indica lo contrario, la salida oficial va a `tools/cibersecurity/osint/output/<tool>/`;
  `-Test` envía a `test/osint/<tool>/` (gitignored).
- Nunca imprimir API keys ni recovery codes; los wrappers leen del vault.
- Nunca usar usernames/emails/teléfonos reales en pruebas; usar el sintético
  `none_xisty_zzz_999` o variantes (`nonexiste@example.com`, `+584165551234`).
- Reportar resumen: targets consultados, nº de hallazgos y carpeta de salida.

---

## 7. Checklist de un caso de OSINT bien ejecutado

1. Objetivo claro y legítimo definido.
2. Pipeline validado en `-Test` antes de producción.
3. Herramienta adecuada (Sherlock barrido / Maigret profundidad / SimpleLogin alias).
4. Salida en carpeta gitignored correcta (`test/osint/` o `tools/cibersecurity/osint/output/`).
5. Resultados verificados contra la fuente externa (URL responde, alias reenvía).
6. Ningún secreto ni dato personal de terceros en commits, docs ni resúmenes.
7. Tarea documentada en el doc relevante (`CIBERSECURITY_SYSTEM.md` / este doc) y, si
   proviene del TODO, anotada al usuario para que la marque.

---

## 8. Historial

| Fecha | Cambio |
|---|---|
| 18 ago 2026 | Doc creada (v1.0.0). Protocolos Sherlock/Maigret/SimpleLogin; sección POST-OSINT candidatas |
| 18 ago 2026 | Sección §6 ampliada con comandos SpiderFoot por tipo (email/dominio/teléfono/username) y ejemplos verificados; regla de usernames sintéticos |
| 18 ago 2026 | **Maltego Community instalada por Ciszuko** (en configuración); estado actualizado en §4.0/§4.4/§4.6 de candidata/opcional a INSTALADA |

---

_Última revisión: 2026-08-18._ Relacionado: `CIBERSECURITY_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`VAULT_SYSTEM.md`, `TODO.md`.