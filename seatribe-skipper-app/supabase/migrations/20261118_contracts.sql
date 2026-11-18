-- Schritt 4a: Vertrag mit dem Eigner. Anzahlungsregel und Unterschrift im Konto, Ablage der Verträge.

alter table public.profiles
  add column deposit_rule jsonb not null default '{"admin": 100, "honorar": 50, "logistik": 50}'::jsonb,
  add column signature_data text check (signature_data is null or length(signature_data) < 400000);

grant update (deposit_rule, signature_data) on public.profiles to authenticated;

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('eigner', 'skipper')),
  file_path text not null unique,
  file_name text not null,
  signed_path text unique,
  signed_name text,
  signed_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index contracts_delivery_idx on public.contracts (delivery_id);

alter table public.contracts enable row level security;

create policy "contracts: eigene lesen" on public.contracts for select to authenticated using (user_id = (select auth.uid()));
create policy "contracts: eigene anlegen" on public.contracts for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and file_path like (select auth.uid())::text || '/%'
    and exists (select 1 from public.deliveries d where d.id = delivery_id and d.user_id = (select auth.uid()))
  );
create policy "contracts: eigene ändern" on public.contracts for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (signed_path is null or signed_path like (select auth.uid())::text || '/%'));
create policy "contracts: eigene löschen" on public.contracts for delete to authenticated using (user_id = (select auth.uid()));

-- Privater Speicher für erzeugte und unterschriebene Verträge. Jeder kommt nur an den eigenen Ordner.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contracts', 'contracts', false, 15728640, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "contracts: eigenen Ordner lesen" on storage.objects for select to authenticated
  using (bucket_id = 'contracts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "contracts: in eigenen Ordner laden" on storage.objects for insert to authenticated
  with check (bucket_id = 'contracts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "contracts: im eigenen Ordner löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'contracts' and (storage.foldername(name))[1] = (select auth.uid())::text);
