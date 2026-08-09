# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

- [ ] Metodologia de pagos: Paypal, Payoner, Ziinli, Stripey, Revolut, Coinbase, Metamask, Binance entre otors.
- [ ] Sistema de emails con SendGrid, Resend o alternativas mejores.
- [ ] Sistema de analiticas con Posthog o alternativas mejores.
- [ ] Sistema de manejo de errores con Sentry o alternativas mejores.
- [ ] Verificar que supabase no este abierto a todo el mundo, con row level securiy
- [ ] Verificar APIS Keys en el frontend global para quitarlas de alli.
- [ ] Agregar rate limiits para endpoints
- [ ] No indexar "staging" publico en buscadores como Google. Autentificar sin datos reales.
- [ ] Sistema de monitoreo extra con UptimeRobot (usado antes para ciszubot)
- [ ] Considerar clerk para autentificacion.
- [x] Considerar otras herramientas de cloudflare. → **Sistema documentado**: `CLOUDFLARE_SISTEMA.md`
- [x] Cloudflare Fase A: Web Analytics (beacon) en las 4 webs → **HECHO 10 ago 2026** (token `2fcf0eab...` en los 4 layouts)
- [x] Cloudflare Fase A: Turnstile en ciszunetwork, ciszukoantony y ciszubot → **HECHO 10 ago 2026** (widget global, `CloudflareGuard` compartido en `packages/ui`, envs Vercel OK)
- [ ] Cloudflare Fase A: rotar widget Turnstile de MuzicMania (secret en git) + quitar fallbacks hardcodeados → **APLAZADO por decisión del usuario** (repo privado; al rotar: regenerar secret, actualizar `.env.local`+Vercel ×4, quitar fallbacks)
- [ ] Cloudflare Fase A: R2 bucket de prueba → **BLOQUEADO** (Cloudflare exige tarjeta de crédito para activar R2)
- [ ] Cloudflare Fase B (con dominio): DNS proxy + WAF/DDoS + Email Routing + Uptime — ver CLOUDFLARE_SISTEMA.md
- [ ] Considerar Pinecone como base de deato de vectores.
