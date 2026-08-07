-- Column grants are role-level, not row-level -- granting UPDATE(team_id) to
-- authenticated would let players_update_self_or_admin's self-row branch
-- cover team_id too, letting a player reassign their own team. Revoke it and
-- use an admin-checked function instead, same pattern as approve_player().
revoke update (team_id) on public.players from authenticated;

create function public.set_player_team(target_player_id uuid, new_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign a player to a team';
  end if;
  update public.players set team_id = new_team_id where id = target_player_id;
end;
$$;

revoke all on function public.set_player_team(uuid, uuid) from public, anon;
grant execute on function public.set_player_team(uuid, uuid) to authenticated;
