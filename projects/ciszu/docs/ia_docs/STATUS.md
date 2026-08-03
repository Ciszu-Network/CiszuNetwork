# STATUS - CISZU NETWORK

## Estado actual del monorepo

### Resumen General (v2.0.0)

| Proyecto | Website | App | Docs | ia_docs | public/docs/ |
|---|---|---|---|---|---|
| CiszuNetwork Page | ✅ Activo | — | ✅ Completo | ✅ 12 archivos | ✅ |
| Ciszuko Antony Portfolio | ✅ Activo | — | ✅ Completo | ✅ 11 archivos | ✅ |
| MuzicMania | ✅ Activo | ✅ Tauri | ✅ Completo | ✅ 19 archivos | ✅ |
| CiszuBot | ✅ Activo | ⚠️ Pendiente | ✅ Completo | ✅ 11 archivos | ✅ |
| CiszuGamens | — | — | ✅ Completo | ✅ 4 archivos | — |
| @ciszunetwork/cdn | — | ✅ Activo | — | — | — |

### Documentación

| Formato | Root docs | ciszubot | ciszukoantony | muzicmania | ciszugamens |
|---|---|---|---|---|---|
| TXT | 17 | 18 | 16 | 22 | 17 |
| MD | 17 | 18 | 16 | 22 | 18 |
| DOCX | 14+3esp | 14+3esp+2shig | 14+3esp | 16 | 14+4esp |
| PDF | 14+3esp | 14+3esp+2shig | 14+3esp | 16 | 14+4esp |
| ia_docs | 12 | 11 | 11 | 19 | 4 |

(+3esp = GUIDELINES+RULES+ACTA manuales; +2shig = Shigamens Server docs)

### Scripts de Automatización
| Script | Función | Estado |
|---|---|---|
| scripts/txt2md.js | TXT → MD | ✅ |
| scripts/md2office.js | MD → DOCX | ✅ (PDF falla) |
| scripts/txt2pdf.py | MD → PDF | ✅ |
| scripts/docx2pdf.ps1 | DOCX → PDF | ⚠️ Word COM hangs |
| scripts/sync-public-docs.js | docs/ → public/docs/ | ✅ |

### CDN Migration (Nuevo)
| Paso | Estado |
|---|---|
| Documento CDN_MIGRATION_PLAN | ✅ Creado (txt, md, docx, pdf) |
| Inventario de assets | ⏳ Pendiente |
| Subida a Supabase Storage | ⏳ Pendiente |
| Migración de código | ⏳ Pendiente |
| Limpieza de repo | ⏳ Pendiente |

### Pendientes Críticos
1. CDN: Subir assets multimedia a Supabase Storage y migrar referencias en código
2. GUIDELINES/RULES/ACTA en DOCX/PDF requieren composición manual
3. Bot de Discord (projects/ciszubot/discord-bot/) en desarrollo
4. Assets multimedia sin subir a Supabase Storage
5. MuzicMania mobile placeholder vacío
6. Turbomonorepo: Centralizar configs y unificar build pipeline
7. Centralizar esquemas de Supabase DB

### Stack Tecnológico
- **Monorepo**: pnpm 10.8.1 + Turborepo
- **Web**: Next.js 15 + TypeScript 6 + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Desktop**: Tauri 2 (Rust + WebView2)
- **Bot**: Discord.js v14 (projects/ciszubot/discord-bot/)
- **CI/CD**: GitHub Actions + Vercel
- **Docs**: Pandoc 3.10 + Reportlab (Python)

### Herramientas Instaladas
- Node.js 24.18.0
- Python 3.14
- Pandoc 3.10
- Reportlab 5.0.0
- WeasyPrint 69.0 (requiere GTK DLLs)
- PowerShell 5.1

ÚLTIMA ACTUALIZACIÓN: 2026-07-28