-- Schritt 3b: Aufträge aus HubSpot. Die Überführung merkt sich Deal, Auftrags-ID und Stufe.
-- Preise und Tage liegen getrennt in delivery_terms; diese Tabelle sieht nur, wem die Überführung gehört (die Agentur).

alter table public.deliveries
  add column hubspot_deal_id text,
  add column order_no text,
  add column hubspot_stage text,
  add column when_text text,
  add column hubspot_synced_at timestamptz;

create unique index deliveries_hubspot_deal_idx on public.deliveries (user_id, hubspot_deal_id) where hubspot_deal_id is not null;

create table public.delivery_terms (
  delivery_id uuid primary key references public.deliveries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_terms enable row level security;

create policy "delivery_terms: eigene lesen" on public.delivery_terms for select to authenticated using (user_id = (select auth.uid()));
create policy "delivery_terms: eigene anlegen" on public.delivery_terms for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.deliveries d where d.id = delivery_id and d.user_id = (select auth.uid())));
create policy "delivery_terms: eigene ändern" on public.delivery_terms for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "delivery_terms: eigene löschen" on public.delivery_terms for delete to authenticated using (user_id = (select auth.uid()));

create trigger delivery_terms_set_updated_at before update on public.delivery_terms for each row execute function public.set_updated_at();

-- Der Skipper bekommt zusätzlich Auftrags-ID, Terminangabe und einen groben Status. Die Stufe selbst nicht:
-- ihre Namen verraten den Zahlungsstand zwischen Seatribe und Eigner.
drop function public.my_assignments();

create function public.my_assignments()
returns table (
  id uuid, from_port text, to_port text, planned_start date, when_text text, order_no text, status text, assigned_at timestamptz, agency_name text,
  boat_name text, boat_type text, year_built integer, flag text, callsign text, mmsi text, registration_no text,
  length_m numeric, beam_m numeric, draft_m numeric,
  owner_name text, owner_phone text, owner_email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.from_port, d.to_port, d.planned_start, d.when_text, d.order_no,
         case when d.hubspot_stage in ('222653147', '415367903') then 'abgeschlossen'
              when d.hubspot_stage = '262137847' then 'unterwegs'
              else 'geplant' end,
         d.assigned_at, coalesce(a.company, a.display_name),
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
