# Seguridad, DevSecOps y escalabilidad en Ciszu Network

**(asunto):** seguridad_escalabilidad · **Reporte:** 2026-09-30
**Solicitado por:** Ciszuko Antony

---

## 1. Resumen ejecutivo

El ecosistema ya tiene una base solida (RLS en toda tabla, BotID, reCAPTCHA/Turnstile,
rate limits, RBAC por website, jerarquia de moderacion con auditoria completa). El riesgo
principal **hoy no es un bug del sistema: es el plano humano y el "ultimo metro" de los
accesos**: la `DEVCON_PASSWORD` unica, el poder total del owner en una sola cuenta y la
ausencia de un boton de emergencia global. Este reporte responde todas tus preguntas con
como lo hacen las grandes empresas, propone un roadmap por prioridades e incluye ya
implementado el **kill switch / pantalla de mantenimiento** (ver §6).

---

## 2. Como lo hacen las grandes empresas (Google, Meta, Microsoft/Cloudflare)

### 2.1 Zero Trust: la red ya no es "confiable"

Modelo **BeyondCorp** (Google): antes, estar dentro de la VPN bastaba para acceder a todo.
Hoy **cada peticion se autentica y autoriza por si misma**: usuario + dispositivo +
contexto (IP, geolocalizacion, horario, riesgo). No existe "estar dentro" como privilegio.

### 2.2 Cuentas de staff: hardware, no contrasenas

- Google exige a sus empleados **llaves de seguridad fisicas (FIDO2/WebAuthn)** desde 2017:
  resistentes al phishing porque verifican el **dominio real** y no pueden reutilizarse en
  un sitio falso. Sin SMS (interceptable) y con contrasena solo como factor secundario.
- Cuentas **device-bound** y sesiones con expiracion corta; reconexion frecuente.
- Resultado: incluso con la contrasena, sin la llave fisica no hay acceso.

### 2.3 "¿Si entro a la cuenta del CEO de Google tengo todo?"

**No.** Tu pregunta tiene respuesta directa:

1. Sin su **llave fisica** no entras (el phishing no escala).
2. Aunque entraras: principio de **minimo privilegio**. Su cuenta de usuario **no** tiene
   acceso directo a produccion; el acceso administrativo vive en **cuentas separadas**
   (admin persona vs admin servicio), con permisos por grupo y **aprobacion**.
3. Todo acceso privilegiado es **just-in-time**: se solicita, se aprueba, dura horas y se
   **revoca**. Se registra con quien lo pidio, para que y quien aprobo.
4. Existen **break-glass accounts**: cuentas de emergencia con contrasenas de 100+ chars en
   cajas fuertes fisicas, con alerta a todo el equipo cuando se usan.
5. **Separacion de deberes**: la persona que despliega no es la que aprueba la auditoria.
   El CEO no es administrador del sistema por ser CEO; los permisos no vienen del cargo sino
   del rol tecnico asignado y auditado.

### 2.4 Produccion solo por sistemas intermedios

- **Bastiones / PAWs** (Privileged Access Workstations): los admins no tocan produccion
  desde su laptop personal; usan equipos dedicados y limpios, y todo pasa por consolas
  auditadas (como la devcon, pero en grande: en la nube, con doble control).
- Infraestructura **como codigo** (Terraform/IaC): los cambios no se "hacen en caliente",
  se revisan en PR y quedan versionados.
- **4-eyes principle**: para acciones destructivas (borrar cuentas, cambiar roles, purgar
  datos) se requieren **dos personas** (quien propone + quien aprueba). Slack, Meta y los
  bancos lo aplican; para equipos pequenos se adapta a "propuesta + espera de 5 min +
  segundo login".

### 2.5 Deteccion de acciones sospechosas

Sistemas tipo SIEM con reglas como las siguientes:
- Picos de acciones administrativas por usuario (ej. >5 bans en 10 min).
- Acciones en horarios atipicos para ese actor.
- Cambios de roles/permisos (siempre alertan).
- Accesos desde IP/pais nuevos para tareas de admin.
- Uso de cuentas break-glass (alerta inmediata a todo el equipo).
- Multiples fallos de autenticacion seguidos de exito (credential stuffing).

### 2.6 Sub-login y verificacion adicional para staff: ¿si existe?

**Si, es el estandar.** Se llama **step-up authentication** (autenticacion escalonada):
- La sesion normal navega; al entrar a **modo staff** o ejecutar acciones criticas, el
  sistema exige **re-autenticacion** (contrasena + TOTP/hardware) y la "eleva" por minutos
  (elevation window). Google lo hace con "admin reauth"; AWS con MFA por operacion.
