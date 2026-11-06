# STORE_ECONOMY_PLAN — Tienda, MuziPoints y economía de MuzicMania

**Versión:** 1.0
**Actualización:** 4 de noviembre de 2026
**Identificador:** STORE_ECONOMY_PLAN
**Definición:** diseño de la tienda, la moneda virtual cerrada MuziPoints (MZP), el ledger de movimientos, las compras con proveedor, las recompensas, los regalos, las donaciones a creadores y el programa de creadores de MuzicMania.

---

## 1. Contexto

MuzicMania ya cuenta con cuentas, perfiles, badges, niveles personalizados, publicación de niveles, likes de niveles, multijugador y chat. La tienda aparece hoy bloqueada en el hub de `/play` y no existe una economía real.

Este plan implementa una economía **cerrada**: los MuziPoints solo se compran, se ganan, se gastan, se regalan o se donan dentro de MuzicMania. **No se convierten en dinero real ni se retiran.** El objetivo es monetizar cosméticos y apoyar a creadores sin paywalls ni ventajas competitivas.

Decisiones aprobadas con Ciszuko Antony:

1. Los pagos con cripto se activan ahora mediante NOWPayments.
2. Las tarjetas y PayPal existirán en la tienda, pero permanecerán bloqueadas por feature flag hasta que exista un proveedor aprobado y mayoría de edad.
3. La verificación 18+ es autodeclarada, con bloqueo del lado del servidor y registro de aceptación de términos.
4. Los creadores reciben MZP de uso interno, sin retiro ni conversión a dinero.
5. El ledger será append-only con claves de idempotencia y saldo materializado.

## 2. Restricciones y no objetivos

### 2.1 Restricciones

- El dueño del ecosistema es menor de 18 años. PayPal está desactivado y Lemon Squeezy/Stripe no están disponibles en esta fase.
- NOWPayments es el único riel de pago activo.
- El repo es público: no se guardan claves, tokens ni URLs con credenciales en docs, código o migraciones.
- Los pagos reales no pueden depender del estado del cliente: el webhook firmado es la única fuente de verdad.
- `TODO.md` no se edita sin permiso explícito de Ciszuko Antony.
- Las skins actualmente gratuitas no se bloquean retroactivamente. Las skins premium son nuevas.

### 2.2 No objetivos de esta fase

- Retiro de MZP a dinero, transferencias bancarias o pagos a creadores.
- KYC documental.
- Compra con tarjeta de crédito o PayPal activa.
- Reembolsos automáticos.
- Mercado secundario de ítems.
- Loot boxes, apuestas o cajas con probabilidad.
- Ventajas de gameplay pagadas.

## 3. Moneda y contabilidad

### 3.1 Identidad de la moneda

- Nombre visible: **MuziPoints**.
- Símbolo corto: **MZP**.
- Tipo: moneda virtual cerrada, sin valor monetario externo, sin retiro.
- Unidad mínima: 1 MZP. Todos los montos son enteros.
- Los MZP no caducan.
- Los MZP no generan intereses ni rendimientos.

### 3.2 Wallet y ledger

El saldo materializado vive en `muzicmania.wallets`. Cada movimiento vive en `muzicmania.point_ledger`. El ledger es la fuente de auditoría; la wallet es la lectura rápida.

`wallets`:

| Columna | Tipo | Regla |
|---|---|---|
| `user_id` | uuid | PK, FK `auth.users` |
| `points` | bigint | saldo actual, `>= 0` |
| `lifetime_earned` | bigint | total acreditado |
| `lifetime_spent` | bigint | total debitado |
| `updated_at` | timestamptz | actualización automática |

`point_ledger`:

| Columna | Tipo | Regla |
|---|---|---|
| `id` | bigint identity | PK |
| `user_id` | uuid | dueño del movimiento |
| `delta` | bigint | positivo o negativo, distinto de 0 |
| `balance_after` | bigint | saldo resultante |
| `reason` | text | motivo enumerado |
| `reference_type` | text | `order`, `level`, `task`, `gift`, `donation`, `item`, `admin` |
| `reference_id` | text | id externo o interno |
| `idempotency_key` | text | único global |
| `metadata` | jsonb | datos de auditoría |
| `created_at` | timestamptz | fecha del movimiento |

Motivos iniciales: `purchase`, `daily_login`, `task_reward`, `level_upload`, `level_like`, `gift_in`, `gift_out`, `donation_in`, `donation_out`, `creator_code`, `shop_item`, `admin_adjustment`.

