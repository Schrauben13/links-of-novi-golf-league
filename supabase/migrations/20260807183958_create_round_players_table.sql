create table public.round_players (
  round_id uuid not null references public.rounds (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  tee_time_group int,
  primary key (round_id, player_id)
);
