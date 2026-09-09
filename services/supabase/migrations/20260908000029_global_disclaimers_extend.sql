-- ============================================================
-- 20260908000029_global_disclaimers_extend.sql
-- Extiende el sistema de disclaimers globales:
--  1. kind 'basic' (renombra la opción 'beta' por claridad; 'beta' sigue
--     aceptado como alias para filas legacy).
--  2. starts_at (fecha de inicio) para el rango "inicio - culminación" en el
--     contador profesional del DisclaimerStack.
--  3. actions (botones con acciones simples: abrir URL o cerrar el disclaimer).
-- Idempotente.
-- ============================================================

-- 1. Ampliar el CHECK de kind (info | basic | warning; beta legacy).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'global_disclaimers_kind_check'
      AND conrelid = 'ciszunetwork.global_disclaimers'::regclass
  ) THEN
    ALTER TABLE ciszunetwork.global_disclaimers DROP CONSTRAINT global_disclaimers_kind_check;
  END IF;
END $$;

ALTER TABLE ciszunetwork.global_disclaimers
  ADD CONSTRAINT global_disclaimers_kind_check
  CHECK (kind IN ('info', 'basic', 'warning', 'beta'));

-- 2. Fecha de inicio opcional (rango "inicio - culminación").
ALTER TABLE ciszunetwork.global_disclaimers
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;

-- 3. Botones de acción opcionales: [{label, href?, close?}].
ALTER TABLE ciszunetwork.global_disclaimers
  ADD COLUMN IF NOT EXISTS actions JSONB;