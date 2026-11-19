-- Für die Vollmacht braucht es vom Eigner Staatsangehörigkeit und Passnummer.
-- Die Tabelle owners ist nur für ihren Besitzer (die Agentur) lesbar; der Skipper bekommt diese Angaben nicht.

alter table public.owners
  add column nationality text,
  add column passport_no text;