- Para acciones muy criticas: **re-auth + confirmacion por segundo canal** (email/push) o
  aprobacion de otra persona (4-eyes).
- Conclusion para ti: un **sub-login de staff con contrasena larga + OTP** es 100% valido
  y recomendable; pero lo definitivo es **hardware key (FIDO2)** para owner/admin (hoy ya
  es viable: Supabase Auth soporta WebAuthn? → si no, se hace un paso propio con
  `navigator.credentials` + tabla de llaves registradas; ver §5).

---

## 3. Inventario honesto: que tenemos y que nos falta

### 3.1 Fortalezas actuales
| Capa | Estado |
|---|---|
| Datos | RLS en toda tabla nueva, escritura solo service-role, backups |
| Bots | BotID + Turnstile + reCAPTCHA v2/v3 + rate limits |
| Cuentas | Registro verificado C-XXX XXX, OTP de login, sesiones 7 dias, recordar por dispositivo |
| Roles | RBAC por website (owner/admin/mod/bot/vip/betatesting/support) con tag STAFF |
| Moderacion | Jerarquia con protecciones + **auditoria completa** (`moderation_actions`) |
| Sanciones | Bans/mutes con autor y fecha + **bans por IP** en registro/reclaim |
| Eliminacion | Ciclo 15 dias con backup, anonimizacion y credenciales invalidables |
| CI/CD | CodeQL, semgrep, gitleaks, SCA, DAST semanal, deploys con cola |

### 3.2 Riesgos reales (ordenados)

1. **`DEVCON_PASSWORD` unica y reutilizable** — si se filtra (o alguien la ve al escribirla
   delante de otro), se obtiene la consola completa (aunque pide identidad, la lista de
   identidades no es un segundo factor real).
2. **Owner en una sola cuenta** — tu cuenta personal de sitio tiene poder total: un
   descuido (reuso de contrasena, phishing, sesion abierta) = sitio comprometido.
3. **Sin step-up** para acciones destructivas desde la web (moderacion ya audita, pero no
   re-autentica).
4. **Sin deteccion de anomalias** (picos/patrones) ni alertas push por acciones criticas.
5. **Sin kill switch global** (resuelto hoy, §6).
6. **Cuentas bot** con rol bot: correcto, pero revisar que su email interno no reciba
   correos reales y que su key nunca se use para human-login.

---

## 4. GUI para mods/admins: como hacerlo bien

El "panel de moderacion" ya arranco (vista de staff en el perfil). El modelo correcto:

1. **Superficie limitada por rango**: cada rango ve SOLO lo que puede hacer.
   - `mod`: sanciones (ban/mute/levantar) + borrar contenido + ver historial.
   - `admin`: + editar perfiles (bio/amigos) + ajustar cuentas (con limites; nunca owner/bot).
   - `owner`: todo + roles + kill switch.
2. **La GUI no escribe directo a la DB**: llama a APIs del servidor que aplican RBAC +
   jerarquia + auditoria (ya implementado en `/api/moderation/action`).
3. **Step-up al entrar a modo staff** (sub-login): al activar la vista de staff, pedir
   contrasena + OTP (o llave) y dejar la elevacion por 30-60 min; al expirar, se pierde.
4. **Botones irreversible = doble confirmacion + marca**: lo hecho ya queda con tu
   identidad; para borrados masivos, exigir confirmacion escrita (como el ELIMINAR del
   usuario) y (futuro) aprobacion de un segundo staff.
5. **Nada de acciones silenciosas**: toasts + email/ntfy al equipo cuando un staff ejecuta
   una accion critica.

---

## 5. Roadmap por prioridad (recomendado)

### P0 — ya / inmediato
- [x] **Kill switch por web** con pantalla de mantenimiento (implementado hoy; §6).
- [ ] **Rotar `DEVCON_PASSWORD`** a 40+ caracteres aleatorios unicos, guardarla SOLO en
  Bitwarden/vault, nunca reutilizada en ningun otro sitio.
- [ ] **Separar tu vida digital**: el login owner de las webs NO debe estar en tu navegador
  diario ni reutilizar contrasena; usar un perfil de navegador dedicado.
- [ ] **Alertas ntfy** para: login de staff, cualquier ban/mute/edicion de rol, uso del
  kill switch y picos de sanciones (>3 en 10 min).

