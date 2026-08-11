# GEOGRAPHIC_CONTEXT — Contexto geográfico (Falcón, Venezuela)

Contexto de dónde opera Ciszuko Network. Como empresa unipersonal registrada en Venezuela, el contexto geográfico afecta fiscos, medios de pago, conectividad y logística.

## Ubicación

- **País**: Venezuela (República Bolivariana de Venezuela).
- **Estado**: **Falcón** — al noroccidente del país, península de Paraguaná, costas del mar Caribe y del golfo de Venezuela. Capital: Coro (declarada Patrimonio Mundial de la Humanidad por la UNESCO, 1993).
- **Huso horario**: UTC−4 (Caracas), sin cambio de hora estacional.

## Implicaciones para la empresa (digital)

- **Medios de pago**: PayPal (internacional), Binance P2P, Zinli, cripto (MetaMask/NOWPayments) — los métodos locales VE condicionados por sanciones/banca (ver `PAYMENTS_SYSTEM.md`).
- **Trámites**: RIF persona natural en SENIAT, registro de marca via SAPI, registro mercantil en SAREN — todo en línea en Fase 0 (ver `COMPANY_REGISTRATION_PLAN.md` + guías `*_GUIDE.md`).
- **Conectividad**: la infra (hosting) vive en la nube (Vercel/Supabase/Cloudflare + GH Actions US-EU), no depende del entorno local; el PC local (E:, Windows) es estación de trabajo, no servidor (el bot 24/7 depende de él hoy — ver `VPS_247.md`).
- **Equipo/insumos**: hardware y periféricos comprados en VE; soporte en español; costos en bolívares con transacciones en divisas USD/BS.

## Zona horaria y agenda

- Todo cron/CI está en **UTC** (pipeline de seguridad 06:00 UTC, DAST lunes 06:30 UTC); convertir a hora local (UTC−4) al planificar (es decir, 02:00/02:30 hora de Caracas).
- La agenda semanal de `SCHEDULE.md` se refiere a hora local de Falcón (UTC−4).

## Ventajas del contexto

- Talento/hispanohablante: comunidad de usuarios del bot y las webs es mayormente de habla hispana (Discord Lounge, Telegram, WhatsApp).
- Música/diseño: influencia cultural latina y costera; la marca neón es universal pero la música y el arte son propios (MuzicMania con tracks propios, mascota neon).
- Internacionalización: 4 webs en inglés + contenido en español (producto bilingüe).

## Datos pragmáticos de referencia

- Conectividad: DSL/fibra local, con DNS del PC intermitente (ver `AGENTS.md` — Resolve-DnsName, VPN activa).
- Certificación digital (Firma electrónica) SENIAT gestionable en Fase 0.

_Última revisión: 11 ago 2026._