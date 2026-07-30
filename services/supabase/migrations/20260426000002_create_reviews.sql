-- Create reviews table
create table public.reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null unique,
    rating decimal(2,1) not null check (rating >= 0 and rating <= 5),
    comment text not null,
    is_anonymous boolean default false,
    is_verified boolean default false,
    likes_count integer default 0,
    is_edited boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Index for sorting
create index reviews_rating_idx on public.reviews(rating);
create index reviews_likes_count_idx on public.reviews(likes_count);
create index reviews_created_at_idx on public.reviews(created_at);

-- Create review_likes table for tracking interactions
create table public.review_likes (
    user_id uuid references auth.users(id) on delete cascade,
    review_id uuid references public.reviews(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (user_id, review_id)
);

-- Enable RLS
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;

-- Policies for reviews
create policy "Reviews are viewable by everyone"
on public.reviews for select
using (true);

create policy "Users can create their own review"
on public.reviews for insert
with check (auth.uid() = user_id);

create policy "Users can update their own review"
on public.reviews for update
using (auth.uid() = user_id);

-- Policies for likes
create policy "Likes are viewable by everyone"
on public.review_likes for select
using (true);

create policy "Authenticated users can like reviews"
on public.review_likes for insert
with check (auth.uid() = user_id);

create policy "Users can unlike reviews"
on public.review_likes for delete
using (auth.uid() = user_id);

-- Function to handle likes count synchronization
create or replace function public.handle_review_like()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.reviews
        set likes_count = likes_count + 1
        where id = NEW.review_id;
        return NEW;
    elsif (TG_OP = 'DELETE') then
        update public.reviews
        set likes_count = likes_count - 1
        where id = OLD.review_id;
        return OLD;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Trigger for likes
create trigger on_review_like
after insert or delete on public.review_likes
for each row execute function public.handle_review_like();

-- Function to handle review updates (reset likes)
create or replace function public.handle_review_update()
returns trigger as $$
begin
    -- Only if comment or rating changed
    if (OLD.comment <> NEW.comment or OLD.rating <> NEW.rating) then
        NEW.is_edited := true;
        NEW.likes_count := 0;
        NEW.updated_at := now();
        
        -- Delete all likes for this review
        delete from public.review_likes where review_id = NEW.id;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

create trigger on_review_update
before update on public.reviews
for each row execute function public.handle_review_update();
