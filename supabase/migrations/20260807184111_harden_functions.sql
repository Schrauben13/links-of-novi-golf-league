-- Pin search_path (was flagged as mutable).
alter function public.set_updated_at() set search_path = public;

-- handle_new_user is only meant to run as the auth.users trigger, never
-- called directly via the PostgREST RPC surface.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- is_admin/current_player_id/approve_player are used by RLS policies and by
-- future admin UI code, but only for signed-in users -- anon has no
-- auth.uid() anyway, so drop its access to the RPC endpoint entirely.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.current_player_id() from public, anon;
revoke all on function public.approve_player(uuid) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_player_id() to authenticated;
grant execute on function public.approve_player(uuid) to authenticated;
