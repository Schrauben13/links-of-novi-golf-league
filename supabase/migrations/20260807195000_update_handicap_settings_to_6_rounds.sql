-- Switched from "best 8 of last 15-20 rounds" to "best 4 of last 6 rounds"
-- per league decision -- smaller window, proportionally smaller trim.
alter table public.handicap_settings alter column lookback_rounds set default 6;
alter table public.handicap_settings alter column minimum_rounds set default 6;
alter table public.handicap_settings alter column best_count set default 4;

update public.handicap_settings
set lookback_rounds = 6, minimum_rounds = 6, best_count = 4, updated_at = now()
where id = true;
