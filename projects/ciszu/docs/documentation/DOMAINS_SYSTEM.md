# Sistema de Dominios de Ciszu Network

**Documento de plan maestro — investigado: 10 ago 2026**. Se aplica cuando el proyecto sea
sustentable. Aplica a **TODAS las páginas actuales y futuras** de Ciszu Network (las 4 webs
de hoy y cualquier web nueva: blog, docs, status, tienda, etc.).

> ⚠️ **Aclaración importante (creencia común falsa)**: un dominio **NO se compra de por vida ni
> se paga mensual**. Es un **alquiler anual** del nombre. Lo máximo que se puede hacer es
> **prepagar hasta 10 años** (algunos registradores permiten menos, p.ej. Cloudflare solo 1 año
> con renovación automática). Tras el periodo prepagado hay que renovar obligatoriamente o el
> dominio vuelve al mercado.

---

## 1. Estado actual (verificado 10 ago 2026 vía API Vercel)

| Proyecto Vercel         | Dominio actual        | Coste |
| ----------------------- | --------------------- | ----- |
| `ciszunetworkpage`      | `ciszunetwork.vercel.app` | $0 |
| `ciszukoantonypage`     | `ciszukoantony.vercel.app` | $0 |
| `muzicmania`            | `muzicmania.vercel.app` | $0 |
| `ciszubot`              | `ciszubot.vercel.app` | $0 |

Hoy **no pagamos nada**: los subdominios `*.vercel.app` son gratis, incluyen SSL automático y
renovación. El problema: no somos **dueños** del nombre (lo es Vercel) y la URL es larga/fea
para la marca.

## 2. Conceptos clave (3 cosas distintas)

| Concepto   | Qué es                                             | Quién lo da                              |
| ---------- | -------------------------------------------------- | ---------------------------------------- |
| **Registrar** | Vende el derecho de uso del nombre (anual)       | Vercel Domains, Namecheap, Cloudflare, Porkbun |
| **DNS**    | Resuelve `dominio.com` → IP de tu servidor          | Vercel, Cloudflare, el propio registrar |
| **Hosting**| Sirve el contenido de la web                        | Vercel (gratis, Hobby)                   |

Un dominio se compra en el registrar y se **apunta** (nameservers o records) al hosting
(Vercel). Hoy el hosting es gratis y suficiente: comprar dominio NO obliga a pagar Vercel Pro.

Costes fijos adicionales del `.com`: **ICANN fee** (~$0.20/año, lo cobran todos los registrars).
La **privacidad WHOIS** (ocultar tus datos personales en el registro público) es **gratis** en
los 4 registradores comparados.

## 3. Comparativa de registradores (precios verificados 10 ago 2026)

| Criterio | **Vercel Domains** | **Namecheap** | **Cloudflare Registrar** | **Porkbun** |
| --- | --- | --- | --- | --- |
| Precio `.com` 1er año | Precio del registrar (según docs, sin recargo) | **$11.28** (promo 25%); **$6.79** nuevo cliente | **≈ at-cost** (~$10.4–10.7, precio Verisign) | **$11.08** |
| Precio renovación `.com` | Precio del registrar | ⚠️ **$18.48** (+64%) | **igual que compra** (at-cost) | **$11.08** (igual) |
| Precio `.xyz` | Precio del registrar | similar a Porkbun | at-cost | **$2.04** 1er año / **$12.98** renovación |
| Métodos de pago | Tarjeta | Tarjeta, **PayPal**, Bitcoin | ⚠️ **Solo tarjeta** | Tarjeta, **PayPal**, Apple/Google Pay |
| Años prepagables | 1–10 | 1–10 | ⚠️ **Solo 1 año** (renueva solo automáticamente) | 1–10 |
| Extras gratis | Auto-config DNS, renovación auto, WHOIS privacy | WHOIS privacy, DNSSEC, BasicDNS | **DNS + CDN + SSL + WHOIS + DNSSEC** (todo gratis) | WHOIS gratis, SSL, email forwarding, DNSSEC |
| Email con el dominio | ❌ **No ofrece email** | Private Email (de pago) | Email Routing (gratis, requiere DNS en CF) | Email forwarding (gratis) |
| Transferencia fuera | Permitida (después de 60 días) | Permitida (después de 60 días) | Permitida (fácil, es el más transparente) | Permitida |
| Registrante ideal para | Cero configuración, todo en Vercel | Compras con descuento de promo | **Permanencia al coste real** | Pago sin tarjeta, precios estables |

**Descartados**: GoDaddy (renovaciones caras + upsells agresivos), IONOS/Hostinger (renovaciones
abusivas), Google Domains (cerrado, vendido a Squarespace), `.com.ve` (ccTLD de Venezuela con
requisitos de presencia local — no disponible en estos registradores).

## 4. Precios de respaldo (TLD alternativos, Porkbun ago 2026)

| TLD | 1er año | Renovación |
| --- | --- | --- |
| `.net` | $12.52 | $12.52 |
| `.org` | $7.98 | $7.98 |
| `.co` | $15.76 (sale) | $31.20 |
| `.io` | $28.12 (sale) | $51.80 |
| `.app` | $8.75 (sale) | $14.93 |
| `.dev` | $8.75 (sale) | $12.87 |
| `.xyz` | $2.04 | $12.98 |

## 5. Recomendación

**Fase 0 (hoy)**: seguir en `*.vercel.app`. Coste $0. ✔

**Fase 1 (cuando sea sustentable — presupuesto mínimo ~$11/año por dominio):**