### 3.3 Reglas del ledger

1. Ningún endpoint escribe saldo directamente. Todo pasa por `muzicmania.wallet_apply`.
2. `wallet_apply` bloquea la wallet con `FOR UPDATE`, valida saldo y registra el movimiento en la misma transacción.
3. Si la clave de idempotencia ya existe, devuelve el saldo actual sin volver a aplicarlo.
4. Un movimiento con delta negativo nunca puede dejar `points < 0`.
5. Las transferencias internas usan dos asientos con el mismo `transfer_id` en metadata y claves de idempotencia derivadas.
6. La función se ejecuta como `SECURITY INVOKER`, con `EXECUTE` revocado a `PUBLIC`, `anon` y `authenticated`; solo `service_role` la invoca desde el servidor.
7. Los ajustes manuales de staff usan `admin_adjustment`, quedan auditados y requieren rol autorizado.

### 3.4 Experiencia (XP)

La XP no es gastable y no se mezcla con MZP.

- `xp_ledger`: `user_id`, `amount`, `reason`, `idempotency_key` único, `created_at`.
- `award_xp` actualiza `muzicmania.profiles.xp` y calcula `level`.
- Fórmula inicial: `level = greatest(1, floor(sqrt(xp / 100)) + 1)`.
- La XP se gana con login diario, tareas, partidas completadas, niveles publicados y logros.
- La XP no se puede comprar.

## 4. Edad y términos

### 4.1 Fuente de edad

`muzicmania.profiles.birth_date` ya existe y se captura en el registro. El servidor calcula la edad con fecha UTC.

Se añaden a `profiles`:

- `purchase_terms_version` text.
- `purchase_terms_accepted_at` timestamptz.
- `birth_date_locked_at` timestamptz.
- `adult_confirmed_at` timestamptz.

### 4.2 Reglas

1. Comprar MZP, regalar MZP/ítems y activar un código de creador requiere 18+.
2. La primera compra/regalo registra `adult_confirmed_at`, la versión de términos y bloquea `birth_date`.
3. Un trigger impide cambiar `birth_date` después de `birth_date_locked_at`.
4. Si falta `birth_date`, la UI pide completarla antes de comprar; no se puede inventar una fecha desde el endpoint de pago.
5. Ser menor no bloquea jugar, ganar MZP, recibir donaciones ni usar la tienda con MZP ganados, salvo que una norma legal exija otra cosa.
6. Las cuentas 18+ deben tener email verificado para comprar o regalar.
7. Los términos de tienda explican: moneda virtual sin retiro, compras finales, licencia de uso de cosméticos, prohibición de fraude y límites de regalo.

### 4.3 Límites antifraude iniciales

Configurables en `economy_config`:

- Regalos: máximo 5.000 MZP por día natural UTC.
- Donaciones: máximo 10.000 MZP por día natural UTC.
- Cuenta mínima para regalar: 7 días desde el registro.
- No se permite regalar a uno mismo.
- No se permite donar a un nivel propio.
- Las cuentas con menos de 7 días o sin email verificado no pueden regalar.

## 5. Catálogo y paquetes

### 5.1 Paquetes iniciales

Los precios son configurables desde base de datos. La primera carga propone:

| Slug | MZP base | Bonus | Precio USD | Etiqueta |
|---|---:|---:|---:|---|
| `starter` | 200 | 0 | 1,99 | Inicio |
| `popular` | 600 | 30 | 4,99 | Popular |
| `pro` | 1.300 | 100 | 9,99 | Mejor valor |
| `elite` | 2.800 | 300 | 19,99 | Élite |
| `legend` | 7.500 | 1.000 | 49,99 | Leyenda |
| `mythic` | 16.000 | 2.500 | 99,99 | Mítico |

Reglas:

- El bonus se suma al saldo del comprador.
- El precio se muestra en USD; la pasarela muestra la moneda cripto elegida.
- El código de creador se calcula sobre los MZP base, no sobre el bonus.
- Los precios no incluyen impuestos locales cuando el proveedor los gestione; NOWPayments no gestiona impuestos.

### 5.2 Catálogo de cosméticos

Categorías iniciales:

- `arrow_skin`: skins de flechas.
- `particle_skin`: efectos de partículas.
- `profile_banner`: banners de perfil.
- `title`: títulos de perfil.
- `bundle`: paquete de varios ítems.

