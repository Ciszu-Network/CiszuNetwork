# 🚀 Guía de Handover y Migración — Ciszu Network

Este documento asegura una transición impecable entre agentes de IA que trabajan en el monorepo.

## 📌 Datos Generales

- **Monorepo:** Ciszu Network
- **Creador:** Ciszuko Antony (Francisco Garcia)
- **Directorio:** `E:\Ciszu Network`
- **Stack:** Next.js 15 + TypeScript + Tailwind CSS v4 + Supabase + Tauri 2 + pnpm + Turborepo
- **OS:** Windows (PowerShell 5.1)
- **Package Manager:** pnpm 10.8.1
- **Node:** 24.18.0
- **Python:** 3.14

## 📂 Archivos Críticos

### Documentación para IA (root docs/ia_docs/)
- `AGENT_INSTRUCTIONS.md` — Reglas y protocolos para agentes IA
- `AGENT_SECURITY_PROTOCOLS.md` — Seguridad: supply chain, XSS, secrets, RLS
- `ARCHITECTURE.md` — Estructura completa del monorepo
- `INITIAL_PROMPT.md` — Prompt inicial del agente
- `MIGRATION_HANDOVER.md` — Este archivo
- `PROJECT_HISTORY.md` — Historial cronológico de cambios
- `PROJECT_STATE.md` — Estado actual detallado de todo el monorepo
- `PROJECTS.md` — Vista general de todos los proyectos
- `STACK.md` — Stack tecnológico completo
- `STATUS.md` — Tabla resumen de estados
- `TO_DO_LIST.md` — Tareas pendientes (solo edita Ciszuko Antony)
- `WORKFLOW.md` — Flujo de trabajo y comandos

### Reglas Globales
- `AGENTS.md` (raíz del monorepo) — Instrucciones generales para agentes IA

## ✅ Protocolo de Inicio de Sesión

1. **Leer** `INITIAL_PROMPT.md` para contexto y conducta esperada
2. **Leer** `STATUS.md` y `PROJECT_STATE.md` para estado actual
3. **Leer** `TO_DO_LIST.md` para prioridades inmediatas
4. **Confirmar** disponibilidad en 1 línea: "CISZU AI listo. [proveedor/modelo]."

## ✅ Protocolo de Cierre de Sesión

1. **Actualizar** `PROJECT_HISTORY.md` con cambios realizados
2. **Actualizar** `PROJECT_STATE.md` si el estado general cambió
3. **Actualizar** `STATUS.md` con nuevo resumen
4. **No hacer commit** sin solicitud explícita del usuario

## ⚡ Comandos Esenciales

```bash
pnpm install                                        # Instalar todo
pnpm dev                                            # Dev todos los proyectos
pnpm build                                          # Build todos
pnpm lint                                           # Lint todos
pnpm --filter <nombre> dev                          # Proyecto individual
node scripts/txt2md.js <docs-path>                  # TXT → MD
node scripts/md2office.js <docs-path>               # MD → DOCX
python scripts/txt2pdf.py <docs-path>               # MD → PDF
```

## ⚠️ Limitaciones Conocidas

1. **Push a GitHub**: No funciona desde esta máquina (DNS bloquea github.com)
2. **PDF engine**: WeasyPrint requiere GTK DLLs no instaladas
3. **Word COM**: Se cuelga al intentar convertir DOCX → PDF automáticamente
4. **No hacer commit** sin que el usuario lo solicite

## 📝 Notas de Agencia Anterior

(Sin sesiones previas registradas — v2.0.0 es la primera versión completa de documentación)