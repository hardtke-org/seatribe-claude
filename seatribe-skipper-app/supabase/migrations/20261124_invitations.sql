-- Einladungen: Die Agentur lädt Skipper (später auch Crew) per E-Mail-Adresse ein.
-- Legt jemand mit dieser Adresse ein Konto an, wird die Einladung als angenommen vermerkt.
-- Die Bestätigung als Seatribe-Skipper bleibt ein eigener Schritt der Agentur.

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  invited_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email like '%_@_%._%'),
  role text not null default 'skipper' check (role in ('skipper', 'crew')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  unique (invited_by, email, role)
);
create index invitations_email_idx on public.invitations (email);
create index invitations_accepted_by_idx on public.invitations (accepted_by);
alter table public.invitations enable row level security;
revoke all on public.invitations from anon, authenticated;
grant select, delete on public.invitations to authenticated;
grant insert (email, role) on public.invitations to authenticated;

create policy "einladungen: eigene lesen" on public.invitations for select to authenticated
  using (invited_by = (select auth.uid()) and (select private.is_agency()));
create policy "einladungen: agentur legt an" on public.invitations for insert to authenticated
  with check (invited_by = (select auth.uid()) and (select private.is_agency()));
create policy "einladungen: eigene zurückziehen" on public.invitations for delete to authenticated
  using (invited_by = (select auth.uid()) and (select private.is_agency()));

-- Neues Konto: Profil anlegen und offene Einladungen für diese Adresse als angenommen vermerken.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  update public.invitations set accepted_at = now(), accepted_by = new.id
    where email = lower(btrim(new.email)) and accepted_at is null;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
