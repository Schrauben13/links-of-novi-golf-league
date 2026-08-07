-- Replaces the generic par-72 placeholder with the real Links of Novi
-- scorecard. The league only ever plays 9 holes per round (confirmed with
-- the league: "18 holes will never be used"), so each of East/South/West
-- is a standalone 9-hole round, not one-third of an 18-hole combo.
-- CASCADE also drops player_handicaps (depends on course_holes for par);
-- recreated identically below.
drop table if exists public.course_holes cascade;

create table public.course_holes (
  course_name text not null,
  hole_number int not null check (hole_number between 1 and 9),
  par int not null check (par between 3 and 5),
  stroke_index int not null check (stroke_index between 1 and 9),
  yards_blue int check (yards_blue > 0),
  yards_white int check (yards_white > 0),
  primary key (course_name, hole_number),
  unique (course_name, stroke_index)
);

insert into public.course_holes (course_name, hole_number, par, stroke_index, yards_blue, yards_white) values
  ('East', 1, 4, 9, 325, 316),
  ('East', 2, 4, 2, 451, 421),
  ('East', 3, 4, 6, 310, 270),
  ('East', 4, 4, 1, 418, 377),
  ('East', 5, 3, 5, 205, 175),
  ('East', 6, 5, 4, 520, 498),
  ('East', 7, 4, 8, 339, 293),
  ('East', 8, 3, 7, 221, 200),
  ('East', 9, 4, 3, 413, 399),
  ('South', 1, 4, 6, 389, 376),
  ('South', 2, 3, 3, 220, 210),
  ('South', 3, 3, 8, 158, 149),
  ('South', 4, 4, 7, 320, 311),
  ('South', 5, 4, 1, 420, 410),
  ('South', 6, 4, 4, 328, 319),
  ('South', 7, 4, 2, 350, 335),
  ('South', 8, 3, 9, 105, 99),
  ('South', 9, 5, 5, 515, 495),
  ('West', 1, 4, 3, 464, 452),
  ('West', 2, 4, 4, 336, 323),
  ('West', 3, 5, 1, 521, 490),
  ('West', 4, 3, 9, 151, 130),
  ('West', 5, 4, 2, 450, 434),
  ('West', 6, 5, 7, 481, 470),
  ('West', 7, 4, 8, 317, 293),
  ('West', 8, 3, 5, 205, 193),
  ('West', 9, 4, 6, 362, 350);

alter table public.course_holes enable row level security;

revoke all on public.course_holes from anon, authenticated;
grant select on public.course_holes to authenticated;
grant insert, update, delete on public.course_holes to authenticated;

create policy course_holes_select_all on public.course_holes
  for select to authenticated
  using (true);

create policy course_holes_admin_write on public.course_holes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Recreate player_handicaps (dropped by CASCADE), definition unchanged
-- except the full-card requirement, updated to 9 holes.
create view public.player_handicaps
with (security_invoker = true) as
with settings as (
  select lookback_rounds, minimum_rounds, best_count, percentage_factor
  from public.handicap_settings
  limit 1
),
course_pars as (
  select course_name, sum(par) as total_par
  from public.course_holes
  group by course_name
),
round_totals as (
  select
    s.round_id,
    s.player_id,
    r.date,
    sum(s.strokes) - cp.total_par as differential
  from public.scores s
  join public.rounds r on r.id = s.round_id and r.status = 'completed'
  join course_pars cp on cp.course_name = r.course_name
  where s.strokes is not null
  group by s.round_id, s.player_id, r.date, cp.total_par
  having count(*) = 9
),
windowed as (
  select
    player_id,
    differential,
    row_number() over (partition by player_id order by date desc) as recency_rank
  from round_totals
),
in_window as (
  select w.player_id, w.differential
  from windowed w
  cross join settings
  where w.recency_rank <= settings.lookback_rounds
),
window_counts as (
  select player_id, count(*) as rounds_in_window
  from in_window
  group by player_id
),
best_ranked as (
  select
    player_id,
    differential,
    row_number() over (partition by player_id order by differential asc) as best_rank
  from in_window
),
best_avg as (
  select br.player_id, avg(br.differential) as avg_best_differential
  from best_ranked br
  cross join settings
  where br.best_rank <= settings.best_count
  group by br.player_id
)
select
  p.id as player_id,
  p.name,
  coalesce(wc.rounds_in_window, 0) as rounds_in_window,
  settings.minimum_rounds,
  case
    when coalesce(wc.rounds_in_window, 0) >= settings.minimum_rounds
      then round(ba.avg_best_differential * settings.percentage_factor, 1)
    else null
  end as handicap
from public.players p
cross join settings
left join window_counts wc on wc.player_id = p.id
left join best_avg ba on ba.player_id = p.id
where p.approved = true;

grant select on public.player_handicaps to authenticated;
