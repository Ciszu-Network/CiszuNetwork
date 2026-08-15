# Directus — stack de preparación

Directus como panel editorial electrónico (headless CMS) sobre el Postgres de
Supabase. Ver `projects/ciszu/docs/documentation/TOOLS_EVALUATION_PLAN.md` §4/§9.4.

## Estado: ⚠️ condicional

Solo levantar si aparecen editores de contenido. Solapa con Supabase Studio;
no genera migraciones del esquema de negocio (las migraciones viven en
`services/supabase/migrations/`).

## Uso

```bash
cp .env.example .env        # rellenar con reales (vault)
docker compose up -d        # levanta en http://localhost:8055
```

## Prerequisitos SQL en Supabase

```sql
CREATE SCHEMA directus;
GRANT USAGE, CREATE ON SCHEMA directus TO directus_user;
```

RLS obligatorio en el schema (ver `SECURITY_PROTOCOLS.md`).