Cada ítem tiene slug, nombre, descripción, rareza, precio en MZP, `asset_key`, disponibilidad y estado. Los ítems existentes que hoy son gratis conservan su acceso; los nuevos se venden.

Rarezas y precios orientativos:

| Rareza | Precio MZP |
|---|---:|
| Común | 200–400 |
| Raro | 600–900 |
| Épico | 1.200–1.800 |
| Legendario | 2.500–4.000 |

### 5.3 Inventario y equipamiento

- `user_inventory` guarda propiedad por usuario e ítem.
- Un ítem comprado no se puede volver a comprar.
- `equipped_slot` permite un solo ítem equipado por categoría.
- El equipamiento se valida contra inventario; el cliente no puede equipar un ítem que no posee.
- Las skins gratuitas actuales se consideran propiedad base y no requieren fila de inventario.

## 6. Pagos

### 6.1 Proveedores y flags

Variables de entorno:

- `PAYMENTS_CRYPTO_ENABLED` — activo en fase 1.
- `PAYMENTS_CARD_ENABLED` — desactivado hasta los 18/proveedor.
- `PAYMENTS_PAYPAL_ENABLED` — desactivado hasta los 18/proveedor.
- `NOWPAYMENTS_API_KEY`.
- `NOWPAYMENTS_IPN_SECRET`.
- `MUZICMANIA_PUBLIC_URL`.

La UI muestra tarjeta/PayPal como “Próximamente” cuando el flag está apagado. Nunca simula un cobro ni marca una orden como pagada sin webhook.

### 6.2 Flujo cripto

1. El usuario 18+ elige un paquete y un código de creador opcional.
2. `POST /api/payments/invoice` crea una orden local `pending` y una invoice en NOWPayments.
3. La orden guarda `provider_order_id`, precio, MZP base y bonus.
4. El usuario es redirigido al checkout de NOWPayments.
5. NOWPayments llama a `POST /api/webhooks/nowpayments` con el cuerpo crudo firmado.
6. El servidor valida HMAC-SHA512 en tiempo constante, estado, importe, moneda y orden.
7. Si todo coincide, `fulfill_points_order` marca la orden como `fulfilled` y acredita MZP una sola vez.
8. Si el importe no coincide, la orden queda `failed` o `review`; no se acredita nada.
9. La UI consulta `GET /api/payments/order/[id]` y muestra el estado.

### 6.3 Idempotencia y auditoría

- `pagos.orders` tiene `provider_order_id` único y `idempotency_key` único.
- `pagos.webhook_events` guarda `provider`, `event_id`, payload y resultado; `unique(provider, event_id)`.
- Repetir un webhook no duplica MZP.
- Reenviar una invoice no crea una segunda orden para la misma compra.
- Los logs nunca incluyen claves ni payloads con datos sensibles completos.

### 6.4 Tarjetas y PayPal futuros

Cuando exista proveedor aprobado:

- Lemon Squeezy como Merchant of Record para tarjetas/PayPal, o Stripe si se constituye LLC.
- La orden local y el ledger no cambian; solo cambia el adaptador del proveedor.
- Se activan los flags y se añade KYC/reembolsos según contrato.
- No se promete una fecha en la UI.

## 7. Recompensas y retención

### 7.1 Login diario

- Tabla `daily_streaks`: `user_id`, `last_claim_date`, `streak`, `longest_streak`.
- Un claim por día UTC.
- Día 1: 10 MZP; días 2–6 progresivos; día 7: 60 MZP; cada 30 días: 150 MZP.
- La XP se suma aparte.
- El claim es idempotente por `user_id + date`.
- Si se pierde un día, la racha vuelve a 1.

### 7.2 Tareas

Tabla `tasks` con cadencia `daily` o `weekly`, métrica, objetivo, MZP y XP. Tabla `task_progress` por usuario y periodo.

Tareas iniciales:

| Tarea | Cadencia | Objetivo | MZP | XP |
|---|---|---:|---:|---:|
| Entrar al juego | diaria | 1 login | 10 | 5 |
| Jugar una partida | diaria | 1 partida validada | 20 | 10 |
| Dar like a un nivel | diaria | 1 like nuevo | 10 | 5 |
| Jugar multijugador | semanal | 3 partidas | 60 | 30 |
| Publicar un nivel | semanal | 1 nivel publicado | 80 | 40 |
| Apoyar a un creador | semanal | 1 donación | 30 | 15 |

