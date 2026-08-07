create table public.players (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  name text not null,
  handicap numeric(4, 1),
  email text not null unique,
  approved boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.players is 'League players. One row per signed-up user; approved must be flipped true by an admin before the player is treated as an active league member.';
comment on column public.players.approved is 'Set true by an admin (via the approve_player() function) to activate a self-registered player.';
