-- Superseded by matches/match_players (explicit opponent pairing replaces
-- the old arbitrary tee_time_group clustering) and by the new match-points
-- views (replacing "rank vs the whole field" standings, which isn't a
-- coherent concept once a round hosts several independent 2-team matches).
drop table if exists public.round_players cascade;
drop view if exists public.standings;
drop function if exists public.points_for_position(int);
