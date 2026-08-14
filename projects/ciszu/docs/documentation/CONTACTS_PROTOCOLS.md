# CONTACTS_PROTOCOLS — Protocolos de Contacto (redes, números, correos, nombres)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: CONTACTS_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> Directorio de contacto oficial de Ciszu Network / Ciszuko Antony. Los valores provienen de
> las configs reales de las webs (`navigation.tsx`, páginas de soporte/contacto). Mantener
> alineado si cambian. Este documento es la **fuente única** de contactos públicos del ecosistema.

---

## 1. Persona principal

- **Nombre**: Francisco García Antonio M. — alias **Ciszuko Antony** / **Ciszuko** (siglas: Cisco, Fran).
- **Rol**: CEO & Fundador de Ciszuko Network (Ciszu Network).
- **Nombre de marca**: Ciszuko Network / Ciszu Network.
- **Email corporativo de contacto**: `ciszunetwork@outlook.com`.
- **Email de soporte/operativo**: `fplayersoffcial@gmail.com` (también cuenta de UptimeRobot; ver `ONLINE_SERVICES_SYSTEM.md`).
- **Ubicación**: Caracas, Venezuela (huso UTC-4; horario laboral ~10:00–20:00 VE).

## 2. Redes sociales (canal KING)

| Red | URL |
| --- | --- |
| GitHub | `https://github.com/Ciszu-Network` |
| YouTube | `https://www.youtube.com/@CiszuNetwork` |
| Instagram | `https://www.instagram.com/ciszunetwork/` |
| Facebook | `https://www.facebook.com/profile.php?id=61572023767657` |
| X (Twitter) | `https://x.com/CiszukoAntony` |
| TikTok | `https://www.tiktok.com/@ciszunetwork` |
| Twitch | `https://www.twitch.tv/ciszukoantony_` |
| LinkedIn | `https://linkedin.com/in/ciszuko` |
| Telegram | `https://t.me/CiszukoNetwork` |
| Spotify | `https://open.spotify.com/user/317nxlvcrrlwfxjogyirixsqjmfi?si=50c43b75eb6e47db` |

### 2.1 Propósito por red

| Red | Uso principal |
|---|---|
| GitHub | Código del ecosistema (org `Ciszu-Network`) |
| YouTube | Canal `@CiszuNetwork` — videos/música/promos |
| Instagram / TikTok | Cortos, arte, detrás de cámaras |
| X (Twitter) | Anuncios oficiales del ecosistema |
| Twitch | Streaming (Minecraft, dev, MuzicMania) |
| LinkedIn | Perfil profesional `in/ciszuko` |
| Telegram | Canal de la comunidad / avisos |
| Spotify | Perfil de artista/música de Ciszuko |
| Facebook | Página de marca |

## 3. Contacto directo

| Canal | Valor | Uso |
|---|---|---|
| **WhatsApp** | `https://wa.me/584126858111` (+58 412-6858111 — CO, Venezuela) | Soporte directo / ventas |
| **Discord (invitación)** | `https://discord.com/invite/W3kMtMMj6E` | Comunidad + servidor de CiszuBot |
| **Email soporte** | `fplayersoffcial@gmail.com` | Soporte, cuentas de servicios |
| **Email corporativo** | `ciszunetwork@outlook.com` | Contacto formal / negocios |

## 4. Plataformas/adopciones por producto

| Producto | Dónde se exponen los contactos |
|---|---|
| **MuzicMania** | `projects/muzicmania/website/src/config/navigation.tsx` y Footer |
| **CiszukoAntony** | `projects/ciszukoantony/website/src/config/navigation.tsx` (página soporte/contacto con WhatsApp y email) |
| **CiszuBot** | Página de invitación (OAuth2 scope `bot applications.commands`) — ver `AGENTS.md` |
| **CiszuNetwork** | Página principal con redes |
| **CiszuGamens** | Comunidad gaming (discord/torneos) |

