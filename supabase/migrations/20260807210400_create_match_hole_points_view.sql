-- Hole-by-hole detail for both individual pairings (A-vs-A, B-vs-B) within
-- every match. Stroke allocation: the higher-handicap player in a pairing
-- gets strokes equal to round(|handicap difference|), on that many of the
-- round's hardest holes (lowest stroke_index), wrapping to a 2nd stroke on
-- the hardest holes again past a 9-stroke difference.
create view public.match_hole_points
with (security_invoker = true) as
with pairings as (
  select
    m.id as match_id,
    m.round_id,
    r.course_name,
    mp_a.role,
    m.team_a_id,
    mp_a.player_id as team_a_player_id,
    mp_a.handicap as team_a_handicap,
    m.team_b_id,
    mp_b.player_id as team_b_player_id,
    mp_b.handicap as team_b_handicap
  from public.matches m
  join public.rounds r on r.id = m.round_id
  join public.match_players mp_a on mp_a.match_id = m.id and mp_a.team_id = m.team_a_id
  join public.match_players mp_b
    on mp_b.match_id = m.id and mp_b.team_id = m.team_b_id and mp_b.role = mp_a.role
),
strokes as (
  select
    *,
    round(abs(team_a_handicap - team_b_handicap)) as stroke_count,
    (team_a_handicap > team_b_handicap) as team_a_is_higher
  from pairings
),
holes as (
  select
    s.*,
    ch.hole_number,
    ch.par,
    ch.stroke_index,
    floor(s.stroke_count / 9) as stroke_base,
    (s.stroke_count - floor(s.stroke_count / 9) * 9) as stroke_remainder
  from strokes s
  join public.course_holes ch on ch.course_name = s.course_name
),
allocated as (
  select
    *,
    (stroke_base + case when stroke_index <= stroke_remainder then 1 else 0 end) as higher_side_strokes
  from holes
),
with_scores as (
  select
    a.*,
    sa.strokes as team_a_gross,
    sb.strokes as team_b_gross,
    case when team_a_is_higher then higher_side_strokes else 0 end as team_a_strokes_received,
    case when team_a_is_higher then 0 else higher_side_strokes end as team_b_strokes_received
  from allocated a
  left join public.scores sa
    on sa.round_id = a.round_id and sa.player_id = a.team_a_player_id and sa.hole_number = a.hole_number
  left join public.scores sb
    on sb.round_id = a.round_id and sb.player_id = a.team_b_player_id and sb.hole_number = a.hole_number
)
select
  match_id,
  role,
  hole_number,
  par,
  stroke_index,
  team_a_player_id,
  team_b_player_id,
  team_a_gross,
  team_b_gross,
  team_a_strokes_received,
  team_b_strokes_received,
  (team_a_gross - team_a_strokes_received) as team_a_net,
  (team_b_gross - team_b_strokes_received) as team_b_net,
  case
    when team_a_gross is null or team_b_gross is null then null
    when (team_a_gross - team_a_strokes_received) < (team_b_gross - team_b_strokes_received) then 1.0
    when (team_a_gross - team_a_strokes_received) > (team_b_gross - team_b_strokes_received) then 0.0
    else 0.5
  end as team_a_hole_points,
  case
    when team_a_gross is null or team_b_gross is null then null
    when (team_a_gross - team_a_strokes_received) < (team_b_gross - team_b_strokes_received) then 0.0
    when (team_a_gross - team_a_strokes_received) > (team_b_gross - team_b_strokes_received) then 1.0
    else 0.5
  end as team_b_hole_points
from with_scores;

grant select on public.match_hole_points to authenticated;
