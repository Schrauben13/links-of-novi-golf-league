-- Match-level aggregate: hole points (running total, live as holes get
-- decided) + the 4-point team net score (only decided once both teams have
-- completed all 9 holes, to avoid showing a premature "winner").
create view public.match_team_totals
with (security_invoker = true) as
with hole_points as (
  select
    match_id,
    coalesce(sum(team_a_hole_points), 0) as team_a_hole_points,
    coalesce(sum(team_b_hole_points), 0) as team_b_hole_points,
    count(*) filter (where team_a_hole_points is not null) as holes_decided
  from public.match_hole_points
  group by match_id
),
net_totals as (
  select
    match_id,
    sum(team_a_net) filter (where team_a_gross is not null) as team_a_net_total,
    sum(team_b_net) filter (where team_b_gross is not null) as team_b_net_total,
    count(distinct hole_number) filter (where team_a_gross is not null) as team_a_holes_played,
    count(distinct hole_number) filter (where team_b_gross is not null) as team_b_holes_played
  from public.match_hole_points
  group by match_id
),
team_net_points as (
  select
    match_id,
    case
      when team_a_holes_played < 9 or team_b_holes_played < 9 then null
      when team_a_net_total < team_b_net_total then 4.0
      when team_a_net_total > team_b_net_total then 0.0
      else 2.0
    end as team_a_net_points,
    case
      when team_a_holes_played < 9 or team_b_holes_played < 9 then null
      when team_a_net_total < team_b_net_total then 0.0
      when team_a_net_total > team_b_net_total then 4.0
      else 2.0
    end as team_b_net_points
  from net_totals
)
select
  m.id as match_id,
  m.round_id,
  m.team_a_id,
  ta.name as team_a_name,
  m.team_b_id,
  tb.name as team_b_name,
  coalesce(hp.holes_decided, 0) as holes_decided,
  coalesce(hp.team_a_hole_points, 0) as team_a_hole_points,
  coalesce(hp.team_b_hole_points, 0) as team_b_hole_points,
  tnp.team_a_net_points,
  tnp.team_b_net_points,
  (coalesce(hp.team_a_hole_points, 0) + coalesce(tnp.team_a_net_points, 0)) as team_a_total_points,
  (coalesce(hp.team_b_hole_points, 0) + coalesce(tnp.team_b_net_points, 0)) as team_b_total_points
from public.matches m
join public.teams ta on ta.id = m.team_a_id
join public.teams tb on tb.id = m.team_b_id
left join hole_points hp on hp.match_id = m.id
left join team_net_points tnp on tnp.match_id = m.id;

grant select on public.match_team_totals to authenticated;
