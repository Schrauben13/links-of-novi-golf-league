create table public.handicap_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  handicap numeric(4, 1) not null,
  rounds_in_window int not null,
  recorded_at timestamptz not null default now()
);

create index handicap_history_player_id_idx on public.handicap_history (player_id, recorded_at desc);

alter table public.handicap_history enable row level security;

revoke all on public.handicap_history from anon, authenticated;
grant select on public.handicap_history to authenticated;
grant insert on public.handicap_history to authenticated;

create policy handicap_history_select_all on public.handicap_history
  for select to authenticated
  using (true);

create policy handicap_history_admin_insert on public.handicap_history
  for insert to authenticated
  with check (public.is_admin());

-- Snapshots every player's CURRENT live handicap (from player_handicaps,
-- unchanged/still-live formula) into handicap_history. player_handicaps
-- itself is never cached -- this just logs a point-in-time copy of it for
-- trend display. Players below the minimum-rounds threshold (handicap is
-- null) have nothing meaningful to log yet, so they're skipped.
create function public.recalculate_handicaps()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can recalculate handicaps';
  end if;

  insert into public.handicap_history (player_id, handicap, rounds_in_window)
  select player_id, handicap, rounds_in_window
  from public.player_handicaps
  where handicap is not null;
end;
$$;

revoke all on function public.recalculate_handicaps() from public, anon;
grant execute on function public.recalculate_handicaps() to authenticated;
