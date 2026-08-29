# IMPLEMENTATION_PLAN_PROTOCOLS — Plan de Implementación (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: IMPLEMENTATION_PLAN_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Plan de implementación fase a fase para la landing web de CiszuGamens, con hitos, responsables y criterios de aceptación.

## 1. Fases y cronograma

| Fase | Duración | Hito | Estado |
|---|---|---|---|
| **Fase 0: Preparación** | 1 semana | Repo listo, configs base | ✅ Completado |
| **Fase 1: Landing Core** | 2 semanas | Landing funcional + deploy | 🚧 Pendiente |
| **Fase 2: Integración Ecosistema** | 1 semana | Ads, Analytics, CDN, SEO | 🚧 Pendiente |
| **Fase 3: Discord Integration** | 1 semana | Widget stats, OAuth prep | 🚧 Pendiente |
| **Fase 4: Pulido y Launch** | 1 semana | Lighthouse ≥ 90, DNS, monitoring | 🚧 Pendiente |
| **Fase 5: Post-Launch** | Continuo | Iteración, dashboard admin (opcional) | ⏳ Futuro |

**Total estimado**: 6 semanas (MVP)

## 2. Fase 0: Preparación (Completado)

- [x] Estructura `projects/ciszugamens/` creada
- [x] Assets recuperados y organizados (5 logos + 1 banner + docs)
- [x] `.gitignore` limpio (sin entradas legacy)
- [x] Documentación base creada (`docs/documentation/`)
- [x] `README.md` proyecto
- [x] `package.json` workspace config (pendiente en web)

## 3. Fase 1: Landing Core (2 sem)

### Sprint 1.1 - Setup Next.js (3 días)
- [ ] `pnpm create next-app@latest projects/ciszugamens/website --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] Configurar `tsconfig.json` (strict, paths `@/*`)
- [ ] Configurar `tailwind.config.ts` (tokens `@ciszu/ui`)
- [ ] Configurar `next.config.js` (images, headers, CSP)
- [ ] `middleware.ts` (security headers)
- [ ] `instrumentation.ts` + Sentry config

### Sprint 1.2 - Layout y Providers (3 días)
- [ ] `app/layout.tsx`: `Providers` (Theme, Toast, Ads), metadata base
- [ ] `app/globals.css`: Tailwind + tokens globales (`@ciszu/ui`)
- [ ] `ThemeProvider` (next-themes, dark mode forced)
- [ ] `AdsProvider site="ciszugamens"` + `AdFloat` + `AdPill`
- [ ] `GoogleScripts` (GTM + GA4 + AdSense)

### Sprint 1.3 - Componentes Landing (5 días)
- [ ] `Hero`: Video banner GIF + overlay + CTA Discord
- [ ] `Features`: 3 cards (Comunidad, Torneos, Rankings)
- [ ] `StatsBar`: Contadores (miembros, online, torneos/mes)
- [ ] `Events`: Próximos torneos (static JSON → API futura)
- [ ] `CTASection`: Botón "Unirse al servidor" + invite
- [ ] `Footer`: Links ecosistema, legal, social
- [ ] Responsive: mobile/tablet/desktop

### Sprint 1.4 - SEO y Deploy (4 días)
- [ ] `metadata` export en `layout.tsx` + `page.tsx`
- [ ] `robots.ts` (Allow /, Disallow /api/)
- [ ] `sitemap.ts` (URLs estáticas)
- [ ] Open Graph + Twitter Card (video banner)
- [ ] JSON-LD Organization + WebSite
- [ ] Proyecto Vercel `ciszugamens` + Root Directory config
- [ ] Deploy preview + production
- [ ] DNS: `ciszugamens.vercel.app` (o dominio propio)

## 4. Fase 2: Integración Ecosistema (1 sem)

| Tarea | Detalle | Criterio |
|---|---|---|
| Ads System | `AdsProvider site="ciszugamens"` + `AdFloat` corner + `AdPill` body | Anuncios rotan, countdown visible |
| GA4/GTM | `GoogleScripts` en `<head>` + `GoogleAnalytics` client | `page_view`, `click_discord_invite` en GA4 |
| AdSense | `NEXT_PUBLIC_ADSENSE_CLIENT` + verificación | Estado "Listo" en AdSense |
| CDN Assets | `pnpm cdn:upload` → logos/banner cargan | `NEXT_PUBLIC_CDN_URL` resuelve assets |
| Security | CSP, HSTS, headers en `middleware.ts` | `securityheaders.com` = A+ |

## 5. Fase 3: Discord Integration (1 sem)

| Tarea | Detalle |
|---|---|
| Widget miembros | API Discord → `memberCount`, `onlineCount` (cache 5min) |
| Invite button | `https://discord.gg/W3kMtMMj6E` (tracking GA4) |
| OAuth prep | Config `next-auth` Discord provider (para dashboard futuro) |
| Webhook anuncios | `GLOBAL_ADVISOR_SYSTEM` → webhook `#anuncios` |

## 6. Fase 4: Pulido y Launch (1 sem)

| Checklist | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 90 |
| Lighthouse SEO | ≥ 90 |
| Core Web Vitals (field) | LCP < 2.5s, CLS < 0.1, TBT < 200ms |
| Bundle JS | < 150KB gz |
| Security Headers | `securityheaders.com` = A+ |
| DNS + SSL | `ciszugamens.vercel.app` verde |

## 7. Fase 5: Post-Launch (Continuo)

| Área | Acciones |
|---|---|
| **Analytics** | Revisar GA4 semanal: CTR Discord, scroll depth, bounce |
| **Ads** | Ajustar catálogo `ciszugamens` en Ads.tsx (rotación, placeholders) |
| **SEO** | Search Console: sitemap, indexing, queries |
| **Discord** | Eventos en landing ↔ anuncios en `#anuncios` sincronizados |
| **Dashboard Admin (opcional)** | NextAuth Discord + CRUD events/moderación |

## 8. Riesgos y mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Video banner pesado (9.7MB GIF) | Alta | Performance | Convertir a WebM/MP4 + `<video>` + poster; lazy-load |
| Discord widget rate limit | Media | Stats no cargan | Cache 5min + fallback estático |
| AdSense rechazado | Media | Sin monetización | Enfocar en anuncios propios (ecosistema) |
| DNS/SSL issues | Baja | Sitio inaccesible | Verificar en staging antes de prod |

## 9. Responsables

| Rol | Responsable |
|---|---|
| **Tech Lead / Dev** | Ciszuko Antony (CEO) / Agente IA |
| **Diseño / Assets** | Ciszuko Antony |
| **Discord Admin** | Equipo moderación |
| **Deploy / Vercel** | Ciszuko Antony |
| **QA / Testing** | Agente IA + Ciszuko Antony |

## 10. Definition of Done (por fase)

| Fase | DoD |
|---|---|
| **Fase 1** | Landing accesible en preview Vercel, todos los componentes renderizan, responsive OK |
| **Fase 2** | GA4/GTM/AdSense activos, Ads rotando, CSP A+, CDN assets cargan |
| **Fase 3** | Stats Discord visibles, invite trackeado, webhook funcional |
| **Fase 4** | Lighthouse ≥ 90 todo, DNS live, monitoring alertas |
| **Fase 5** | Dashboard admin (si procede), iteración continua |

---

_Última revisión: 29 ago 2026._