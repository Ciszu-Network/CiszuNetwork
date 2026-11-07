# STORE_ECONOMY_PHASE1_IMPLEMENTATION_PLAN — Núcleo, tienda y pagos cripto

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el núcleo de MuziPoints, la tienda de cosméticos, la edad 18+ y la compra cripto con NOWPayments en MuzicMania.

**Architecture:** Migraciones SQL para wallet/ledger/catálogo/órdenes, RPCs atómicas idempotentes ejecutadas solo por `service_role`, APIs Next.js autenticadas y una UI de tienda integrada al hub de `/play`. El cliente nunca escribe saldo; el webhook firmado es la única fuente de verdad de un pago.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind 4, Supabase Postgres, Zod, `@ciszunetwork/utils`, `@ciszunetwork/payments`, NOWPayments, Vitest, Playwright.

**Spec:** `projects/muzicmania/docs/documentation/STORE_ECONOMY_PLAN.md`

> **Estado de ejecución (4 nov 2026):** Fase 1 implementada hasta la task 14. Las migraciones 08 (`purchase_credentials`) y 09 (`fulfill_points_order` acepta `review`) se aplicaron después de las tasks; la edad 18+ se movió a una tabla privada. El flag `PAYMENTS_CRYPTO_ENABLED` sigue desactivado en producción hasta configurar Vercel y validar el flujo de invoice real.

## Global Constraints

- MuziPoints (MZP) es una moneda virtual cerrada; no se retira ni se convierte en dinero.
- Todos los montos son enteros y ninguna wallet puede quedar negativa.
- Comprar MZP, comprar cosméticos con dinero, regalar y usar código de creador requiere 18+ autodeclarado y servidor autoritativo; los cosméticos con MZP ganados quedan disponibles para la cuenta.
- Tarjetas y PayPal no se activan en esta fase; solo NOWPayments cripto.
- Los endpoints mutantes usan autenticación, rate limit y Zod.
- Toda tabla nueva tiene RLS y escritura solo por `service_role` salvo lectura pública de catálogo.
- Las skins actuales (`default`, `shiny`, `minimal`) siguen gratis; las nuevas son premium.
- No se commitean secretos ni `.env*`; los pagos usan variables de entorno.
- No se edita `TODO.md`.
- Paquetes iniciales: 200/$1,99; 600+30/$4,99; 1.300+100/$9,99; 2.800+300/$19,99; 7.500+1.000/$49,99; 16.000+2.500/$99,99.
- Skins premium iniciales: `prism` 600 MZP, `ember` 900 MZP, `void` 1.800 MZP.
- Verificación: `pnpm --filter muzicmania-website exec tsc --noEmit`, `pnpm --filter muzicmania-website build` y pruebas de API con dos cuentas.

---

### Task 1: Dependencia de pagos y helpers puros

**Files:**
- Modify: `projects/muzicmania/website/package.json`
- Modify: `vitest.config.mts`
- Create: `projects/muzicmania/website/src/lib/economy/format.ts`
- Test: `projects/muzicmania/website/tests/economy/format.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `formatMzP(value: number): string`, `calculateAge(birthDate: string, today?: Date): number`, `isAdultBirthDate(birthDate: string, today?: Date): boolean`, `packageTotal(pointsBase: number, bonus: number): number`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { calculateAge, formatMzP, isAdultBirthDate, packageTotal } from '../../src/lib/economy/format';

describe('economy format', () => {
  it('formats MuziPoints with Spanish separators', () => {
    expect(formatMzP(16000)).toBe('16.000 MZP');
  });

  it('calculates age across birthdays', () => {
    expect(calculateAge('2000-11-05', new Date('2026-11-04T12:00:00Z'))).toBe(25);
    expect(calculateAge('2008-11-04', new Date('2026-11-04T12:00:00Z'))).toBe(18);
    expect(isAdultBirthDate('2008-11-05', new Date('2026-11-04T12:00:00Z'))).toBe(false);
  });

  it('adds package bonus', () => {
    expect(packageTotal(600, 30)).toBe(630);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run projects/muzicmania/website/tests/economy/format.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Add dependency and test path**

Add to `projects/muzicmania/website/package.json` dependencies:

```json
"@ciszunetwork/payments": "workspace:*"
```

Add to `vitest.config.mts` test includes:

```ts
'projects/muzicmania/website/tests/**/*.test.ts',
```

Run: `pnpm install --lockfile-only`

- [ ] **Step 4: Write minimal implementation**

```ts
export function formatMzP(value: number): string {
  return `${Math.max(0, Math.trunc(value)).toLocaleString('es-VE')} MZP`;
}

export function calculateAge(birthDate: string, today = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const month = today.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return Math.max(0, age);
}

export function isAdultBirthDate(birthDate: string, today = new Date()): boolean {
  return calculateAge(birthDate, today) >= 18;
}

export function packageTotal(pointsBase: number, bonus: number): number {
  return Math.max(0, Math.trunc(pointsBase)) + Math.max(0, Math.trunc(bonus));
}
```

- [ ] **Step 5: Run test and commit**

Run: `pnpm vitest run projects/muzicmania/website/tests/economy/format.test.ts`

Expected: PASS.

```bash
git add projects/muzicmania/website/package.json projects/muzicmania/website/src/lib/economy/format.ts projects/muzicmania/website/tests/economy/format.test.ts vitest.config.mts pnpm-lock.yaml
git commit -m "feat(muzicmania): base de economia y formato de muzipoints"
```

---

### Task 2: Migración del núcleo económico

**Files:**
- Create: `services/supabase/migrations/20261104000005_economy_core.sql`

**Interfaces:**
- Consumes: nada.
- Produces: tablas `muzicmania.wallets`, `muzicmania.point_ledger`, `muzicmania.point_packages`, `muzicmania.shop_items`, `muzicmania.user_inventory`, `pagos.orders`, `pagos.webhook_events`; columnas de edad en `muzicmania.profiles`.

- [ ] **Step 1: Write the migration**

```sql
CREATE SCHEMA IF NOT EXISTS pagos;

ALTER TABLE muzicmania.profiles
  ADD COLUMN IF NOT EXISTS purchase_terms_version TEXT,
  ADD COLUMN IF NOT EXISTS purchase_terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS birth_date_locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS adult_confirmed_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION muzicmania.lock_profile_birth_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.birth_date_locked_at IS NOT NULL AND NEW.birth_date IS DISTINCT FROM OLD.birth_date THEN
    RAISE EXCEPTION 'birth_date_locked';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION muzicmania.guard_profile_adult_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE((SELECT auth.role()), '') <> 'service_role' AND (
    NEW.purchase_terms_version IS DISTINCT FROM OLD.purchase_terms_version OR
    NEW.purchase_terms_accepted_at IS DISTINCT FROM OLD.purchase_terms_accepted_at OR
    NEW.birth_date_locked_at IS DISTINCT FROM OLD.birth_date_locked_at OR
    NEW.adult_confirmed_at IS DISTINCT FROM OLD.adult_confirmed_at
  ) THEN
    RAISE EXCEPTION 'adult_fields_server_only';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_birth_date ON muzicmania.profiles;
CREATE TRIGGER profiles_lock_birth_date
  BEFORE UPDATE ON muzicmania.profiles
  FOR EACH ROW EXECUTE FUNCTION muzicmania.lock_profile_birth_date();

DROP TRIGGER IF EXISTS profiles_guard_adult_fields ON muzicmania.profiles;
CREATE TRIGGER profiles_guard_adult_fields
  BEFORE UPDATE ON muzicmania.profiles
  FOR EACH ROW EXECUTE FUNCTION muzicmania.guard_profile_adult_fields();

