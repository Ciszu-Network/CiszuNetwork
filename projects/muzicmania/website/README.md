# MuzicMania - Web Rhythm Portal (Private Repo)

Bienvenido a **MuzicMania 2.0**.
Este es el repositorio privado del juego, migrado a una arquitectura Full-Stack con **Next.js 15, Tailwind CSS v4 y Supabase**.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 15 (React), TypeScript, Tailwind CSS v4.
- **Backend & Base de Datos**: Supabase (Postgres, RPC, RLS).
- **Desktop (Futuro)**: Tauri.
- **Package Manager**: pnpm.

## 🚀 Inicio Rápido (Desarrollo Local)

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Ejecutar servidor de desarrollo:
   ```bash
   pnpm run dev
   ```

3. (Solo Administradores) Sincronizar Base de Datos Local:
   ```bash
   npx supabase link --project-ref <tu_project_id>
   npx supabase db push
   ```

*Nota: La documentación interna y de agentes IA se encuentra en la carpeta `/supabase/ia/ia_docs/`.*