## 5. Protocolo de uso de contactos

### 5.1 Reglas de fuente única

1. Editar aquí **y** en las configs de las webs; **no duplicar URLs sueltas en docs**.
2. **Nunca** volcar secretos (tokens, keys) junto a contactos — ver `VAULT_SYSTEM.md`.
3. Los números/correos públicos se muestran con `<a>` externos en las webs; no exponer datos
   privados no publicados aquí.
4. Si un servicio cambia de cuenta/URL: actualizar aquí + `AGENTS.md` + `VAULT_SYSTEM.md`.

### 5.2 Protocolo de respuesta (soporte)

- **WhatsApp/Telegram/Discord**: responder en <24h laborables.
- **Email**: responder en <48h laborables.
- **Escalado**: dudas técnicas → documentación (`documentation/`); bugs → `ERRORS_SYSTEM.md`;
  pagos → `PAYMENTS_SYSTEM.md`; vulnerabilidades → `SECURITY_PROTOCOLS.md`.

### 5.3 Protocolo de privacidad

- No publicar nunca: números privados, emails personales no autorizados, IPs, ubicación exacta.
- Solo publicar contactos que Ciszuko Antony haya autorizado (los de la tabla §2 y §3).
- En webs: usar `rel="noopener noreferrer"` en enlaces externos.

## 6. Cuentas operativas de servicios (mapeo)

> Los valores (tokens/keys) viven en `VAULT_SYSTEM.md`; aquí solo el mapeo cuenta→servicio.

| Servicio | Cuenta/email | Nota |
|---|---|---|
| UptimeRobot | `fplayersoffcial@gmail.com` | 5 monitores |
| Supabase | dashboard del proyecto `obwzzmbvkrcscqwptlqo` | BD/CDN/auth |
| Vercel | 4 proyectos (`ciszunetworkpage`, `ciszukoantonypage`, `ciszubot`, `muzicmania`) | deploys |
| GitHub | org `Ciszu-Network` | repo privado |
| Cloudflare | `dash.cloudflare.com` | Turnstile + Web Analytics |
| PostHog | proyecto `550383` | analítica |
| Sentry | org `ciszu-network` | errores |
| Discord | Developer Portal (app del bot) | bot |
| NOWPayments / Binance | rieles VE | pagos |

## 7. Checklist de actualización

- [ ] Cambió una URL de red → actualizar tabla §2 + `navigation.tsx` de las webs.
- [ ] Nuevo servicio en línea → añadir a §6 y a `ONLINE_SERVICES_SYSTEM.md`.
- [ ] Nuevo contacto público → añadir con autorización explícita.
- [ ] Revisar que ningún secreto se haya colado junto a contactos (secretlint/gitleaks).

## 8. Plantilla de ficha de contacto

Para añadir un contacto nuevo, rellenar esta ficha en la tabla correspondiente:

| Campo | Descripción | Ejemplo |
|---|---|---|
| Nombre | Etiqueta pública | Discord |
| Handle | Identificador | `@ciszunetwork` |
| URL | Enlace completo | `https://discord.gg/...` |
| Público | ¿Visible en webs? | Sí |
| Propietario | ¿Ciszuko / bot / servicio? | Ciszuko |
| Secreto asociado | ¿Requiere token? | No |

## 9. Contactos por proyecto

- **Ciszu Network** → redes de marca: Discord, Instagram, TikTok, YouTube, WhatsApp.
- **Ciszuko Antony** → canal YouTube `@CiszukoAntony`, redes del artista, contacto musical.
- **MuzicMania** → redes del juego, Discord del juego, soporte.
- **CiszuBot** → Discord del bot, estado en vivo, invite.

## 10. Uso en las webs

- Las webs construyen nav/footer desde `content/navigation.tsx` (o equivalentes), no desde
  este doc. Este doc es la fuente de verdad de *dónde están definidas* las URLs.
