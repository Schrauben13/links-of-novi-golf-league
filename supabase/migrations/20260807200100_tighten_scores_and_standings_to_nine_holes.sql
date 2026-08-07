alter table public.scores drop constraint scores_hole_number_check;
alter table public.scores add constraint scores_hole_number_check check (hole_number between 1 and 9);

drop view public.standings;

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
  having count(*) = 9
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
