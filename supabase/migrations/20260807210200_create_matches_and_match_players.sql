create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  team_a_id uuid not null references public.teams (id),
  team_b_id uuid not null references public.teams (id),
  created_at timestamptz not null default now(),
  check (team_a_id <> team_b_id)
);

create index matches_round_id_idx on public.matches (round_id);

alter table public.matches enable row level security;
grant select on public.matches to authenticated;
grant insert, update, delete on public.matches to authenticated;

create policy matches_select_all on public.matches
  for select to authenticated
  using (true);

create policy matches_admin_write on public.matches
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- One row per player-in-a-match: their team, A/B role, and the handicap
-- frozen for this match (pre-filled from player_handicaps at setup time for
-- regular members, always admin-entered for guests/substitutes so results
-- never drift as more rounds get played later).
create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  team_id uuid not null references public.teams (id),
  player_id uuid not null references public.players (id),
  role text not null check (role in ('A', 'B')),
  handicap numeric(4, 1) not null,
  is_substitute boolean not null default false,
  unique (match_id, team_id, role),
  unique (match_id, player_id)
);

alter table public.match_players enable row level security;
grant select on public.match_players to authenticated;
grant insert, update, delete on public.match_players to authenticated;

create policy match_players_select_all on public.match_players
  for select to authenticated
  using (true);

create policy match_players_admin_write on public.match_players
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