- Cambiar una URL solo en la fuente, luego regenerar/espejar si aplica.

## 11. Estándar de enlaces externos en las webs

- Todos los enlaces externos llevan `rel="noopener noreferrer"` (y `target="_blank"` acordado por producto).
- URLs completas y por HTTPS; sin acortadores salvo invitaciones de Discord (ya gestionadas por la plataforma).
- Un contacto por contexto: en la misma sección no repetir el mismo enlace dos veces.
- Verificar que la URL esté activa al actualizar (curl a la página o prueba manual), sin 404s.

## 12. Política de correos (soporte y formal)

| Canal | Plazo | Tono |
|---|---|---|
| WhatsApp / Telegram / Discord | <24 h laborables | directo, cercano |
| Email de soporte | <48 h laborables | profesional, con firma (Ciszuko Antony) |
| Email corporativo | <48 h laborables | formal, con encabezado de marca |

- Responder siempre desde la cuenta asignada al caso (no mezclar soporte y corporativo).
- No compartir datos privados de clientes ni terceros; derivar a `SECURITY_PROTOCOLS.md` si se sospecha phish.
- Si el contacto llega por un canal no listado (colaboración, prensa), escalar a `ciszunetwork@outlook.com`.

## 13. Manejo de marca y voz pública

- Nombre canónico: **Ciszuko Antony** (persona) y **Ciszuko Network / Ciszu Network** (marca).
- No atribuir el desarrollo a IA en público ni en código (identidad del fundador), según `AGENTS.md`.
- Redes de marca vs redes de artista: usar la cuenta correcta según el producto (§9).
- Cualquier perfil nuevo debe añadirse a §2 con autorización y registrarse en este doc.

## 14. Recuperación de cuentas (medidas generales)

- Las credenciales de los servicios en §6 viven en `VAULT_SYSTEM.md` (age, ACLs NTFS, BitLocker).
- Ante un posible robo de cuenta: rotar y notificar; consultar `DEVSECOPS_SYSTEM.md` (incidentes).
- Mantener al día los emails de recuperación en cada servicio (email de soporte del fundador).
- Sin recuperadores compartidos: cada cuenta de servicio tiene un propietario único.

## 15. FAQ de contactos

| Pregunta | Respuesta |
|---|---|
| ¿Cambió una URL? | Actualizar aquí + `navigation.tsx` de la web (fuente única) |
| ¿Es este doc la única fuente de contactos? | Sí, junto a las configs de las webs |
| ¿Puedo mostrar un canal que no está aquí? | No sin autorización explícita |
| ¿Dónde están los tokens de los servicios? | `VAULT_SYSTEM.md`, nunca aquí |
| ¿Quién responde WhatsApp? | Ciszuko Antony (soporte directo) |

## 16. Checklist de mantenimiento de contactos

- [ ] URLs de §2 válidas (sin 404, sin duplicados).
- [ ] Mapeo §6 alineado con servicios reales (sin servicios dados de baja).
- [ ] Ninguna credencial/token junto a contactos (gitleaks/secretlint).
- [ ] Configs de webs apuntando a las URLs de este doc.
- [ ] Documento cerrado con revisión y refs vigentes.

## 17. Nomenclatura y formatos de contacto

- **WhatsApp**: formato `https://wa.me/<CódigoPaís><Número>` (ej. `+58` → `584...`), sin `+`, espacios ni guiones.
- **Email**: siempre minúsculas; el corporativo es el único para asuntos formales.
- **Discord**: las invitaciones pueden caducar — revisarlas si el enlace deja de funcionar.
- **Telegram**: `t.me/<handle>`; distinguir canal vs chat personal por el prefijo del handle.

_Última revisión: 13 ago 2026._ Relacionado: `ONLINE_SERVICES_SYSTEM.md`, `VAULT_SYSTEM.md`,
`PROJECTS_SYSTEM.md`, `AGENTS.md`.
