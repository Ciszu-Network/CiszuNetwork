-- Add 2FA flag to profiles
alter table public.profiles
  add column if not exists two_factor_enabled boolean not null default false;

comment on column public.profiles.two_factor_enabled is 'Whether 2FA is enabled for this user';
