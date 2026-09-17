-- ============================================================
-- REVIEWS POR SITIO (2026-09-17)
-- ------------------------------------------------------------
-- Hasta ahora solo `muzicmania` tenía las tablas `reviews` y
-- `review_likes`. Este migration replica exactamente el esquema
-- (columnas, índices, RLS, triggers y grants) en los schemas
-- `ciszunetwork`, `ciszubot` y `ciszukoantony`.
--
-- Además añade en los CUATRO schemas la política que faltaba:
-- el autor puede borrar su propia reseña y un admin (profiles.role
-- = 'admin') puede borrar cualquiera. Es idempotente.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Funciones de trigger (deben existir ANTES que los triggers)
-- ------------------------------------------------------------
do $$
declare
  s text;
  schemas text[] := array['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
begin
  foreach s in array schemas loop
    execute format($f$
      create or replace function %I.handle_review_like()
      returns trigger
      language plpgsql
      security definer
      set search_path = %I, public
      as $body$
      begin
        if (TG_OP = 'INSERT') then
          update %I.reviews set likes_count = greatest(0, coalesce(likes_count, 0) + 1) where id = NEW.review_id;
          return NEW;
        elsif (TG_OP = 'DELETE') then
          update %I.reviews set likes_count = greatest(0, coalesce(likes_count, 0) - 1) where id = OLD.review_id;
          return OLD;
        end if;
        return null;
      end;
      $body$;
    $f$, s, s, s, s);

    execute format($f$
      create or replace function %I.handle_review_update()
      returns trigger
      language plpgsql
      security definer
      set search_path = %I, public
      as $body$
      begin
        if (OLD.comment is distinct from NEW.comment or OLD.rating is distinct from NEW.rating) then
          NEW.is_edited := true;
          NEW.likes_count := 0;
          NEW.updated_at := now();
          delete from %I.review_likes where review_id = NEW.id;
        end if;
        return NEW;
      end;
      $body$;
    $f$, s, s, s);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 1. Tablas, RLS, políticas, triggers y grants
-- ------------------------------------------------------------
do $$
declare
  s text;
  schemas text[] := array['ciszunetwork', 'ciszubot', 'ciszukoantony', 'muzicmania'];
begin
  foreach s in array schemas loop
    execute format('grant usage on schema %I to anon, authenticated', s);

    -- 1.1 Tabla de reseñas
    execute format($f$
      create table if not exists %I.reviews (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null unique references auth.users(id) on delete cascade,
        rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
        comment text not null,
        is_anonymous boolean default false,
        is_verified boolean default false,
        likes_count integer default 0,
        is_edited boolean default false,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      )
    $f$, s);

    execute format('create index if not exists reviews_rating_idx on %I.reviews(rating)', s);
    execute format('create index if not exists reviews_likes_count_idx on %I.reviews(likes_count)', s);
    execute format('create index if not exists reviews_created_at_idx on %I.reviews(created_at)', s);

    -- 1.2 Tabla de likes
    execute format($f$
      create table if not exists %I.review_likes (
        user_id uuid references auth.users(id) on delete cascade,
        review_id uuid references %I.reviews(id) on delete cascade,
        created_at timestamptz default now(),
        primary key (user_id, review_id)
      )
    $f$, s, s);

    -- 1.3 RLS
    execute format('alter table %I.reviews enable row level security', s);
    execute format('alter table %I.review_likes enable row level security', s);

    -- 1.4 Políticas de reviews
    execute format('drop policy if exists "Reviews are viewable by everyone" on %I.reviews', s);
    execute format('create policy "Reviews are viewable by everyone" on %I.reviews for select using (true)', s);

    execute format('drop policy if exists "Users can create their own review" on %I.reviews', s);
    execute format('create policy "Users can create their own review" on %I.reviews for insert with check (auth.uid() = user_id)', s);

    execute format('drop policy if exists "Users can update their own review" on %I.reviews', s);
    execute format('create policy "Users can update their own review" on %I.reviews for update using (auth.uid() = user_id)', s);

    execute format('drop policy if exists "Users and admins can delete reviews" on %I.reviews', s);
    execute format($f$
      create policy "Users and admins can delete reviews" on %I.reviews for delete
      using (
        auth.uid() = user_id
        or exists (
          select 1 from %I.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        )
      )
    $f$, s, s);

    -- 1.5 Políticas de review_likes
    execute format('drop policy if exists "Likes are viewable by everyone" on %I.review_likes', s);
    execute format('create policy "Likes are viewable by everyone" on %I.review_likes for select using (true)', s);

    execute format('drop policy if exists "Authenticated users can like reviews" on %I.review_likes', s);
    execute format('create policy "Authenticated users can like reviews" on %I.review_likes for insert with check (auth.uid() = user_id)', s);

    execute format('drop policy if exists "Users can unlike reviews" on %I.review_likes', s);
    execute format('create policy "Users can unlike reviews" on %I.review_likes for delete using (auth.uid() = user_id)', s);

    -- 1.6 Triggers
    execute format('drop trigger if exists on_review_like on %I.review_likes', s);
    execute format('create trigger on_review_like after insert or delete on %I.review_likes for each row execute function %I.handle_review_like()', s, s);

    execute format('drop trigger if exists on_review_update on %I.reviews', s);
    execute format('create trigger on_review_update before update on %I.reviews for each row execute function %I.handle_review_update()', s, s);

    -- 1.7 Grants para PostgREST
    execute format('grant select, insert, update, delete on %I.reviews to anon, authenticated', s);
    execute format('grant select, insert, delete on %I.review_likes to anon, authenticated', s);
  end loop;
end $$;