CREATE TABLE IF NOT EXISTS muzicmania.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points BIGINT NOT NULL DEFAULT 0 CHECK (points >= 0),
  lifetime_earned BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  lifetime_spent BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS muzicmania.point_ledger (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta BIGINT NOT NULL CHECK (delta <> 0),
  balance_after BIGINT NOT NULL DEFAULT 0 CHECK (balance_after >= 0),
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_ledger_user ON muzicmania.point_ledger (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS muzicmania.point_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  points_base INTEGER NOT NULL CHECK (points_base > 0),
  bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  badge TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS muzicmania.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('arrow_skin', 'particle_skin', 'profile_banner', 'title', 'bundle')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price_points INTEGER NOT NULL CHECK (price_points > 0),
  asset_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS muzicmania.user_inventory (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES muzicmania.shop_items(id) ON DELETE CASCADE,
  acquired_via TEXT NOT NULL DEFAULT 'shop',
  equipped_slot TEXT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_equipped_slot
  ON muzicmania.user_inventory (user_id, equipped_slot)
  WHERE equipped_slot IS NOT NULL;

CREATE TABLE IF NOT EXISTS pagos.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL DEFAULT 'nowpayments',
  provider_order_id TEXT UNIQUE,
  provider_payment_id TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('points_package', 'shop_item')),
  product_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  points_base INTEGER NOT NULL DEFAULT 0,
  points_bonus INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'failed', 'expired', 'refunded', 'review')),
  checkout_url TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON pagos.orders (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS pagos.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

ALTER TABLE muzicmania.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.point_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzicmania.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos.webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON muzicmania.wallets, muzicmania.point_ledger, muzicmania.user_inventory FROM anon, authenticated;
REVOKE ALL ON muzicmania.point_packages, muzicmania.shop_items FROM anon, authenticated;
REVOKE ALL ON pagos.orders, pagos.webhook_events FROM anon, authenticated;
GRANT SELECT ON muzicmania.point_packages, muzicmania.shop_items TO anon, authenticated;
GRANT ALL ON muzicmania.wallets, muzicmania.point_ledger, muzicmania.user_inventory TO service_role;
GRANT ALL ON muzicmania.point_packages, muzicmania.shop_items TO service_role;
GRANT ALL ON pagos.orders, pagos.webhook_events TO service_role;
GRANT USAGE ON SCHEMA pagos TO service_role;

DROP POLICY IF EXISTS wallets_own_read ON muzicmania.wallets;
CREATE POLICY wallets_own_read ON muzicmania.wallets FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ledger_own_read ON muzicmania.point_ledger;
CREATE POLICY ledger_own_read ON muzicmania.point_ledger FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_own_read ON muzicmania.user_inventory;
CREATE POLICY inventory_own_read ON muzicmania.user_inventory FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS packages_public_read ON muzicmania.point_packages;
CREATE POLICY packages_public_read ON muzicmania.point_packages FOR SELECT TO anon, authenticated USING (enabled = TRUE);

DROP POLICY IF EXISTS items_public_read ON muzicmania.shop_items;
CREATE POLICY items_public_read ON muzicmania.shop_items FOR SELECT TO anon, authenticated USING (enabled = TRUE);

DROP POLICY IF EXISTS orders_own_read ON pagos.orders;
CREATE POLICY orders_own_read ON pagos.orders FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

INSERT INTO muzicmania.point_packages (slug, name, points_base, bonus_points, price_cents, badge, sort_order)
VALUES
  ('starter', 'Inicio', 200, 0, 199, NULL, 1),
  ('popular', 'Popular', 600, 30, 499, 'POPULAR', 2),
  ('pro', 'Mejor valor', 1300, 100, 999, 'MEJOR VALOR', 3),
  ('elite', 'Élite', 2800, 300, 1999, NULL, 4),
  ('legend', 'Leyenda', 7500, 1000, 4999, NULL, 5),
  ('mythic', 'Mítico', 16000, 2500, 9999, NULL, 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO muzicmania.shop_items (slug, name, description, category, rarity, price_points, asset_key, sort_order)
VALUES
  ('prism', 'Prisma', 'Flechas con degradado prismático.', 'arrow_skin', 'rare', 600, 'prism', 1),
  ('ember', 'Brasa', 'Flechas incandescentes con núcleo rojo.', 'arrow_skin', 'epic', 900, 'ember', 2),
  ('void', 'Vacío', 'Flechas oscuras con borde violeta.', 'arrow_skin', 'legendary', 1800, 'void', 3)
ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 2: Apply the migration and expose `pagos`**

Run: `node scripts/apply-migration.js 20261104000005_economy_core.sql`

Expected: `OK`.

Add `pagos` to the Supabase API exposed schemas:
- Local: `services/supabase/config.toml` → `schemas = [..., "pagos"]`.
- Hosted: Dashboard → Project Settings → API → Exposed schemas, or Management API `PATCH /v1/projects/<ref>/postgrest` with `db_schema` including `pagos`.

Verify with a server-side request using the service key and `Accept-Profile: pagos`; expected HTTP 200/empty array, not 401/404.

- [ ] **Step 3: Verify tables, RLS and seed**

Run:

```powershell
dbvr sql -ds=supabase "select count(*) from muzicmania.point_packages; select count(*) from muzicmania.shop_items; select relname, relrowsecurity from pg_class where relname in ('wallets','point_ledger','user_inventory','orders','webhook_events') order by relname;"
```

Expected: packages `6`, items `3`, all `relrowsecurity = true`.

- [ ] **Step 4: Verify git does not track the migration**

Run: `git status --short services/supabase/migrations/20261104000005_economy_core.sql`

Expected: no output. `services/` es gitignored; la migración se aplica localmente y no se commitea. El commit de código de esta fase empieza en Task 1/5.

---

### Task 3: RPC de wallet idempotente

**Files:**
- Create: `services/supabase/migrations/20261104000006_economy_wallet_rpc.sql`

**Interfaces:**
- Consumes: tablas de Task 2.
- Produces: `muzicmania.wallet_apply(p_user_id uuid, p_delta bigint, p_reason text, p_reference_type text, p_reference_id text, p_idempotency_key text, p_metadata jsonb) RETURNS bigint`.

- [ ] **Step 1: Write the function**

```sql
CREATE OR REPLACE FUNCTION muzicmania.wallet_apply(
  p_user_id UUID,
  p_delta BIGINT,
  p_reason TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = muzicmania, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_points BIGINT;
  v_next BIGINT;
BEGIN
  IF p_delta = 0 THEN RAISE EXCEPTION 'zero_delta'; END IF;
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) < 8 THEN
    RAISE EXCEPTION 'invalid_idempotency_key';
  END IF;

  INSERT INTO muzicmania.point_ledger
    (user_id, delta, balance_after, reason, reference_type, reference_id, idempotency_key, metadata)
  VALUES
    (p_user_id, p_delta, 0, p_reason, p_reference_type, p_reference_id, p_idempotency_key, p_metadata)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT points INTO v_points FROM muzicmania.wallets WHERE user_id = p_user_id;
    RETURN COALESCE(v_points, 0);
  END IF;

  INSERT INTO muzicmania.wallets (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT points INTO v_points FROM muzicmania.wallets WHERE user_id = p_user_id FOR UPDATE;
  v_next := v_points + p_delta;
  IF v_next < 0 THEN RAISE EXCEPTION 'insufficient_points'; END IF;

  UPDATE muzicmania.wallets
  SET points = v_next,
      lifetime_earned = lifetime_earned + GREATEST(p_delta, 0),
      lifetime_spent = lifetime_spent + GREATEST(-p_delta, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  UPDATE muzicmania.point_ledger SET balance_after = v_next WHERE id = v_id;
  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION muzicmania.wallet_apply(UUID, BIGINT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION muzicmania.wallet_apply(UUID, BIGINT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
```

- [ ] **Step 2: Apply and test**

Run: `node scripts/apply-migration.js 20261104000006_economy_wallet_rpc.sql`

Use the bot account only for the test and clean up after:

```powershell
dbvr sql -ds=supabase "select muzicmania.wallet_apply('56091527-f249-40d1-a80f-4da1ef103f48', 100, 'test', 'admin', 'test', 'test-wallet-001', '{}'); select muzicmania.wallet_apply('56091527-f249-40d1-a80f-4da1ef103f48', 100, 'test', 'admin', 'test', 'test-wallet-001', '{}'); select points from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

Expected: first call `100`, second call `100` (idempotent), wallet `100`.

- [ ] **Step 3: Verify insufficient balance**

Run:

```powershell
dbvr sql -ds=supabase "select muzicmania.wallet_apply('56091527-f249-40d1-a80f-4da1ef103f48', -500, 'test', 'admin', 'test', 'test-wallet-002', '{}');"
```

Expected: error `insufficient_points`; wallet unchanged.

- [ ] **Step 4: Clean test data**

```powershell
dbvr sql -ds=supabase "delete from muzicmania.point_ledger where idempotency_key like 'test-wallet-%'; delete from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

- [ ] **Step 5: Verify the migration is not tracked**

Run: `git status --short services/supabase/migrations/20261104000006_economy_wallet_rpc.sql`

Expected: no output. La migración queda local/gitignored; no se commitea.

---

### Task 4: RPC de compra, equipamiento y fulfillment

**Files:**
- Create: `services/supabase/migrations/20261104000007_economy_shop_rpc.sql`

**Interfaces:**
- Consumes: `wallet_apply` de Task 3.
- Produces: `muzicmania.purchase_item(uuid, uuid, text) RETURNS bigint`, `muzicmania.equip_item(uuid, uuid) RETURNS void`, `muzicmania.fulfill_points_order(uuid, text, integer, text) RETURNS bigint`.

- [ ] **Step 1: Write the functions**

```sql
CREATE OR REPLACE FUNCTION muzicmania.purchase_item(
  p_user_id UUID,
  p_item_id UUID,
  p_idempotency_key TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = muzicmania, pg_temp
AS $$
DECLARE
  v_item muzicmania.shop_items%ROWTYPE;
  v_balance BIGINT;
BEGIN
  SELECT balance_after INTO v_balance FROM muzicmania.point_ledger WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN RETURN v_balance; END IF;

  SELECT * INTO v_item FROM muzicmania.shop_items WHERE id = p_item_id AND enabled = TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'item_not_found'; END IF;
  IF EXISTS (SELECT 1 FROM muzicmania.user_inventory WHERE user_id = p_user_id AND item_id = p_item_id) THEN
    RAISE EXCEPTION 'already_owned';
  END IF;

  v_balance := muzicmania.wallet_apply(
    p_user_id, -v_item.price_points, 'shop_item', 'shop_item', p_item_id::text, p_idempotency_key,
    jsonb_build_object('item_slug', v_item.slug)
  );

  INSERT INTO muzicmania.user_inventory (user_id, item_id, acquired_via)
  VALUES (p_user_id, p_item_id, 'shop');

  RETURN v_balance;
END;
$$;

CREATE OR REPLACE FUNCTION muzicmania.equip_item(
  p_user_id UUID,
  p_item_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = muzicmania, pg_temp
AS $$
DECLARE
  v_category TEXT;
  v_slot TEXT;
BEGIN
  SELECT i.category INTO v_category
  FROM muzicmania.user_inventory ui
  JOIN muzicmania.shop_items i ON i.id = ui.item_id
  WHERE ui.user_id = p_user_id AND ui.item_id = p_item_id;

  IF v_category IS NULL THEN RAISE EXCEPTION 'not_owned'; END IF;
  v_slot := v_category;

  UPDATE muzicmania.user_inventory SET equipped_slot = NULL
  WHERE user_id = p_user_id AND equipped_slot = v_slot;

  UPDATE muzicmania.user_inventory SET equipped_slot = v_slot
  WHERE user_id = p_user_id AND item_id = p_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION muzicmania.fulfill_points_order(
  p_order_id UUID,
  p_provider_payment_id TEXT,
  p_price_cents INTEGER,
  p_currency TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = muzicmania, pagos, pg_temp
AS $$
DECLARE
  v_order pagos.orders%ROWTYPE;
  v_points BIGINT;
BEGIN
  SELECT * INTO v_order FROM pagos.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order_not_found'; END IF;
  IF v_order.status = 'fulfilled' THEN RETURN 0; END IF;
  IF v_order.status NOT IN ('pending', 'paid') THEN RAISE EXCEPTION 'order_not_payable'; END IF;
  IF p_price_cents <> v_order.amount_cents THEN RAISE EXCEPTION 'amount_mismatch'; END IF;
  IF lower(p_currency) <> lower(v_order.currency) THEN RAISE EXCEPTION 'currency_mismatch'; END IF;

  v_points := muzicmania.wallet_apply(
    v_order.user_id,
    v_order.points_base + v_order.points_bonus,
    'purchase',
    'order',
    v_order.id::text,
    'payment:' || v_order.id::text,
    jsonb_build_object('provider', v_order.provider, 'provider_payment_id', p_provider_payment_id)
  );

  UPDATE pagos.orders
  SET status = 'fulfilled', provider_payment_id = p_provider_payment_id, fulfilled_at = NOW(), updated_at = NOW()
  WHERE id = p_order_id;

  RETURN v_points;
END;
$$;

REVOKE ALL ON FUNCTION muzicmania.purchase_item(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION muzicmania.equip_item(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION muzicmania.fulfill_points_order(UUID, TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION muzicmania.purchase_item(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION muzicmania.equip_item(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION muzicmania.fulfill_points_order(UUID, TEXT, INTEGER, TEXT) TO service_role;
```

- [ ] **Step 2: Apply and test item purchase**

Run: `node scripts/apply-migration.js 20261104000007_economy_shop_rpc.sql`

Seed balance, buy `prism`, verify ownership and idempotency:

```powershell
dbvr sql -ds=supabase "select muzicmania.wallet_apply('56091527-f249-40d1-a80f-4da1ef103f48', 1000, 'test', 'admin', 'test', 'test-shop-001', '{}'); select muzicmania.purchase_item('56091527-f249-40d1-a80f-4da1ef103f48', (select id from muzicmania.shop_items where slug='prism'), 'test-shop-prism-001'); select points from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48'; select count(*) from muzicmania.user_inventory where user_id='56091527-f249-40d1-a80f-4da1ef103f48' and item_id=(select id from muzicmania.shop_items where slug='prism');"
```

Expected: balance `400`, inventory count `1`.

- [ ] **Step 3: Test double purchase and cleanup**

Run the purchase again with the same key. Expected: `already_owned` or idempotent `400`; never a second inventory row and never below zero.

```powershell
dbvr sql -ds=supabase "delete from muzicmania.user_inventory where user_id='56091527-f249-40d1-a80f-4da1ef103f48'; delete from muzicmania.point_ledger where idempotency_key like 'test-shop-%'; delete from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

- [ ] **Step 4: Test order fulfillment**

```powershell
dbvr sql -ds=supabase "insert into pagos.orders (id,user_id,product_type,product_id,amount_cents,currency,points_base,points_bonus,idempotency_key) values ('11111111-1111-4111-8111-111111111111','56091527-f249-40d1-a80f-4da1ef103f48','points_package','starter',199,'USD',200,0,'test-order-001'); select muzicmania.fulfill_points_order('11111111-1111-4111-8111-111111111111','pay_test',199,'USD'); select muzicmania.fulfill_points_order('11111111-1111-4111-8111-111111111111','pay_test',199,'USD'); select points from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

Expected: first fulfillment returns `200`, second returns `0`, wallet `200`.

- [ ] **Step 5: Cleanup and verify git**

```powershell
dbvr sql -ds=supabase "delete from pagos.orders where idempotency_key like 'test-order-%'; delete from muzicmania.point_ledger where idempotency_key like 'payment:%' and user_id='56091527-f249-40d1-a80f-4da1ef103f48'; delete from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

Run: `git status --short services/supabase/migrations/20261104000007_economy_shop_rpc.sql`

Expected: no output. La migración queda local/gitignored; no se commitea.

---

### Task 5: Helpers de servidor, edad y flags

**Files:**
- Create: `projects/muzicmania/website/src/lib/economy/server.ts`
- Test: `projects/muzicmania/website/tests/economy/server.test.ts`

**Interfaces:**
- Consumes: `calculateAge`, `isAdultBirthDate` de Task 1.
- Produces: `readPaymentFlags()`, `assertAdultProfile(profile)`, `adultStatus(admin, userId)`, `jsonError(message, status)`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { assertAdultProfile, readPaymentFlags } from '../../src/lib/economy/server';

describe('economy server helpers', () => {
  it('rejects minors', () => {
    expect(() => assertAdultProfile({ birth_date: '2010-01-01' })).toThrow('adult_required');
  });

  it('accepts adults', () => {
    expect(assertAdultProfile({ birth_date: '2000-01-01' })).toBe(true);
  });

  it('reads flags as booleans', () => {
    const flags = readPaymentFlags({ PAYMENTS_CRYPTO_ENABLED: 'true', PAYMENTS_CARD_ENABLED: 'false' } as NodeJS.ProcessEnv);
    expect(flags).toEqual({ crypto: true, card: false, paypal: false });
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm vitest run projects/muzicmania/website/tests/economy/server.test.ts`

Expected: FAIL because `server.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { isAdultBirthDate } from './format';

export interface PaymentFlags {
  crypto: boolean;
  card: boolean;
  paypal: boolean;
}

export function readPaymentFlags(env: NodeJS.ProcessEnv = process.env): PaymentFlags {
  return {
    crypto: env.PAYMENTS_CRYPTO_ENABLED === 'true',
    card: env.PAYMENTS_CARD_ENABLED === 'true',
    paypal: env.PAYMENTS_PAYPAL_ENABLED === 'true',
  };
}

export function assertAdultProfile(profile: { birth_date?: string | null }): true {
  if (!profile.birth_date || !isAdultBirthDate(profile.birth_date)) {
    throw new Error('adult_required');
  }
  return true;
}

export async function adultStatus(admin: any, userId: string) {
  const { data, error } = await admin.schema('muzicmania').from('profiles').select('birth_date,email_verified,purchase_terms_version,purchase_terms_accepted_at,adult_confirmed_at').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  const birthDate = typeof data?.birth_date === 'string' ? data.birth_date : null;
  return {
    birthDate,
    isAdult: Boolean(birthDate && isAdultBirthDate(birthDate)),
    emailVerified: data?.email_verified === true,
    termsVersion: data?.purchase_terms_version ?? null,
    termsAccepted: Boolean(data?.purchase_terms_accepted_at),
  };
}

export function jsonError(message: string, status: number) {
  return { error: message, status };
}
```

- [ ] **Step 4: Run test and commit**

Run: `pnpm vitest run projects/muzicmania/website/tests/economy/server.test.ts`

Expected: PASS.

```bash
git add projects/muzicmania/website/src/lib/economy/server.ts projects/muzicmania/website/tests/economy/server.test.ts
git commit -m "feat(muzicmania): helpers de edad y flags de pago"
```

---

### Task 6: API de economía y declaración 18+

**Files:**
- Create: `projects/muzicmania/website/src/app/api/economy/me/route.ts`
- Create: `projects/muzicmania/website/src/app/api/economy/adult/route.ts`

**Interfaces:**
- Consumes: helpers de Task 5; `authenticate`/`adminClient` de `src/app/api/auth/2fa/_lib.ts`.
- Produces: `GET /api/economy/me` con `{ wallet, inventory, packages, flags, adult }`; `POST /api/economy/adult` con `{ birth_date, terms_version }`.

- [ ] **Step 1: Implement `me`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus, readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;

  const [wallet, ledger, inventory, packages, adult] = await Promise.all([
    admin.schema('muzicmania').from('wallets').select('points,lifetime_earned,lifetime_spent,updated_at').eq('user_id', user.userId).maybeSingle(),
    admin.schema('muzicmania').from('point_ledger').select('id,delta,balance_after,reason,reference_type,reference_id,created_at').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(20),
    admin.schema('muzicmania').from('user_inventory').select('item_id,equipped_slot,acquired_at,shop_items(slug,name,category,asset_key,rarity)').eq('user_id', user.userId),
    admin.schema('muzicmania').from('point_packages').select('id,slug,name,points_base,bonus_points,price_cents,currency,badge').eq('enabled', true).order('sort_order'),
    adultStatus(admin, user.userId),
  ]);

  return NextResponse.json({
    wallet: wallet.data ?? { points: 0, lifetime_earned: 0, lifetime_spent: 0 },
    ledger: ledger.data ?? [],
    inventory: inventory.data ?? [],
    packages: packages.data ?? [],
    flags: readPaymentFlags(),
    adult,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 2: Implement `adult`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { isAdultBirthDate } from '@/lib/economy/format';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
const schema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  terms_version: z.string().trim().min(1).max(20),
});

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const adult = isAdultBirthDate(parsed.data.birth_date);
  if (!adult) return NextResponse.json({ error: 'minor', adult: false }, { status: 403 });

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').from('profiles').update({
    birth_date: parsed.data.birth_date,
    purchase_terms_version: parsed.data.terms_version,
    purchase_terms_accepted_at: new Date().toISOString(),
    birth_date_locked_at: new Date().toISOString(),
    adult_confirmed_at: new Date().toISOString(),
  }).eq('id', user.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ adult: true });
}
```

- [ ] **Step 3: Verify with real token**

Start local server and call `GET /api/economy/me` with owner token. Expected `200`, `wallet.points` numeric and `flags.crypto` boolean.

Run: `pnpm --filter muzicmania-website exec tsc --noEmit`.

- [ ] **Step 4: Commit**

```bash
git add projects/muzicmania/website/src/app/api/economy
git commit -m "feat(muzicmania): api de wallet y declaracion 18"
```

---

### Task 7: API de catálogo

**Files:**
- Create: `projects/muzicmania/website/src/app/api/shop/items/route.ts`
- Create: `projects/muzicmania/website/src/app/api/shop/packages/route.ts`

**Interfaces:**
- Consumes: tablas de Task 2.
- Produces: `GET /api/shop/items` con `{ items }` y `owned`/`equipped`; `GET /api/shop/packages` con `{ packages }`.

- [ ] **Step 1: Implement items**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  const admin = adminClient() as any;
  const { data: items, error } = await admin.schema('muzicmania').from('shop_items')
    .select('id,slug,name,description,category,rarity,price_points,asset_key')
    .eq('enabled', true).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let owned = new Map<string, string | null>();
  if (user) {
    const { data: inventory } = await admin.schema('muzicmania').from('user_inventory')
      .select('item_id,equipped_slot').eq('user_id', user.userId);
    owned = new Map((inventory ?? []).map((row: any) => [row.item_id, row.equipped_slot]));
  }

  return NextResponse.json({
    items: (items ?? []).map((item: any) => ({
      ...item,
      owned: owned.has(item.id),
      equippedSlot: owned.get(item.id) ?? null,
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 2: Implement packages**

```ts
import { NextResponse } from 'next/server';
import { adminClient } from '../../auth/2fa/_lib';
import { readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').from('point_packages')
    .select('id,slug,name,points_base,bonus_points,price_cents,currency,badge')
    .eq('enabled', true).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ packages: data ?? [], flags: readPaymentFlags() }, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 3: Verify and commit**

