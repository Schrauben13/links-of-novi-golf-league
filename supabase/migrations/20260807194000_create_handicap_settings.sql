-- Singleton table (single row, id always true) holding the league's
-- handicap formula parameters, admin-editable.
-- Handicap = avg(best `best_count` differentials among the most recent
-- `lookback_rounds` completed rounds) * percentage_factor, once a player
-- has at least `minimum_rounds` qualifying rounds. Differential for a
-- round = player's total strokes - course par (gross; no rating/slope yet).
create table public.handicap_settings (
  id boolean primary key default true check (id),
  lookback_rounds int not null default 20 check (lookback_rounds > 0),
  minimum_rounds int not null default 15 check (minimum_rounds > 0 and minimum_rounds <= lookback_rounds),
  best_count int not null default 8 check (best_count > 0 and best_count <= minimum_rounds),
  percentage_factor numeric not null default 0.8 check (percentage_factor > 0 and percentage_factor <= 1),
  updated_at timestamptz not null default now()
);

insert into public.handicap_settings (id) values (true);

alter table public.handicap_settings enable row level security;

revoke all on public.handicap_settings from anon, authenticated;
grant select on public.handicap_settings to authenticated;
grant update (lookback_rounds, minimum_rounds, best_count, percentage_factor, updated_at)
  on public.handicap_settings to authenticated;

create policy handicap_settings_select_all on public.handicap_settings
  for select to authenticated
  using (true);

create policy handicap_settings_admin_write on public.handicap_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
