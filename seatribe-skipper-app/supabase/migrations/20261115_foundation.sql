-- Seatribe Skipper App: Fundament (am 2026-11-15 auf das Supabase-Projekt angewendet)
-- Jede Zeile gehört genau einem Konto; RLS lässt nur den Besitzer an seine Daten.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null default 'skipper' check (account_type in ('skipper', 'agentur')),
  display_name text,
  company text,
  country text not null default 'DE',
  charges_vat boolean not null default true,
  tax_number text,
  mail_mode text not null default 'kopieren' check (mail_mode in ('postfach', 'kopieren')),
  sender_email text,
  offer_defaults jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text,
  type text,
  year_built integer check (year_built between 1800 and 2200),
  flag text,
  callsign text,
  mmsi text,
  registration_no text,
  length_m numeric(5,2) check (length_m > 0),
  beam_m numeric(5,2) check (beam_m > 0),
  draft_m numeric(5,2) check (draft_m > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  boat_id uuid references public.boats (id) on delete set null,
  owner_id uuid references public.owners (id) on delete set null,
  from_port text not null,
  to_port text not null,
  planned_start date,
  modules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index boats_user_id_idx on public.boats (user_id);
create index owners_user_id_idx on public.owners (user_id);
create index deliveries_user_id_idx on public.deliveries (user_id);
create index deliveries_boat_id_idx on public.deliveries (boat_id);
create index deliveries_owner_id_idx on public.deliveries (owner_id);

alter table public.profiles enable row level security;
alter table public.boats enable row level security;
alter table public.owners enable row level security;
alter table public.deliveries enable row level security;

create policy "profiles: eigenes lesen" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles: eigenes ändern" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "boats: eigene" on public.boats for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "owners: eigene" on public.owners for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "deliveries: eigene" on public.deliveries for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.profiles, public.boats, public.owners, public.deliveries from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.boats, public.owners, public.deliveries to authenticated;

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger boats_updated before update on public.boats for each row execute function public.set_updated_at();
create trigger owners_updated before update on public.owners for each row execute function public.set_updated_at();
create trigger deliveries_updated before update on public.deliveries for each row execute function public.set_updated_at();

-- Bei jeder Registrierung automatisch ein Profil anlegen
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