Reglas:

- Las tareas se validan en el servidor; el cliente no puede reclamar progreso arbitrario.
- Los likes se registran una vez por usuario y nivel; quitar y volver a dar like no vuelve a pagar.
- Las partidas se validan con el flujo de score/anticheat existente.
- Reclamar una tarea usa `wallet_apply` y `award_xp` con claves idempotentes.

### 7.3 Creación y curación de niveles

- Nivel publicado por primera vez: 100 MZP una vez por nivel, solo si pasa la validación mínima.
- Like recibido en un nivel: 2 MZP al creador, máximo 200 MZP por nivel.
- Los MZP por creación son deliberadamente bajos frente a la compra.
- No se paga por plays para evitar farming; los plays solo dan XP.
- Un creador no puede auto-likear su nivel.
- Niveles archivados o eliminados dejan de generar recompensas nuevas; lo ya acreditado no se revierte salvo fraude comprobado.

## 8. Regalos y donaciones

### 8.1 Regalos

- Regalar MZP o un ítem del inventario.
- Requiere 18+ en emisor y receptor.
- Requiere email verificado y cuenta con antigüedad mínima.
- No se permite auto-regalo.
- El receptor recibe una notificación en el `SocialHub`.
- Los ítems regalados salen del inventario del emisor y entran al del receptor.
- Los ítems equipados se desequipan antes de transferirse.
- Límite diario configurable.

### 8.2 Donaciones a creadores

- Donar MZP a un nivel publicado.
- El creador es el dueño del nivel; no se permite donar a uno mismo.
- El 100% de lo donado llega al creador; no hay comisión en esta fase.
- La donación deja un mensaje opcional y una entrada en el perfil del nivel.
- El creador puede usar los MZP en la tienda, regalarlos o donarlos.
- No hay retiro ni conversión a dinero.

### 8.3 Código de creador

- Cada creador aprobado tiene un código único.
- Se aplica al comprar un paquete de MZP.
- El creador recibe un porcentaje configurable de los MZP base comprados.
- Porcentaje inicial: 5%.
- El comprador no recibe bonus extra en la primera versión.
- El uso queda registrado por orden; una orden paga una sola vez.
- El código no se aplica a compras con MZP ganados ni a donaciones.
- El programa no convierte MZP en dinero.

## 9. Experiencia de usuario

### 9.1 Hub de `/play`

- Desbloquear `TIENDA` cuando el usuario tenga sesión.
- Añadir chip de saldo MZP en la tienda y en el perfil.
- Mantener `HISTORIA` y `EVENTOS` bloqueados.
- Añadir acceso a `INVENTARIO` y `MISIONES` dentro de la tienda.

### 9.2 Tienda

Pestañas:

1. **Destacados**: paquetes y ofertas.
2. **Cosméticos**: filtros por categoría, rareza y precio.
3. **Inventario**: ítems propios, equipar/desequipar.
4. **Misiones**: login, tareas diarias y semanales.
5. **Creadores**: código, donaciones recibidas y niveles.

Flujo de compra de MZP:

1. Elegir paquete.
2. Ver precio, MZP base y bonus.
3. Código de creador opcional.
4. Aceptar términos si es la primera compra.
5. Elegir cripto en NOWPayments.
6. Polling de orden y confirmación.

Flujo de compra de cosmético:

1. Ver precio y saldo.
2. Confirmar.
3. Descontar MZP y añadir al inventario.
4. Equipar o seguir comprando.

### 9.3 Regalos y donaciones

- Botón “Regalar” en perfil/inventario.
- Botón “Apoyar creador” en la ficha del nivel.
- Modal con cantidad, mensaje y confirmación.
- Errores claros: saldo insuficiente, límite diario, cuenta no apta, receptor inválido.

### 9.4 Accesibilidad y responsive

- La tienda usa los componentes y tokens existentes de `@ciszu/ui`.
- Funciona a 320 px, 390 px, 768 px y escritorio.
- Los botones de compra tienen estados de loading, disabled y error.
- No se usa `dangerouslySetInnerHTML`.
- La UI no promete entrega instantánea si el webhook aún no confirmó.

## 10. Modelo de datos

### 10.1 Tablas nuevas

