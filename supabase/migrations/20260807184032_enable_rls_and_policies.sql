alter table public.players enable row level security;
alter table public.rounds enable row level security;
alter table public.round_players enable row level security;
alter table public.scores enable row level security;

-- Require login: revoke the default anon/authenticated grants Supabase
-- applies to new tables, then grant back explicitly per-role below.
revoke all on public.players, public.rounds, public.round_players, public.scores, public.standings
  from anon, authenticated;

-- players: everyone signed in can read the roster; a player can insert their
-- own row (belt-and-suspenders alongside the auth trigger) and edit only
-- name/handicap on their own row. approved/is_admin are excluded from the
-- column grant, so only approve_player() (security definer) can change them.
grant select on public.players to authenticated;
grant insert on public.players to authenticated;
grant update (name, handicap) on public.players to authenticated;

create policy players_select_all on public.players
  for select to authenticated
  using (true);

create policy players_insert_self on public.players
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

create policy players_update_self_or_admin on public.players
  for update to authenticated
  using (auth.uid() = auth_user_id or public.is_admin())
  with check (auth.uid() = auth_user_id or public.is_admin());

-- rounds: everyone reads, only admins manage the schedule.
grant select, insert, update, delete on public.rounds to authenticated;

create policy rounds_select_all on public.rounds
  for select to authenticated
  using (true);

create policy rounds_admin_write on public.rounds
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- round_players: everyone reads tee groupings, only admins set them.
grant select, insert, update, delete on public.round_players to authenticated;

create policy round_players_select_all on public.round_players
  for select to authenticated
  using (true);

create policy round_players_admin_write on public.round_players
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- scores: everyone reads all scores; a player may only write rows where
-- player_id is their own player row (admins can write any, for corrections).
grant select, insert, update, delete on public.scores to authenticated;

create policy scores_select_all on public.scores
  for select to authenticated
  using (true);

create policy scores_write_own on public.scores
  for all to authenticated
  using (player_id = public.current_player_id() or public.is_admin())
  with check (player_id = public.current_player_id() or public.is_admin());

-- standings is a security_invoker view over the tables above, so it
-- inherits their RLS; it just needs the base SELECT grant.
grant select on public.standings to authenticated;