- **Opción A — RECOMENDADA: Cloudflare Registrar**. El precio de compra y de **renovación es
  el mismo para siempre** (at-cost, sin margen). Además nos da DNS, CDN, SSL y DNSSEC gratis
  (ya usamos Cloudflare como CDN del bucket Supabase). **Requisito: tarjeta** (no acepta PayPal).
  ⚠️ Solo prepaga 1 año: activar auto-renew en la cuenta.
- **Opción B — si no hay tarjeta (solo PayPal): Porkbun**. $11.08/.com sin subida en renovación,
  WHOIS gratis, ICANN incluido, email forwarding gratis. Mejor que Namecheap porque NC sube a
  **$18.48** en la renovación (+64%).
- **Evitar** Namecheap para renewals (upsell), Vercel Domains solo si quieres cero configuración
  y aceptas el precio del registrar (sin descuentos de promo, y **sin email**).
- **`.com` como principal** + **`.xyz` barato como respaldo** ($2.04 1er año) cuando el `.com`
  esté tomado, o como redirección a marca.

**Presupuestos anuales** (4 webs):

| Escenario | Año 1 | Renovación/año |
| --- | --- | --- |
| Fase 0 (vercel.app) | $0 | $0 |
| Fase 1 mínima (solo `ciszunetwork.com`) | ~$10.5–11.3 | ~$10.5–11.3 (CF/Porkbun) · **$18.48** (Namecheap) |
| Fase 1 completa (4× `.com`) | ~$42–44 | ~$42–44 (CF/Porkbun) · ~$74 (Namecheap) |
| Con respaldos `.xyz` (4×) | +~$8–12 | +~$52 |

## 6. Nombres recomendados (página → principal → respaldo)

| Página | `.com` (principal) | Respaldo `.xyz` | Notas |
| --- | --- | --- | --- |
| Web principal | `ciszunetwork.com` | `ciszunetwork.xyz` | Marca raíz |
| Portfolio | `ciszukoantony.com` | `ciszukoantony.xyz` | Nombre personal del CEO |
| MuzicMania | `muzicmania.com` ⚠️ | `muzicmania.xyz` / `playmuzicmania.com` | El `.com` puede estar tomado (verificar); alternativas: `muzicmania.gg`, `muzicmania.games` |
| CiszuBot | `ciszubot.com` | `ciszubot.xyz` | |
| Futuras (blog, docs, status...) | `blog.ciszunetwork.com`, `docs.ciszunetwork.com`, `status.ciszunetwork.com` | — | **Subdominios, sin compra extra** |

Verificar disponibilidad en el checkout del registrador elegido antes de decidir (Vercel no
guarda historial de búsquedas).

## 7. Implementación paso a paso (cuando se active)

1. **Comprar** en el registrador elegido con registrante **Ciszu Network** (no personal),
   auto-renew ON desde el inicio.
2. **DNS — dos caminos**:
   - **a) Nameservers de Vercel** (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`) → Vercel gestiona
     todo (recomendado: todo el hosting ya vive en Vercel). Aplicar en el registrar.
   - **b) Mantener DNS en Cloudflare** (si el dominio vive en CF Registrar) y añadir records:
     apex `A → 76.76.21.21`, `www → CNAME cname.vercel-dns.com` (Vercel los sugiere al añadir
     el dominio).
3. **Añadir el dominio al proyecto**: Settings → Domains → Add (`apex` + `www`). Vercel emite
   SSL automáticamente (Let's Encrypt/ZeroSSL) y sugiere redirección `www ↔ raíz`.
4. **Redirecciones (301 permanentes para SEO)**:
   - `www` ↔ raíz: elegir canónico y redirigir (lo sugiere Vercel al añadir el apex).
   - `*.vercel.app` → dominio: en Settings → Domains el alias `.vercel.app` se puede marcar
     "Redirect to" el dominio propio.
   - `.xyz` → `.com`: si se compran ambos, apuntar el `.xyz` al mismo proyecto y añadir en su
     `vercel.json`:
     ```json
     { "redirects": [{ "source": "/:path*", "destination": "https://dominio.com/:path*", "permanent": true }] }
     ```
5. **Verificar**: `nslookup dominio.com`, HTTPS en navegador, `curl -I` en las redirecciones.
6. **Email @dominio**: Cloudflare Email Routing (gratis) si el DNS está en CF; alternativa:
   Resend.com para emails transaccionales (ver ítem #2 del toDo — emails). Configurar
   **SPF + DKIM + DMARC** (Vercel no da email). ➜ Sistema completo de servicios Cloudflare
   (gratis/pago/descartados): **`CLOUDFLARE_SYSTEM.md`**.
7. **Seguridad final**: auto-renew ON, registrar lock ON, DNSSEC ON (CF/Porkbun/NC lo soportan),
   WHOIS privacy ON, 2FA en la cuenta del registrador, anotar fechas de renovación en el
   calendario y exportar/backup de la zona DNS.

## 8. Checklist de activación

- [ ] El proyecto genera ingresos estables o decisión de marca firme
- [ ] Registrador elegido (recomendado: **Cloudflare Registrar** con tarjeta; si no, **Porkbun** vía PayPal)
- [ ] Disponibilidad de los 4 nombres verificada
- [ ] Compra con registrante **Ciszu Network** + auto-renew ON
- [ ] DNS → nameservers Vercel (o records en Cloudflare)
- [ ] Dominio añadido a los 4 proyectos Vercel + redirecciones `vercel.app`/`.xyz` → dominio
- [ ] Email routing + SPF/DKIM/DMARC
- [ ] DNSSEC + lock + 2FA + calendario de renovaciones
- [ ] Actualizar AGENTS.md y este documento con fecha real de compra y costes