- `muzicmania.wallets`
- `muzicmania.point_ledger`
- `muzicmania.xp_ledger`
- `muzicmania.daily_streaks`
- `muzicmania.tasks`
- `muzicmania.task_progress`
- `muzicmania.point_packages`
- `muzicmania.shop_items`
- `muzicmania.user_inventory`
- `muzicmania.point_gifts`
- `muzicmania.item_gifts`
- `muzicmania.creator_donations`
- `muzicmania.custom_level_likes`
- `muzicmania.creator_profiles`
- `muzicmania.creator_codes`
- `muzicmania.creator_code_uses`
- `pagos.orders`
- `pagos.webhook_events`

### 10.2 Tablas existentes que se tocan

- `muzicmania.profiles`: columnas de términos, bloqueo de edad y XP.
- `muzicmania.custom_levels`: contador de likes ya existente; se conecta a `custom_level_likes`.
- `muzicmania.chat_messages`: no se modifica para regalos; las notificaciones usan un canal separado.

### 10.3 Funciones SQL

- `muzicmania.wallet_apply(...)`: movimiento atómico e idempotente.
- `muzicmania.wallet_transfer(...)`: débito y crédito atómicos.
- `muzicmania.award_xp(...)`: XP y nivel.
- `muzicmania.claim_daily(...)`: racha y recompensa.
- `muzicmania.purchase_item(...)`: valida saldo, ítem e inventario.
- `muzicmania.gift_points(...)`: transferencia con reglas.
- `muzicmania.donate_to_creator(...)`: transferencia a dueño del nivel.
- `muzicmania.fulfill_points_order(...)`: acredita una orden pagada una vez.
- `muzicmania.grant_level_like(...)`: like único y recompensa al creador.

Todas las funciones que mueven saldo se ejecutan como `SECURITY INVOKER` desde el servidor con `service_role`; no se exponen a `authenticated` ni a `anon`.

## 11. APIs

### 11.1 Lectura

- `GET /api/economy/me`: wallet, streak, XP, tareas, inventario y límites.
- `GET /api/shop/packages`: paquetes activos.
- `GET /api/shop/items`: catálogo con propiedad/equipado del usuario.
- `GET /api/payments/order/[id]`: estado de una orden propia.

### 11.2 Mutaciones

- `POST /api/economy/daily`: reclamar login diario.
- `POST /api/economy/tasks`: reclamar tarea completada.
- `POST /api/shop/purchase`: comprar cosmético.
- `POST /api/shop/equip`: equipar/desequipar cosmético.
- `POST /api/economy/gift`: regalar MZP o ítem.
- `POST /api/economy/donate`: donar a un nivel.
- `POST /api/payments/invoice`: crear orden/invoice cripto.
- `POST /api/webhooks/nowpayments`: webhook firmado.
- `POST /api/levels/[id]/like`: dar/quitar like a un nivel.
- `POST /api/creators/code`: validar código de creador.

Todas las mutaciones requieren autenticación, rate limit y body validado con Zod. Las compras y transferencias requieren 18+ cuando corresponda.

## 12. Seguridad y RLS

1. RLS activo en todas las tablas nuevas.
2. `wallets`, `point_ledger`, `xp_ledger`, `task_progress`, `user_inventory`, `point_gifts`, `item_gifts`, `creator_donations`: lectura solo del dueño o del creador implicado; escritura solo `service_role`.
3. `pagos.orders`: lectura del comprador; escritura solo `service_role`.
4. `pagos.webhook_events`: sin acceso público; solo `service_role`.
5. `shop_items`, `point_packages`, `tasks`, `creator_profiles`, `creator_codes`: lectura pública solo de filas activas; escritura solo staff.
6. `custom_level_likes`: lectura pública, inserción/eliminación solo del usuario autenticado y sin auto-like.
7. `wallet_apply` y demás RPC: `REVOKE ALL` de `PUBLIC`, `anon`, `authenticated`; `GRANT EXECUTE` solo a `service_role`.
8. Webhook: cuerpo crudo, HMAC-SHA512 timing-safe, validación de monto/moneda/orden, idempotencia.
9. Rate limits: invoice 10/min, webhook 30/min, compras 30/min, regalos 10/min, donaciones 20/min.
10. Nunca confiar en `points`, `price`, `is_adult` ni `provider_status` enviados por el cliente.
11. Los logs no imprimen tokens, emails completos ni payloads de pago.
12. Los ajustes manuales requieren staff autorizado y quedan en el ledger.

