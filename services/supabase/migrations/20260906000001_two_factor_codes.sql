-- 2FA codes table for Ciszu Network
-- Format: C-XXX XXX
-- Expiry: 3 hours
-- Per-website codes

create table if not exists public.two_factor_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_two_factor_codes_user_website on public.two_factor_codes(user_id, website);
create index if not exists idx_two_factor_codes_code on public.two_factor_codes(code);

alter table public.two_factor_codes enable row level security;

create policy "Users can view own 2FA codes"
  on public.two_factor_codes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own 2FA codes"
  on public.two_factor_codes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own 2FA codes"
  on public.two_factor_codes for update
  to authenticated
  using (auth.uid() = user_id);

-- Allowanon to insert codes during registration/verification (for the generate endpoint)
-- Note: API routes use service_role key, which bypasses RLS
-- create policy "Allow anonymous to insert 2FA codes"
--   on public.two_factor_codes for insert
--   to anon
--   with check (true);

-- Allowanon to read codes for verification
-- Note: API routes use service_role key, which bypasses RLS
-- create policy "Allow anonymous to read 2FA codes"
--   on public.two_factor_codes for select
--   to anon
--   using (true);

-- Allowanon to update codes for verification
-- Note: API routes use service_role key, which bypasses RLS
-- create policy "Allow anonymous to update 2FA codes"
--   on public.two_factor_codes for update
--   to anon
--   using (true);
