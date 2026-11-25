-- Rolle „Crew": Wer über eine Crew-Einladung ein Konto anlegt, ist Crew. Die Agentur bestätigt Crew wie Skipper.
-- Angewendet am 2026-11-25.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('skipper', 'crew', 'agentur'));

-- Neues Konto: Profil anlegen. Crew wird nur, wer für diese Adresse eine offene Crew-Einladung
-- und keine offene Skipper-Einladung hat; alle anderen sind Skipper. Danach die Einladungen als angenommen vermerken.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  adr text := lower(btrim(new.email));
  r text := 'skipper';
begin
  if exists (select 1 from public.invitations where email = adr and accepted_at is null and role = 'crew')
     and not exists (select 1 from public.invitations where email = adr and accepted_at is null and role = 'skipper') then
    r := 'crew';
  end if;
  insert into public.profiles (id, email, role) values (new.id, new.email, r);
  update public.invitations set accepted_at = now(), accepted_by = new.id
    where email = adr and accepted_at is null;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Die Agentur bestätigt Skipper und Crew oder nimmt die Bestätigung zurück.
create or replace function public.set_skipper_status(skipper_id uuid, new_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_agency() then
    raise exception 'Nur die Agentur darf Skipper und Crew bestätigen.' using errcode = '42501';
  end if;
  if new_status not in ('neu', 'bestaetigt', 'abgelehnt') then
    raise exception 'Unbekannter Status.' using errcode = '22023';
  end if;
  update public.profiles set seatribe_status = new_status, seatribe_status_at = now()
    where id = skipper_id and role in ('skipper', 'crew');
end $$;