## 13. Pruebas y criterios de aceptación

### 13.1 Base de datos

- Dos compras simultáneas no pueden dejar saldo negativo.
- Repetir una clave de idempotencia no duplica el movimiento.
- Una transferencia descuenta al emisor y acredita al receptor en la misma transacción.
- Un like repetido no paga dos veces.
- Un usuario no puede regalar a sí mismo ni donar a su propio nivel.
- Cambiar `birth_date` después de comprar falla.

### 13.2 Pagos

- Firma inválida se rechaza.
- Webhook repetido no duplica MZP.
- Importe menor al de la orden no acredita.
- Orden ajena no se puede leer.
- Con `PAYMENTS_CARD_ENABLED=false` no se puede iniciar tarjeta/PayPal.
- Con `PAYMENTS_CRYPTO_ENABLED=true` se crea invoice y se redirige.

### 13.3 UI

- La tienda carga en móvil y escritorio.
- Usuario no autenticado ve login, no saldo.
- Usuario 18+ puede comprar; menor ve bloqueo.
- Compra de cosmético actualiza saldo e inventario.
- Equipar una skin cambia el juego y persiste.
- Regalo/donación actualizan saldos y notificaciones.
- No se puede comprar dos veces el mismo ítem.

### 13.4 Verificación técnica

- `pnpm --filter muzicmania-website exec tsc --noEmit`.
- `pnpm --filter muzicmania-website build`.
- `pnpm test` para paquetes tocados.
- Pruebas de API con dos cuentas reales de prueba.
- Revisión de advisors de Supabase tras migraciones.

## 14. Fases de entrega

### Fase 1 — Núcleo y tienda cripto

- Migraciones de wallet, ledger, paquetes, ítems, inventario y órdenes.
- RPCs de saldo, compra de ítem y fulfillment.
- APIs de economía, tienda y pago cripto.
- UI de tienda, paquetes, inventario y saldo.
- Gate 18+ y términos.
- Pruebas de idempotencia y webhook.

### Fase 2 — Retención

- Login diario, rachas, tareas, XP y niveles.
- Recompensas por publicar niveles y likes.
- Notificaciones de recompensas.

### Fase 3 — Social

- Regalos de MZP e ítems.
- Donaciones a creadores.
- Código de creador y panel de creador.
- Límites antifraude y auditoría.

### Fase 4 — Tarjetas/PayPal

- Solo cuando exista proveedor aprobado y mayoría de edad.
- Adaptador Lemon Squeezy o Stripe.
- KYC, reembolsos, impuestos y términos actualizados.
- Activar flags y retirar “próximamente”.

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Duplicar MZP por reintentos | Claves de idempotencia + ledger único + webhook único |
| Saldo negativo por concurrencia | `FOR UPDATE` y check `points >= 0` |
| Webhook falso | HMAC SHA512, monto/moneda/orden y origen |
| Menor comprando | Gate server-side con `birth_date` y bloqueo de fecha |
| Farming de likes | Like único por usuario/nivel y tope por nivel |
| Auto-donación | Validación de dueño del nivel |
| Fraude en regalos | 18+, email verificado, antigüedad, límites diarios |
| Economía inflada | Recompensas bajas, precios configurables, topes |
| Incumplimiento legal | Sin retiro, términos, fase tarjetas hasta 18, revisión legal |
| Proveedor caído | Orden pendiente, reintento de webhook, soporte manual auditado |
| Datos de pago expuestos | No guardar tarjetas; solo ids de proveedor y metadatos mínimos |

## 16. Relacionados

- `PAYMENTS_SYSTEM.md` — proveedores, NOWPayments y roadmap por edad.
- `MONETIZATION_PROTOCOLS.md` — reglas de monetización y anuncios.
- `SECURITY_PROTOCOLS.md` — RLS, rate limit y secretos.
- `DB_SYSTEM.md` — migraciones y convenciones.
- `ACCOUNT_SYSTEM.md` — perfiles, cuentas y verificación.
- `AD_SYSTEM.md` — anuncios posteriores a compra.
- `PROJECT_STATE.md` — estado vivo de MuzicMania.
- `TODO.md` — hoja de ruta de Ciszuko Antony.

---

_Última revisión: 4 de noviembre de 2026. Diseño aprobado; Fase 1 implementada y desplegada; fases 2–4 pendientes._
