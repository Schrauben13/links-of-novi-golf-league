-- Per-player, per-completed-round gross score history. Standalone view --
-- doesn't replace or touch player_handicaps' own internal computation
-- (which stays exactly as-is), just exposes the same underlying data as
-- its own reusable, queryable "scoring history".
create view public.player_round_scores
with (security_invoker = true) as
select
  s.player_id,
  s.round_id,
  r.date,
  r.course_name,
  sum(s.strokes) as gross_strokes,
  cp.total_par as par,
  sum(s.strokes) - cp.total_par as differential
from public.scores s
join public.rounds r on r.id = s.round_id and r.status = 'completed'
join (
  select course_name, sum(par) as total_par
  from public.course_holes
  group by course_name
) cp on cp.course_name = r.course_name
where s.strokes is not null
group by s.player_id, s.round_id, r.date, r.course_name, cp.total_par
having count(*) = 9;

grant select on public.player_round_scores to authenticated;
