-- Season-cumulative TEAM standings (the "Standings" tab), separate from
-- player_stats (individual career stats, still available elsewhere).
-- Only counts matches whose round is 'completed' -- same convention as
-- player_stats/player_handicaps, so a live/in-progress match doesn't
-- prematurely inflate season standings before it's actually decided.
create view public.team_standings
with (security_invoker = true) as
with completed_matches as (
  select mtt.*
  from public.match_team_totals mtt
  join public.rounds r on r.id = mtt.round_id
  where r.status = 'completed'
),
team_results as (
  select team_a_id as team_id, team_a_total_points as points_for, team_b_total_points as points_against
  from completed_matches
  union all
  select team_b_id as team_id, team_b_total_points as points_for, team_a_total_points as points_against
  from completed_matches
)
select
  t.id as team_id,
  t.name,
  count(tr.team_id) as matches_played,
  coalesce(sum(tr.points_for), 0) as points,
  count(*) filter (where tr.points_for > tr.points_against) as wins,
  count(*) filter (where tr.points_for < tr.points_against) as losses,
  count(*) filter (where tr.points_for = tr.points_against) as ties
from public.teams t
left join team_results tr on tr.team_id = t.id
group by t.id, t.name;

grant select on public.team_standings to authenticated;
