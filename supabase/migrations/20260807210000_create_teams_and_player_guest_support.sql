create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;
grant select on public.teams to authenticated;
grant insert, update, delete on public.teams to authenticated;

create policy teams_select_all on public.teams
  for select to authenticated
  using (true);

create policy teams_admin_write on public.teams
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Season-long roster assignment (no season table -- one ongoing roster).
alter table public.players add column team_id uuid references public.teams (id) on delete set null;

-- Guests: subs who never sign up. email relaxed to nullable (multiple NULLs
-- are already distinct under a unique index, so no constraint conflict).
alter table public.players add column is_guest boolean not null default false;
alter table public.players alter column email drop not null;

comment on column public.players.is_guest is 'True for admin-created substitute players who have no login and no computed handicap -- their match handicap is always entered manually.';

-- players_insert_self requires auth.uid() = auth_user_id, which a guest row
-- (auth_user_id null) can never satisfy for anyone. Admins need a separate
-- path to create guest rows.
create policy players_insert_guest_by_admin on public.players
  for insert to authenticated
  with check (auth_user_id is null and is_guest = true and public.is_admin());

grant update (team_id) on public.players to authenticated;
