-- Default replica identity only includes the primary key (id) in the "old"
-- record of realtime UPDATE/DELETE payloads. The leaderboard needs
-- round_id/player_id/hole_number on delete (clearing a hole clears its
-- score row) to know which cell to remove client-side, so we need the
-- full old row.
alter table public.scores replica identity full;
