-- Rollen (Agentur / Skipper), Skipper-Profil, Nachweise mit geschütztem Dateispeicher.
-- Angewendet am 2026-11-17.

-- Hilfsfunktionen liegen in einem Schema, das nicht über die API erreichbar ist.
create schema if not exists private;
grant usage on schema private to authenticated;

alter table public.profiles
  add column role text not null default 'skipper' check (role in ('skipper', 'agentur')),
  add column seatribe_status text not null default 'neu' check (seatribe_status in ('neu', 'bestaetigt', 'abgelehnt')),
  add column seatribe_status_at timestamptz,
  add column email text,
  add column phone text,
  add column street text,
  add column postal_code text,
  add column city text,
  add column nationality text,
  add column birth_date date,
  add column highest_licence text,
  add column licence_number text,
  add column emergency_contact text;

update public.profiles p set email = u.email from auth.users u where u.id = p.id;

-- Ist das angemeldete Konto die Agentur? Liest ohne RLS, damit Regeln sich nicht selbst aufrufen.
create function private.is_agency() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'agentur');
$$;
revoke execute on function private.is_agency() from public, anon;
grant execute on function private.is_agency() to authenticated;

-- Rolle und Bestätigung darf niemand an sich selbst ändern: Schreibrecht nur auf einzelne Spalten.
revoke update on public.profiles from authenticated;
-- account_type bleibt schreibbar, damit die bereits veröffentlichte Fassung weiter speichern kann; es steuert keine Rechte.
grant update (account_type, display_name, company, country, charges_vat, tax_number, mail_mode, sender_email, offer_defaults,
              phone, street, postal_code, city, nationality, birth_date, highest_licence, licence_number, emergency_contact)
  on public.profiles to authenticated;

create policy "profiles: agentur liest alle" on public.profiles for select to authenticated using ((select private.is_agency()));

-- Die Agentur bestätigt einen Skipper oder nimmt die Bestätigung zurück.
create function public.set_skipper_status(skipper_id uuid, new_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_agency() then
    raise exception 'Nur die Agentur darf Skipper bestätigen.' using errcode = '42501';
  end if;
  if new_status not in ('neu', 'bestaetigt', 'abgelehnt') then
    raise exception 'Unbekannter Status.' using errcode = '22023';
  end if;
  update public.profiles set seatribe_status = new_status, seatribe_status_at = now()
    where id = skipper_id and role = 'skipper';
end $$;
revoke execute on function public.set_skipper_status(uuid, text) from public, anon;
grant execute on function public.set_skipper_status(uuid, text) to authenticated;

-- Neues Konto: Profil mit E-Mail anlegen.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

-- Nachweise des Skippers (Ausweis, Pass, Scheine, Versicherung).
create table public.skipper_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('personalausweis', 'reisepass', 'segelschein', 'funkschein', 'pyroschein', 'haftpflicht', 'sonstiges')),
  file_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  valid_until date,
  created_at timestamptz not null default now()
);
create index skipper_documents_user_id_idx on public.skipper_documents (user_id);
alter table public.skipper_documents enable row level security;
revoke all on public.skipper_documents from anon;
grant select, insert, delete on public.skipper_documents to authenticated;

create policy "nachweise: eigene lesen" on public.skipper_documents for select to authenticated using (user_id = (select auth.uid()));
create policy "nachweise: eigene anlegen" on public.skipper_documents for insert to authenticated
  with check (user_id = (select auth.uid()) and file_path like (select auth.uid())::text || '/%');
create policy "nachweise: eigene löschen" on public.skipper_documents for delete to authenticated using (user_id = (select auth.uid()));
create policy "nachweise: agentur liest alle" on public.skipper_documents for select to authenticated using ((select private.is_agency()));

-- Privater Dateispeicher: Pfad beginnt immer mit der Konto-ID des Skippers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('skipper-docs', 'skipper-docs', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "skipper-docs: eigene lesen" on storage.objects for select to authenticated
  using (bucket_id = 'skipper-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "skipper-docs: eigene hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'skipper-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "skipper-docs: eigene löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'skipper-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "skipper-docs: agentur liest alle" on storage.objects for select to authenticated
  using (bucket_id = 'skipper-docs' and (select private.is_agency()));