Run: `curl.exe -s http://localhost:3003/api/shop/packages`; expected JSON with 6 packages. Run typecheck.

```bash
git add projects/muzicmania/website/src/app/api/shop
git commit -m "feat(muzicmania): api publica de catalogo y paquetes"
```

---

### Task 8: API de compra y equipamiento

**Files:**
- Create: `projects/muzicmania/website/src/app/api/shop/purchase/route.ts`
- Create: `projects/muzicmania/website/src/app/api/shop/equip/route.ts`

**Interfaces:**
- Consumes: RPCs `purchase_item` y `equip_item`.
- Produces: `POST /api/shop/purchase { item_id } -> { points }`; `POST /api/shop/equip { item_id } -> { ok }`.

- [ ] **Step 1: Implement purchase**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const schema = z.object({ item_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('purchase_item', {
    p_user_id: user.userId,
    p_item_id: parsed.data.item_id,
    p_idempotency_key: `shop:${user.userId}:${parsed.data.item_id}`,
  });
  if (error) {
    const message = error.message.includes('insufficient_points') ? 'insufficient_points' : error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }
  return NextResponse.json({ points: Number(data ?? 0) });
}
```

- [ ] **Step 2: Implement equip**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const schema = z.object({ item_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').rpc('equip_item', {
    p_user_id: user.userId,
    p_item_id: parsed.data.item_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Test with two accounts and cleanup**

Use the smoke script from Task 14; verify buying `prism` debits 600, a retry with the same idempotency key returns 200 without a second debit, and inventory stays at 1.

- [ ] **Step 4: Commit**

```bash
git add projects/muzicmania/website/src/app/api/shop
git commit -m "feat(muzicmania): api de compra y equipamiento"
```

---

### Task 9: API de invoice cripto

**Files:**
- Create: `projects/muzicmania/website/src/app/api/payments/invoice/route.ts`
- Modify: `turbo.json` env list

**Interfaces:**
- Consumes: `createNowPaymentsProvider`, `pagos.orders`, `adultStatus`.
- Produces: `POST /api/payments/invoice { package_id, creator_code? } -> { order_id, checkout_url }`.

- [ ] **Step 1: Add env keys to Turbo**

Add to `globalEnv` and `build.env` in `turbo.json`:

```json
"PAYMENTS_CRYPTO_ENABLED",
"PAYMENTS_CARD_ENABLED",
"PAYMENTS_PAYPAL_ENABLED",
"MUZICMANIA_PUBLIC_URL"
```

- [ ] **Step 2: Implement invoice**

```ts
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createNowPaymentsProvider, PaymentError } from '@ciszunetwork/payments';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { adultStatus, readPaymentFlags } from '@/lib/economy/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({ package_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const flags = readPaymentFlags();
  if (!flags.crypto) return NextResponse.json({ error: 'crypto_disabled' }, { status: 403 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });

  const admin = adminClient() as any;
  const adult = await adultStatus(admin, user.userId);
  if (!adult.isAdult || !adult.emailVerified || !adult.termsAccepted) return NextResponse.json({ error: 'adult_required' }, { status: 403 });

  const { data: pkg, error: pkgError } = await admin.schema('muzicmania').from('point_packages')
    .select('id,slug,points_base,bonus_points,price_cents,currency').eq('id', parsed.data.package_id).eq('enabled', true).maybeSingle();
  if (pkgError || !pkg) return NextResponse.json({ error: 'package_not_found' }, { status: 404 });

  const orderId = randomUUID();
  const publicUrl = process.env.MUZICMANIA_PUBLIC_URL || 'https://muzicmania.vercel.app';
  const provider = createNowPaymentsProvider();

  try {
    const invoice = await provider.createInvoice({
      id: orderId,
      product: `MuzicMania ${pkg.slug} - ${pkg.points_base + pkg.bonus_points} MZP`,
      amountUsd: pkg.price_cents / 100,
      currency: pkg.currency,
      metadata: { ipnCallbackUrl: `${publicUrl}/api/webhooks/nowpayments` },
      successUrl: `${publicUrl}/play?payment=success&order=${orderId}`,
      cancelUrl: `${publicUrl}/play?payment=cancel&order=${orderId}`,
    });

    const { error } = await admin.schema('pagos').from('orders').insert({
      id: orderId,
      user_id: user.userId,
      provider: invoice.provider,
      provider_order_id: invoice.providerOrderId ?? null,
      product_type: 'points_package',
      product_id: pkg.id,
      amount_cents: pkg.price_cents,
      currency: pkg.currency,
      points_base: pkg.points_base,
      points_bonus: pkg.bonus_points,
      status: 'pending',
      checkout_url: invoice.checkoutUrl ?? null,
      idempotency_key: `invoice:${orderId}`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ order_id: orderId, checkout_url: invoice.checkoutUrl });
  } catch (error) {
    const message = error instanceof PaymentError ? error.message : 'invoice_failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
```

- [ ] **Step 3: Add env vars to Vercel Muzicmania**

Add only names to the project environment; values stay in the vault/Bitwarden:

```text
PAYMENTS_CRYPTO_ENABLED=true
PAYMENTS_CARD_ENABLED=false
PAYMENTS_PAYPAL_ENABLED=false
NOWPAYMENTS_API_KEY=<vault>
NOWPAYMENTS_IPN_SECRET=<vault>
MUZICMANIA_PUBLIC_URL=https://muzicmania.vercel.app
```

- [ ] **Step 4: Verify typecheck and commit**

Run: `pnpm --filter muzicmania-website exec tsc --noEmit`.

```bash
git add projects/muzicmania/website/src/app/api/payments/invoice/route.ts turbo.json
git commit -m "feat(muzicmania): invoice cripto y ordenes de pago"
```

---

### Task 10: Webhook y estado de orden

**Files:**
- Create: `projects/muzicmania/website/src/app/api/webhooks/nowpayments/route.ts`
- Create: `projects/muzicmania/website/src/app/api/payments/order/[id]/route.ts`

**Interfaces:**
- Consumes: `verifyWebhook`, `fulfill_points_order`, `pagos.orders`.
- Produces: webhook idempotente; `GET /api/payments/order/[id] -> { id,status,points_total,checkout_url }`.

- [ ] **Step 1: Implement webhook**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createNowPaymentsProvider } from '@ciszunetwork/payments';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const raw = await req.text();
  const provider = createNowPaymentsProvider();
  const event = await provider.verifyWebhook(raw, req.headers);
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });

  const payload = event.raw as Record<string, any>;
  const orderId = typeof payload.order_id === 'string' ? payload.order_id : '';
  const eventId = `${payload.payment_id ?? 'unknown'}:${payload.payment_status ?? 'unknown'}`;
  if (!orderId) return NextResponse.json({ error: 'missing_order' }, { status: 400 });

  const admin = adminClient() as any;
  const existing = await admin.schema('pagos').from('webhook_events').select('processed_at').eq('provider', event.provider).eq('event_id', eventId).maybeSingle();
  if (existing.data?.processed_at) return NextResponse.json({ ok: true, duplicate: true });

  await admin.schema('pagos').from('webhook_events').upsert({
    provider: event.provider,
    event_id: eventId,
    payload,
    signature_valid: true,
  }, { onConflict: 'provider,event_id', ignoreDuplicates: true });

  if (event.status !== 'confirmed') return NextResponse.json({ ok: true, status: event.status });

  const priceCents = Math.round(Number(payload.price_amount ?? 0) * 100);
  const currency = String(payload.price_currency ?? 'usd');
  const { error } = await admin.schema('muzicmania').rpc('fulfill_points_order', {
    p_order_id: orderId,
    p_provider_payment_id: String(payload.payment_id ?? ''),
    p_price_cents: priceCents,
    p_currency: currency,
  });

  if (error) {
    await admin.schema('pagos').from('webhook_events').update({ processed_at: null }).eq('provider', event.provider).eq('event_id', eventId);
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  await admin.schema('pagos').from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider', event.provider).eq('event_id', eventId);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Implement order status**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { adminClient, authenticate } from '../../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const admin = adminClient() as any;
  const { data, error } = await admin.schema('pagos').from('orders')
    .select('id,status,product_type,points_base,points_bonus,amount_cents,currency,checkout_url,created_at,fulfilled_at')
    .eq('id', id).eq('user_id', user.userId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ order: data }, { headers: { 'Cache-Control': 'no-store' } });
}
```

- [ ] **Step 3: Test signature, idempotency and amount mismatch**

Use a local script to send a signed payload with the vault secret to `http://localhost:3003/api/webhooks/nowpayments`:

- Valid signature + `price_amount=1.99` + `price_currency=usd` + pending order -> fulfillment and wallet increase.
- Same payload twice -> `duplicate: true`, no second credit.
- `price_amount=0.01` -> `amount_mismatch`, no credit.
- Bad signature -> `401`.

- [ ] **Step 4: Commit**

```bash
git add projects/muzicmania/website/src/app/api/webhooks/nowpayments projects/muzicmania/website/src/app/api/payments/order
git commit -m "feat(muzicmania): webhook firmado y estado de orden"
```

---

### Task 11: Cliente de economía y tipos

**Files:**
- Create: `projects/muzicmania/website/src/lib/economy/types.ts`
- Create: `projects/muzicmania/website/src/lib/economy/client.ts`

**Interfaces:**
- Consumes: APIs de Tasks 6–10.
- Produces: `EconomySnapshot`, `ShopItem`, `PointPackage`, `fetchEconomy()`, `fetchShopItems()`, `purchaseItem(id)`, `equipItem(id)`, `createInvoice(packageId)`, `fetchOrder(id)`, `declareAdult(birthDate, termsVersion)`.

- [ ] **Step 1: Define types**

```ts
export interface PointPackage {
  id: string;
  slug: string;
  name: string;
  points_base: number;
  bonus_points: number;
  price_cents: number;
  currency: string;
  badge: string | null;
}

export interface ShopItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'arrow_skin' | 'particle_skin' | 'profile_banner' | 'title' | 'bundle';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price_points: number;
  asset_key: string;
  owned: boolean;
  equippedSlot: string | null;
}

export interface EconomySnapshot {
  wallet: { points: number; lifetime_earned: number; lifetime_spent: number };
  inventory: unknown[];
  packages: PointPackage[];
  ledger: unknown[];
  flags: { crypto: boolean; card: boolean; paypal: boolean };
  adult: { birthDate: string | null; isAdult: boolean; emailVerified: boolean; termsVersion: string | null; termsAccepted: boolean };
}
```

- [ ] **Step 2: Implement client**

```ts
import { supabase } from '@/config/supabase';
import type { EconomySnapshot, PointPackage, ShopItem } from './types';

async function apiFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(input, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

export async function fetchEconomy(): Promise<EconomySnapshot> {
  const response = await apiFetch('/api/economy/me', { cache: 'no-store' });
  if (!response.ok) throw new Error('economy_load_failed');
  return response.json();
}

export async function fetchShopItems(): Promise<{ items: ShopItem[] }> {
  const response = await apiFetch('/api/shop/items', { cache: 'no-store' });
  if (!response.ok) throw new Error('shop_load_failed');
  return response.json();
}

export async function fetchPackages(): Promise<{ packages: PointPackage[]; flags: EconomySnapshot['flags'] }> {
  const response = await fetch('/api/shop/packages', { cache: 'no-store' });
  if (!response.ok) throw new Error('packages_load_failed');
  return response.json();
}

export async function purchaseItem(itemId: string) {
  const response = await apiFetch('/api/shop/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'purchase_failed');
  return data as { points: number };
}

export async function equipItem(itemId: string) {
  const response = await apiFetch('/api/shop/equip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: itemId }),
  });
  if (!response.ok) throw new Error('equip_failed');
}

export async function createInvoice(packageId: string) {
  const response = await apiFetch('/api/payments/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ package_id: packageId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'invoice_failed');
  return data as { order_id: string; checkout_url: string };
}

export async function fetchOrder(id: string) {
  const response = await apiFetch(`/api/payments/order/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('order_load_failed');
  return response.json();
}

