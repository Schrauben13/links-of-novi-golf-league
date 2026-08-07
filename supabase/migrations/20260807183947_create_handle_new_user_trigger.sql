-- Auto-creates a players row whenever someone completes Supabase Auth signup.
-- The bootstrap admin email is pre-approved and marked admin so there's at least
-- one admin able to approve everyone else once an admin UI exists.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_bootstrap_admin boolean := new.email = 'nathan.schrauben@gmail.com';
begin
  insert into public.players (auth_user_id, name, email, approved, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    is_bootstrap_admin,
    is_bootstrap_admin
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
