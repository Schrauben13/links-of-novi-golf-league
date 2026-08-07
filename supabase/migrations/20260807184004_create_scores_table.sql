create table public.scores (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  hole_number int not null check (hole_number between 1 and 18),
  strokes int check (strokes > 0),
  updated_at timestamptz not null default now(),
  unique (round_id, player_id, hole_number)
);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger scores_set_updated_at
before update on public.scores
for each row execute function public.set_updated_at();