### P1 — siguiente iteracion
- [ ] **Step-up (sub-login staff)**: re-auth + OTP obligatorio al activar la vista de staff;
  elevacion con expiracion (~45 min).
- [ ] **TOTP opcional obligatorio para owner/admin** (adicional al OTP email actual): apps
  tipo Ente Auth/Aegis; se guarda secreto en el vault del usuario.
- [ ] **Deteccion de anomalias simple** (sin SIEM): contador por actor; si supera umbral →
  bloquear accion + alerta + exigir step-up.
- [ ] **4-eyes ligero** para acciones destructivas: propuesta en `moderation_requests` +
  aprobacion por segundo staff (o espera obligatoria de N minutos con notificacion).

### P2 — madurez
- [ ] **Llave fisica (FIDO2/WebAuthn)** para owner/admin (registrar llaves en una tabla
  `staff_webauthn_keys`; verificacion con challenge-respuesta en el step-up).
- [ ] **Purga de historial git** (los archivos internos retirados siguen en commits
  antiguos) + revision periodica con gitleaks.
- [ ] **Break-glass documentado**: como se recupera el control en el peor escenario
  (procedimiento escrito, practicado una vez).
- [ ] **Simulacro de restauracion** de backup (backup que no se prueba no es backup).

---

## 6. Kill switch y pantallas de mantenimiento (IMPLEMENTADO)

### 6.1 Que permite Vercel por su lado
- **Rollback instantaneo** a un deploy anterior (Project → Deployments → Promote): ideal
  para un deploy roto.
- **Pausar el proyecto** (Settings → pausar): apaga la web completa (mas brusco).
- Vercel **no** tiene "mostrar cartel de mantenimiento bonito": eso se hace en la propia
  app — por eso lo implementamos nosotros (granular por web y con mensaje).

### 6.2 Como quedo implementado
- Tabla `public.site_controls` (por website): `maintenance`, `message`, `reason`,
  `until`, `updated_by`. Lectura publica (el middleware la usa), escritura solo
  service-role.
- **Middleware de las 4 webs**: si la web esta en mantenimiento (y no vencio), TODA pagina
  devuelve una **pantalla 503 personalizada** ("Sitio en mantenimiento / intervencion")
  con razon y hora estimada; las rutas `/api/*` quedan excluidas para no romper
  integraciones de soporte.
- **Encendido/apagado** (por web, con actor y razon):
  - devcon → nueva seccion **CONTROL DE SITIOS**.
  - directo: `node scripts/site-control.js on <website> --actor=<quien> --reason="..." [--hours=N]`.
- Casos de uso que pediste: hackeo de cuentas staff (apagar y contener), migracion de
  base de datos/dominio (pausar interacciones), incidente grave (contencion inmediata),
  mantenimientos programados con mensaje claro.

---

## 7. Respuesta directa a tus preguntas

1. **"¿Si entro a la cuenta de un admin de Google tengo acceso a todo?"** No: llave
   fisica + minimo privilegio + accesos just-in-time + cuentas separadas + auditoria.
2. **"¿Hacen sublogin/verificacion extra para staff?"** Si: step-up authentication y
   re-auth por operacion critica; en equipos chicos se resume a "re-auth + OTP (o llave)
   al entrar a modo staff y en acciones irreversibles".
3. **"¿Un boton para parar todo?"** Si — implementado hoy (kill switch por web + pantalla).
4. **"¿Como evitar que un descuido con mi contrasena de owner comprometa el sitio?"**
   Cuenta dedicada sin reuso, MFA fuerte (hardware en el horizonte), step-up para acciones
   criticas, alertas, y job separation: el owner tambien pasa por las mismas APIs
   auditadas (no hay "acceso magico" en la web; todo queda registrado).

---

## 8. Estado del cambio (acciones tomadas en este reporte)

- Implementado: kill switch por web + pantalla 503 de mantenimiento + controles en
  devcon/script (§6); migracion y middleware desplegados con el codigo.
- Pendiente de tu decision: rotacion de la contrasena de devcon, activacion de alertas
  ntfy por acciones criticas y el plan P1/P2 (§5).

_Reporte generado: 2026-09-30. Relacionado: `SECURITY_PROTOCOLS.md`, `ACCOUNT_SYSTEM.md`,
`DEVSECOPS_SYSTEM.md`, `MONITORING_SYSTEM.md`, `REMOTE_CONTROL_SYSTEM.md`._
