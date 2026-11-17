-- Schritt 3a: Die Agentur weist einer Überführung einen bestätigten Skipper zu.
-- Der Skipper liest seinen Auftrag über eine Funktion, die nur die für ihn bestimmten
-- Angaben herausgibt (keine Anschrift des Eigners, später keine Preise).

alter table public.deliveries
  add column assigned_skipper_id uuid references public.profiles (id) on delete set null,
  add column assigned_at timestamptz;

create index deliveries_assigned_skipper_idx on public.deliveries (assigned_skipper_id);

-- Zuweisen darf nur eine Agentur, und nur an einen bestätigten Skipper.
create or replace function public.check_delivery_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assigned_skipper_id is null then
    new.assigned_at := null;
    return new;
  end if;
  if tg_op = 'UPDATE' and new.assigned_skipper_id is not distinct from old.assigned_skipper_id then
    return new;
  end if;
  if not exists (select 1 from public.profiles p where p.id = new.user_id and p.role = 'agentur') then
    raise exception 'Nur die Agentur kann einen Skipper zuweisen.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = new.assigned_skipper_id and p.role = 'skipper' and p.seatribe_status = 'bestaetigt') then
    raise exception 'Dieser Skipper ist nicht bestätigt.' using errcode = '23514';
  end if;
  new.assigned_at := now();
  return new;
end;
$$;

revoke all on function public.check_delivery_assignment() from public, anon, authenticated;

create trigger deliveries_check_assignment
  before insert or update of assigned_skipper_id, user_id on public.deliveries
  for each row execute function public.check_delivery_assignment();

-- Aufträge des angemeldeten Skippers. Verliert er die Bestätigung, sieht er sie nicht mehr.
create or replace function public.my_assignments()
returns table (
  id uuid, from_port text, to_port text, planned_start date, assigned_at timestamptz, agency_name text,
  boat_name text, boat_type text, year_built integer, flag text, callsign text, mmsi text, registration_no text,
  length_m numeric, beam_m numeric, draft_m numeric,
  owner_name text, owner_phone text, owner_email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.from_port, d.to_port, d.planned_start, d.assigned_at, coalesce(a.company, a.display_name),
         b.name, b.type, b.year_built, b.flag, b.callsign, b.mmsi, b.registration_no, b.length_m, b.beam_m, b.draft_m,
         o.name, o.phone, o.email
  from public.deliveries d
  join public.profiles me on me.id = d.assigned_skipper_id
  left join public.profiles a on a.id = d.user_id
  left join public.boats b on b.id = d.boat_id
  left join public.owners o on o.id = d.owner_id
  where d.assigned_skipper_id = (select auth.uid())
    and me.seatribe_status = 'bestaetigt'
  order by d.planned_start nulls last, d.assigned_at desc;
$$;

revoke all on function public.my_assignments() from public, anon;
grant execute on function public.my_assignments() to authenticated;
