-- Passnummer des Skippers für Vollmacht und Crewliste. Sichtbar für ihn selbst und für die Agentur.

alter table public.profiles add column passport_no text;
grant update (passport_no) on public.profiles to authenticated;
