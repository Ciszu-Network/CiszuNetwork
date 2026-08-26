# MuzicMania — Product Requirement Document (PRD)

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: PRD_muzicmania_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Requisitos de producto de MuzicMania.

---


## 1. Vision y objetivo

**MuzicMania** forma parte del ecosistema de Ciszuko Antony (Francisco Garcia). Objetivo: MuzicMania dentro del ecosistema de Ciszu Network.

## 2. Audiencia objetivo

- Usuarios del ecosistema (jugadores, fans, clientes de servicios).
- Comunidad de Ciszu Network (Discord, redes).
- Visitantes ocasionales y clientes de soporte.

## 3. Problema que resuelve

- Dar valor especifico a la audiencia de esta web.
- Ser parte de un ecosistema coherente (marca, auth, anuncios, analiticas).

## 4. Alcance / features

- Juego de ritmo (canvas + hooks)
- Partidas con puntuacion (RPC)
- Leaderboard global
- Libreria de canciones
- Perfiles + settings
- App Tauri + NSIS (Windows)
- Anuncio intrusivo tras partida + recompensa
- Anuncios (Google)
- Auth + Turnstile
- SEO

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
