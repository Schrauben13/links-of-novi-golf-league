create type public.round_status as enum ('upcoming', 'live', 'completed');

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  course_name text not null,
  tee_time timestamptz,
  status public.round_status not null default 'upcoming',
  created_at timestamptz not null default now()
);
