-- Season standings, computed live from scores on completed rounds.
-- "points" is currently a placeholder equal to total strokes (lower is better,
-- standard stroke play) since the league hasn't defined a points formula yet
-- (e.g. Ryder Cup style, Stableford). Swap the points expression here once
-- the real scoring rules are decided -- everything downstream just reads
-- this view, so no other migration needs to change.
create view public.standings
with (security_invoker = true) as
select
  p.id as player_id,
  p.name,
  count(distinct r.id) as rounds_played,
  coalesce(sum(s.strokes) filter (where r.id is not null), 0) as points
from public.players p
left join public.scores s on s.player_id = p.id
left join public.rounds r on r.id = s.round_id and r.status = 'completed'
where p.approved = true
group by p.id, p.name;
