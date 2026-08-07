-- Replaces the old individual "standings" (rank vs. the whole field, which
-- no longer makes sense once a round hosts several independent matches)
-- with per-player career stats: handicap, rounds played, scoring average,
-- and their personal record in their individual A/B pairings (separate
-- from whether their team won the overall match).
create view public.player_stats
with (security_invoker = true) as
with round_totals as (
  select
    s.round_id,
    s.player_id,
    r.date,
    sum(s.strokes) as total_strokes
  from public.scores s
  join public.rounds r on r.id = s.round_id and r.status = 'completed'
  where s.strokes is not null
  group by s.round_id, s.player_id, r.date
  having count(*) = 9
),
scoring as (
  select player_id, count(*) as rounds_played, round(avg(total_strokes), 1) as scoring_average
  from round_totals
  group by player_id
),
pairing_totals as (
  select
    match_id, role, team_a_player_id as player_id,
    sum(team_a_hole_points) as points_for, sum(team_b_hole_points) as points_against,
    count(*) filter (where team_a_hole_points is not null) as holes_decided
  from public.match_hole_points
  group by match_id, role, team_a_player_id
  union all
  select
    match_id, role, team_b_player_id as player_id,
    sum(team_b_hole_points) as points_for, sum(team_a_hole_points) as points_against,
    count(*) filter (where team_a_hole_points is not null) as holes_decided
  from public.match_hole_points
  group by match_id, role, team_b_player_id
),
pairing_results as (
  select
    player_id,
    points_for,
    holes_decided,
    case
      when holes_decided < 9 then null
      when points_for > points_against then 'win'
      when points_for < points_against then 'loss'
      else 'halve'
    end as result
  from pairing_totals
),
match_record as (
  select
    player_id,
    count(*) filter (where result = 'win') as match_wins,
    count(*) filter (where result = 'loss') as match_losses,
    count(*) filter (where result = 'halve') as match_halves,
    coalesce(sum(points_for), 0) as total_hole_points
  from pairing_results
  group by player_id
)
select
  p.id as player_id,
  p.name,
  ph.handicap,
  coalesce(sc.rounds_played, 0) as rounds_played,
  sc.scoring_average,
  coalesce(mr.match_wins, 0) as match_wins,
  coalesce(mr.match_losses, 0) as match_losses,
  coalesce(mr.match_halves, 0) as match_halves,
  coalesce(mr.total_hole_points, 0) as total_hole_points
from public.players p
left join public.player_handicaps ph on ph.player_id = p.id
left join scoring sc on sc.player_id = p.id
left join match_record mr on mr.player_id = p.id
where p.approved = true and p.is_guest = false;

grant select on public.player_stats to authenticated;
