-- security definer so these can read public.players without recursing into
-- that table's own RLS policies.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.players where auth_user_id = auth.uid()), false);
$$;

create function public.current_player_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.players where auth_user_id = auth.uid();
$$;

-- The only way approved/is_admin can change: an admin calls this explicitly.
-- Plain UPDATEs on players can't touch those columns (see column grants below),
-- so a player can never self-approve or self-promote.
create function public.approve_player(target_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve players';
  end if;
  update public.players set approved = true where id = target_player_id;
end;
$$;
