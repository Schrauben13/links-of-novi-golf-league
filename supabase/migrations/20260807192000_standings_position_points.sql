-- Points-per-finish-position lookup for season standings. Scale: 10/8/6/5/4/3/2,
-- then a flat 1 point for 8th place and below. Pure function, no table access.
create function public.points_for_position(pos int)
returns numeric
language sql
immutable
as $$
  select case
    when pos = 1 then 10
    when pos = 2 then 8
    when pos = 3 then 6
    when pos = 4 then 5
    when pos = 5 then 4
    when pos = 6 then 3
    when pos = 7 then 2
    else 1
  end;
$$;

drop view if exists public.standings;

-- Season standings: position-based points per completed round, gross scores
-- (no handicap engine yet -- swapping to net later only means changing what
-- round_totals.total_strokes sums, not this ranking/points logic).
-- A player only earns points for a round if they posted a full 18-hole card
-- on a round marked 'completed'. Ties share the average of the points for
-- the range of positions they occupy (standard competition/tie-split rules).
create view public.standings
with (security_invoker = true) as
with round_totals as (
  select
    s.round_id,
    s.player_id,
    sum(s.strokes) as total_strokes
  from public.scores s
  join public.rounds r on r.id = s.round_id and r.status = 'completed'
  where s.strokes is not null
  group by s.round_id, s.player_id
  having count(*) = 18
),
ranked as (
  select
    round_id,
    player_id,
    rank() over (partition by round_id order by total_strokes asc) as position,
    count(*) over (partition by round_id, total_strokes) as tie_count
  from round_totals
),
scored as (
  select
    round_id,
    player_id,
    (
      select avg(public.points_for_position(p::int))
      from generate_series(position, position + tie_count - 1) as p
    ) as points
  from ranked
)
select
  p.id as player_id,
  p.name,
  count(sc.round_id) as rounds_played,
  coalesce(sum(sc.points), 0) as points
from public.players p
left join scored sc on sc.player_id = p.id
where p.approved = true
group by p.id, p.name;

grant select on public.standings to authenticated;