export async function declareAdult(birthDate: string, termsVersion: string) {
  const response = await apiFetch('/api/economy/adult', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birth_date: birthDate, terms_version: termsVersion }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'adult_failed');
  return data as { adult: boolean };
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/muzicmania/website/src/lib/economy
git commit -m "feat(muzicmania): cliente tipado de economia y tienda"
```

---

### Task 12: Skins premium con ownership

**Files:**
- Modify: `projects/muzicmania/website/src/lib/arrowSkins.ts`
- Modify: `projects/muzicmania/website/src/app/play/page.tsx`

**Interfaces:**
- Consumes: `ShopItem.asset_key`, `fetchEconomy`.
- Produces: `FREE_ARROW_SKINS`, `isArrowSkinOwned(id, ownedIds)`, skins `prism`, `ember`, `void`.

- [ ] **Step 1: Add premium skins**

Add a factory before `ARROW_SKINS` and entries after `minimal`:

```ts
function drawStoreArrow(primary: string, secondary: string, glow: string) {
  return (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, direction: number, _color: string, state: ArrowState) => {
    const rotations = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotations[direction]);
    const alpha = state === 'fail' ? 0.35 : 1;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = state === 'press' ? 38 : 18;
    ctx.shadowColor = glow;
    const grad = ctx.createLinearGradient(-size, -size, size, size);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.62, size * 0.32);
    ctx.lineTo(size * 0.22, size * 0.16);
    ctx.lineTo(size * 0.22, size);
    ctx.lineTo(-size * 0.22, size);
    ctx.lineTo(-size * 0.22, size * 0.16);
    ctx.lineTo(-size * 0.62, size * 0.32);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.strokeStyle = state === 'press' ? '#ffffff' : glow;
    ctx.lineWidth = state === 'press' ? 3 : 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
}
```

Add entries:

```ts
prism: {
  id: 'prism',
  name: 'Prisma',
  author: 'MuzicMania',
  description: 'Degradado prismático premium',
  colorType: 'direct',
  hasTrail: true,
  drawArrow: drawStoreArrow('#67e8f9', '#f0abfc', '#22d3ee'),
  drawHoldTrail: drawDefaultHoldTrail,
},
ember: {
  id: 'ember',
  name: 'Brasa',
  author: 'MuzicMania',
  description: 'Núcleo incandescente premium',
  colorType: 'direct',
  hasTrail: true,
  drawArrow: drawStoreArrow('#fb923c', '#ef4444', '#f97316'),
  drawHoldTrail: drawDefaultHoldTrail,
},
void: {
  id: 'void',
  name: 'Vacío',
  author: 'MuzicMania',
  description: 'Borde violeta premium',
  colorType: 'direct',
  hasTrail: true,
  drawArrow: drawStoreArrow('#4c1d95', '#111827', '#a855f7'),
  drawHoldTrail: drawDefaultHoldTrail,
},
```

Add ownership helpers:

```ts
export const FREE_ARROW_SKINS = new Set<ArrowSkinId>(['default', 'shiny', 'minimal']);

