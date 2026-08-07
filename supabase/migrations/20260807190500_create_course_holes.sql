-- Per-hole par for each Links of Novi course. Seeded with a generic
-- placeholder par-72 layout (4 par-3s, 4 par-5s, 10 par-4s) since we don't
-- have the real scorecards for East/West/South yet -- replace these values
-- once that data is available. Everything downstream (score entry,
-- leaderboard) reads from this table, so correcting it here is all that's
-- needed.
create table public.course_holes (
  course_name text not null,
  hole_number int not null check (hole_number between 1 and 18),
  par int not null check (par between 3 and 6),
  primary key (course_name, hole_number)
);

insert into public.course_holes (course_name, hole_number, par)
select c.course_name, h.hole_number, h.par
from (values ('East'), ('West'), ('South')) as c(course_name)
cross join (values
  (1, 4), (2, 4), (3, 3), (4, 5), (5, 4), (6, 4), (7, 3), (8, 5), (9, 4),
  (10, 4), (11, 5), (12, 3), (13, 4), (14, 4), (15, 5), (16, 3), (17, 4), (18, 4)
) as h(hole_number, par);

alter table public.course_holes enable row level security;

revoke all on public.course_holes from anon, authenticated;
grant select on public.course_holes to authenticated;
grant insert, update, delete on public.course_holes to authenticated;

create policy course_holes_select_all on public.course_holes
  for select to authenticated
  using (true);

create policy course_holes_admin_write on public.course_holes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
