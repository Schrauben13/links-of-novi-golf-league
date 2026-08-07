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
  having count(*) = 18
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