export function isArrowSkinOwned(id: ArrowSkinId, owned: Iterable<string>): boolean {
  return FREE_ARROW_SKINS.has(id) || new Set(owned).has(id);
}
```

- [ ] **Step 2: Filter options in the game**

In `play/page.tsx`, import `fetchEconomy` and `isArrowSkinOwned`, then add state and effect near the other hooks:

```tsx
const [ownedSkinKeys, setOwnedSkinKeys] = useState<string[]>([]);
const [economyLoaded, setEconomyLoaded] = useState(false);

useEffect(() => {
  setOwnedSkinKeys([]);
  setEconomyLoaded(false);
  if (!user?.id) { setEconomyLoaded(true); return; }
  let alive = true;
  fetchEconomy()
    .then((snapshot) => {
      if (!alive) return;
      const keys = snapshot.inventory
        .map((row: any) => row.shop_items?.category === 'arrow_skin' ? row.shop_items?.asset_key : null)
        .filter((key: unknown): key is string => typeof key === 'string');
      setOwnedSkinKeys(keys);
    })
    .catch(() => { if (alive) setOwnedSkinKeys([]); })
    .finally(() => { if (alive) setEconomyLoaded(true); });
  return () => { alive = false; };
}, [user?.id]);

useEffect(() => {
  if (!economyLoaded) return;
  if (currentArrowSkin !== 'default' && !isArrowSkinOwned(currentArrowSkin, ownedSkinKeys)) {
    setCurrentArrowSkin('default');
    activeSetArrowSkin('default');
  }
}, [activeSetArrowSkin, currentArrowSkin, economyLoaded, ownedSkinKeys]);
```

When rendering `getSkinList()`, use:

```tsx
const visibleSkins = getSkinList().filter((skin) => (user ? isArrowSkinOwned(skin.id, ownedSkinKeys) : skin.id === 'default'));
```

Guest sessions see only `default`; signed-in sessions see free skins plus their owned premium skins. The ownership state resets on every `user?.id` change (and on fetch failure) so accounts never inherit another account's skins.

Replace the current `(user ? getSkinList() : ...)` list with `visibleSkins`.

- [ ] **Step 3: Verify build and commit**

Run: `pnpm --filter muzicmania-website exec tsc --noEmit`.

```bash
git add projects/muzicmania/website/src/lib/arrowSkins.ts projects/muzicmania/website/src/app/play/page.tsx
git commit -m "feat(muzicmania): skins premium y control de propiedad"
```

---

### Task 13: UI de tienda, paquetes e inventario

**Files:**
- Create: `projects/muzicmania/website/src/components/shop/StorePanel.tsx`
- Create: `projects/muzicmania/website/src/components/shop/WalletChip.tsx`
- Create: `projects/muzicmania/website/src/components/shop/AgeGateModal.tsx`
- Modify: `projects/muzicmania/website/src/app/play/page.tsx`

**Interfaces:**
- Consumes: `fetchEconomy`, `fetchShopItems`, `fetchPackages`, `purchaseItem`, `equipItem`, `createInvoice`, `declareAdult`.
- Produces: `<StorePanel userId onBack onEquipArrow />` y `<AgeGateModal open onClose onDeclared />`.

- [ ] **Step 1: Implement WalletChip**

```tsx
import { formatMzP } from '@/lib/economy/format';

