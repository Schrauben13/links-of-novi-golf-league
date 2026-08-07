-- Superseded by the computed public.player_handicaps view. This column
-- was already read-only in the app (no self-edit UI ships it), so this
-- is a clean cutover rather than a behavior change.
alter table public.players drop column handicap;
