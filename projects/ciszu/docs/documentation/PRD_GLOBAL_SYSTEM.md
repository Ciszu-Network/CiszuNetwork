# Ciszu Network — Product Requirement Document (PRD)

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: PRD_GLOBAL_SYSTEM_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Requisitos de producto de todo el ecosistema.

---


## 1. Vision y objetivo

**Ciszu Network** forma parte del ecosistema de Ciszuko Antony (Francisco Garcia). Objetivo: Ecosistema digital masivo de Ciszuko Antony: 4 webs, un bot de Discord, un juego de musica y paquetes compartidos.

## 2. Audiencia objetivo

- Usuarios del ecosistema (jugadores, fans, clientes de servicios).
- Comunidad de Ciszu Network (Discord, redes).
- Visitantes ocasionales y clientes de soporte.

## 3. Problema que resuelve

- Coordinacion de 4 webs + bot + juego con identidad unica y monetizacion real.
- Ser parte de un ecosistema coherente (marca, auth, anuncios, analiticas).

## 4. Alcance / features

- GLOBAL_ADVISOR
- AD (anuncios)
- STAFF/CUSTOMERS
- AUTH (CISZU ID)
- PAYMENTS
- SEO
- MONITORING

## 5. User stories

- Como visitante quiero navegar y entender la oferta para decidir usar el servicio.
- Como usuario quiero una cuenta unica (CISZU ID) para sincronizar mi experiencia.
- Como jugador quiero partidas justas y recompensas (MuzicMania).
- Como cliente quiero soporte y donar/colaborar con facilidad.

## 6. Criterios de aceptacion

- Todas las paginas cargan sin errores y con SEO basico (robots/sitemap).
- Auth con Cloudflare + Turnstile; cuentas opcionales salvo donde se requiera.
- Anuncios cerrables, flotantes (nunca rompen layout); central solo tras accion.
- GA4 + GTM + AdSense operativos por web.

## 7. Paginas (landing / rutas)

- `/`
- `/about`
- `/contact`
- `/descargas`
- `/faq`
- `/feedback`
- `/guidelines`
- `/policies`
- `/support`
- `/team`
- `/projects/{ciszukoantony,ciszunetwork,discord,minecraft,muzicmania,telegram,whatsapp}`
- `/login`
- `/register`
- `/edit/* (Puck)`
- `/`
- `/about`
- `/certificates`
- `/contact`
- `/descargas`
- `/faq`
- `/feedback`
- `/login`
- `/policies`
- `/projects`
- `/register`
- `/support`
- `/team`
- `/`
- `/comandos`
- `/dashboard`
- `/dashboard/:guildId`
- `/descargas`
- `/estado`
- `/feedback`
- `/login`
- `/privacidad`
- `/register`
- `/soporte`
- `/terminos`
- `/`
- `/play`
- `/leaderboard`
- `/library`
- `/profile`
- `/profile/:id`
- `/profile/settings`
- `/terms`
- `/policy`
- `/rules`
- `/guidelines`
- `/license`
- `/download`
- `/changelog`
- `/faq`
- `/forum`
- `/help`
- `/information`
- `/stats`
- `/support`
- `/team`
- `/credits`
- `/reviews`
- `/fddp2026`

## 8. Roadmap

- Fase 1: landing + marca + auth. Fase 2: features propias (juego, dashboard, etc.).
- Fase 3: monetizacion (anuncios reales + donaciones). Fase 4: compras/suscripciones.

## 9. Metricas

- Trafico (Cloudflare/GA4), engagement (PostHog), ingresos (anuncios/donaciones), NPS/soporte.

---
_Ultima revision: 2026-08-26_. Relacionado: TRD, WORKFLOW, IMPLEMENTATION_PLAN.