export function WalletChip({ points }: { points: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-300">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
      {formatMzP(points)}
    </span>
  );
}
```

- [ ] **Step 2: Implement AgeGateModal**

```tsx
'use client';

import { useState } from 'react';
import { declareAdult } from '@/lib/economy/client';

export function AgeGateModal({ open, onClose, onDeclared }: { open: boolean; onClose: () => void; onDeclared: () => void }) {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#08080c] p-5">
        <h3 className="font-header text-xl font-black uppercase text-white">Verificación 18+</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-white/50">Declara tu fecha de nacimiento para comprar MZP. Quedará bloqueada al confirmar.</p>
        <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mt-4 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white" />
        {error && <p className="mt-2 text-[10px] text-red-300">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/50">Cancelar</button>
          <button type="button" onClick={async () => {
            setError('');
            try {
              await declareAdult(birthDate, 'store-v1');
              onDeclared();
              onClose();
            } catch (cause) {
              setError(cause instanceof Error && cause.message === 'minor' ? 'Debes ser mayor de 18 años.' : 'No se pudo verificar.');
            }
          }} className="rounded-xl bg-neon-cyan px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement StorePanel**

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@ciszu/ui';
import { formatMzP } from '@/lib/economy/format';
import { createInvoice, equipItem, fetchEconomy, fetchPackages, fetchShopItems, purchaseItem } from '@/lib/economy/client';
import type { EconomySnapshot, PointPackage, ShopItem } from '@/lib/economy/types';
import { AgeGateModal } from './AgeGateModal';
import { WalletChip } from './WalletChip';

type Tab = 'packages' | 'cosmetics' | 'inventory';

export default function StorePanel({ userId, onBack, onEquipArrow }: { userId: string | null; onBack: () => void; onEquipArrow: (assetKey: string) => void }) {
  const [tab, setTab] = useState<Tab>('packages');
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null);
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [flags, setFlags] = useState<EconomySnapshot['flags']>({ crypto: false, card: false, paypal: false });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [ageOpen, setAgeOpen] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const [economy, catalog, packageData] = await Promise.all([fetchEconomy(), fetchShopItems(), fetchPackages()]);
    setSnapshot(economy);
    setItems(catalog.items);
    setPackages(packageData.packages);
    setFlags(packageData.flags);
  }, [userId]);

  useEffect(() => { void load().catch(() => setError('No se pudo cargar la tienda.')); }, [load]);

  const owned = useMemo(() => new Set(items.filter((item) => item.owned).map((item) => item.id)), [items]);

  const buyPackage = async (pkg: PointPackage) => {
    setPendingPackage(pkg.id);
    setBusy(pkg.id);
    setError('');
    try {
      const invoice = await createInvoice(pkg.id);
      window.location.href = invoice.checkout_url;
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'adult_required') { setAgeOpen(true); return; }
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar el pago.');
    } finally {
      setBusy(null);
    }
  };

  const buyItem = async (item: ShopItem) => {
    setBusy(item.id);
    setError('');
    try {
      await purchaseItem(item.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo comprar.');
    } finally {
      setBusy(null);
    }
  };

  const equip = async (item: ShopItem) => {
    setBusy(item.id);
    try {
      await equipItem(item.id);
      if (item.category === 'arrow_skin') onEquipArrow(item.asset_key);
      await load();
    } catch {
      setError('No se pudo equipar.');
    } finally {
      setBusy(null);
    }
  };

  if (!userId) {
    return <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4"><p className="text-[11px] font-black uppercase tracking-widest text-white/40">Inicia sesión para abrir la tienda.</p><button type="button" onClick={onBack} className="rounded-xl border border-white/15 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/60">Volver</button></div>;
  }

  return (
    <div className="w-full max-w-6xl">
      <AgeGateModal open={ageOpen} onClose={() => setAgeOpen(false)} onDeclared={() => { if (pendingPackage) void buyPackage(packages.find((pkg) => pkg.id === pendingPackage)!); }} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/50">Volver</button>
        <WalletChip points={snapshot?.wallet.points ?? 0} />
      </div>
      <div className="mb-3 flex gap-1">
        {(['packages', 'cosmetics', 'inventory'] as Tab[]).map((value) => <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-[8px] font-black uppercase tracking-widest ${tab === value ? 'bg-yellow-400/15 text-yellow-300' : 'text-white/35'}`}>{value === 'packages' ? 'Paquetes' : value === 'cosmetics' ? 'Cosméticos' : 'Inventario'}</button>)}
      </div>
      {error && <p className="mb-2 text-[10px] text-red-300">{error}</p>}
      {tab === 'packages' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{packages.map((pkg) => <button key={pkg.id} type="button" disabled={!flags.crypto || busy === pkg.id} onClick={() => void buyPackage(pkg)} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left disabled:opacity-50"><p className="text-[8px] font-black uppercase tracking-widest text-yellow-300">{pkg.badge ?? 'MZP'}</p><p className="mt-1 font-header text-xl font-black text-white">{formatMzP(pkg.points_base + pkg.bonus_points)}</p><p className="text-[10px] text-white/40">${(pkg.price_cents / 100).toFixed(2)} USD</p>{!flags.crypto && <p className="mt-2 text-[8px] uppercase tracking-widest text-white/30">Cripto desactivado</p>}</button>)}</div>}
      {tab === 'packages' && <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-widest"><span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-emerald-300">Cripto disponible</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">Tarjeta próximamente</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/30">PayPal próximamente</span></div>}
      {tab === 'cosmetics' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4"><p className="font-header text-lg font-black text-white">{item.name}</p><p className="mt-1 text-[10px] text-white/40">{item.description}</p><p className="mt-2 text-[10px] font-black text-yellow-300">{formatMzP(item.price_points)}</p><button type="button" disabled={busy === item.id || item.owned} onClick={() => item.owned ? void equip(item) : void buyItem(item)} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50">{item.owned ? (item.equippedSlot ? 'Equipado' : 'Equipar') : 'Comprar'}</button></div>)}</div>}
      {tab === 'inventory' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.filter((item) => item.owned).map((item) => <button key={item.id} type="button" onClick={() => void equip(item)} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-left"><p className="font-header text-lg font-black text-white">{item.name}</p><p className="text-[9px] uppercase tracking-widest text-emerald-300">{item.equippedSlot ?? 'Equipar'}</p></button>)}{items.every((item) => !item.owned) && <p className="text-[10px] uppercase tracking-widest text-white/30">Sin ítems todavía.</p>}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Integrate in play page**

Replace the placeholder `phase === 'tienda'` block with:

```tsx
{phase === 'tienda' && (
  <motion.div key="tienda" initial="hidden" animate="visible" exit="exit" variants={sectionVariants} className="w-full max-w-6xl">
    <StorePanel userId={user?.id ?? null} onBack={() => setPhase('hub')} onEquipArrow={(assetKey) => { setCurrentArrowSkin(assetKey); activeSetArrowSkin(assetKey); }} />
  </motion.div>
)}
```

Import `StorePanel` at the top. Change the mode entry to `locked: false` and remove `lockReason`:

```tsx
{ id: 'tienda', label: 'TIENDA', icon: I.store, desc: 'MuziPoints, skins e inventario', soon: false },
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm --filter muzicmania-website exec tsc --noEmit` and `pnpm --filter muzicmania-website build`.

```bash
git add projects/muzicmania/website/src/components/shop projects/muzicmania/website/src/app/play/page.tsx
git commit -m "feat(muzicmania): tienda de muzipoints, paquetes e inventario"
```

---

### Task 14: Pruebas de API y verificación final

**Files:**
- Create: `.opencode/temp/opencode/economy-smoke.mjs` (local, gitignored)
- Modify: none

**Interfaces:**
- Consumes: endpoints de Tasks 6–10.
- Produces: evidencia de compra, equipamiento, idempotencia y webhook.

- [ ] **Step 1: Create a local smoke script**

Use Node 24 and service-role token generation. The script reads env from `projects/muzicmania/website/.env.local`, signs a webhook with `NOWPAYMENTS_IPN_SECRET`, and never prints secrets.

```js
import { createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const env = {};
for (const line of fs.readFileSync('projects/muzicmania/website/.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
if (!ipnSecret) throw new Error('Falta NOWPAYMENTS_IPN_SECRET en el entorno local');

const TEST_USER = '56091527-f249-40d1-a80f-4da1ef103f48';
const ORDER_ID = '22222222-2222-4222-8222-222222222222';
const app = 'http://localhost:3003';
const clean = `
  delete from pagos.webhook_events where payload->>'order_id' = '${ORDER_ID}';
  delete from pagos.orders where id = '${ORDER_ID}';
  delete from muzicmania.user_inventory where user_id = '${TEST_USER}';
  delete from muzicmania.point_ledger where user_id = '${TEST_USER}' and (idempotency_key like 'payment:${ORDER_ID}%' or idempotency_key like 'shop:${TEST_USER}%' or idempotency_key = 'smoke:credit');
  delete from muzicmania.wallets where user_id = '${TEST_USER}';
`;
const sql = (query) => execFileSync('dbvr', ['sql', '-ds=supabase', query], { encoding: 'utf8' });

async function token(email) {
  const link = await fetch(`${base}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', email }),
  }).then((response) => response.json());
  const session = await fetch(`${base}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', token_hash: link.hashed_token }),
  }).then((response) => response.json());
  return session.access_token;
}

async function api(path, init = {}, tokenValue) {
  const response = await fetch(`${app}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(tokenValue ? { Authorization: `Bearer ${tokenValue}` } : {}) },
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

const accessToken = await token('bot+muzicmania@ciszunetwork.com');
sql(clean);
sql(`insert into pagos.orders (id,user_id,product_type,product_id,amount_cents,currency,points_base,points_bonus,idempotency_key) values ('${ORDER_ID}','${TEST_USER}','points_package','starter',199,'USD',200,0,'smoke:order');`);

const payload = {
  order_id: ORDER_ID,
  payment_id: 'smoke-payment-1',
  payment_status: 'finished',
  price_amount: 1.99,
  price_currency: 'usd',
  pay_currency: 'usdttrc20',
  actually_paid: 1.99,
};
const raw = JSON.stringify(payload);
const signature = createHmac('sha512', ipnSecret).update(raw).digest('hex');
const webhook = await fetch(`${app}/api/webhooks/nowpayments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': signature }, body: raw });
const duplicate = await fetch(`${app}/api/webhooks/nowpayments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': signature }, body: raw });
const walletAfter = await api('/api/economy/me', {}, accessToken);
const packages = await api('/api/shop/packages', {}, accessToken);
const items = await api('/api/shop/items', {}, accessToken);
const prism = items.data.items.find((item) => item.slug === 'prism');
sql(`select muzicmania.wallet_apply('${TEST_USER}', 1000, 'admin_adjustment', 'admin', 'smoke', 'smoke:credit', '{}');`);
const purchase = await api('/api/shop/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: prism.id }) }, accessToken);
const second = await api('/api/shop/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: prism.id }) }, accessToken);
const equip = await api('/api/shop/equip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: prism.id }) }, accessToken);
const inventory = await api('/api/economy/me', {}, accessToken);

console.log('packages-visible', packages.status === 200 && packages.data.packages.length === 6);
console.log('webhook-valid', webhook.status === 200);
console.log('webhook-duplicate', duplicate.status === 200);
console.log('wallet-credited-once', walletAfter.data.wallet.points === 200);
console.log('item-purchase-debits', purchase.status === 200 && purchase.data.points === 600);
console.log('second-purchase-idempotent', second.status === 200 && second.data.points === 600);
console.log('item-owned', inventory.data.inventory.length === 1);
console.log('equip-ok', equip.status === 200);
sql(clean);
```

- [ ] **Step 2: Run local build and smoke**

Run: `pnpm --filter muzicmania-website build`

Run: `pnpm --filter muzicmania-website start -p 3003`

Run: `node .opencode/temp/opencode/economy-smoke.mjs`

Expected: all assertions true.

- [ ] **Step 3: Clean test data**

```powershell
dbvr sql -ds=supabase "delete from pagos.webhook_events where payload->>'order_id'='22222222-2222-4222-8222-222222222222'; delete from pagos.orders where id='22222222-2222-4222-8222-222222222222'; delete from muzicmania.user_inventory where user_id='56091527-f249-40d1-a80f-4da1ef103f48'; delete from muzicmania.point_ledger where user_id='56091527-f249-40d1-a80f-4da1ef103f48' and idempotency_key in ('smoke:credit','payment:22222222-2222-4222-8222-222222222222'); delete from muzicmania.wallets where user_id='56091527-f249-40d1-a80f-4da1ef103f48';"
```

El script también ejecuta esta limpieza al inicio y al final.

- [ ] **Step 4: Verify production flags and build**

Run: `pnpm --filter muzicmania-website exec tsc --noEmit`; `pnpm --filter muzicmania-website build`.

Verify `/api/shop/packages` returns `flags.crypto=false` until env is configured; after setting env in Vercel, it returns `true`.

- [ ] **Step 5: Commit final docs/status**

```bash
git add projects/muzicmania/docs/documentation/STORE_ECONOMY_PLAN.md
git commit -m "docs(muzicmania): plan de tienda y economia"
```

---

## Ejecución

- Fase 1 produce una tienda usable con catálogo, MZP, edad 18+, compra cripto y persistencia.
- No se implementan login diario, tareas, XP, regalos, donaciones, códigos de creador ni tarjetas/PayPal en este plan; pertenecen a `STORE_ECONOMY_PHASE2/3/4`.
- Cada task debe terminar con sus pruebas y commit propios.
- Si un test falla por el entorno de Supabase, no se avanza a la siguiente task hasta corregir la migración o la lógica.
