export type AccountType = 'skipper' | 'agentur';
export type MailMode = 'postfach' | 'kopieren';

export interface Profile {
  id: string;
  account_type: AccountType;
  display_name: string | null;
  company: string | null;
  country: string;
  charges_vat: boolean;
  tax_number: string | null;
  mail_mode: MailMode;
  sender_email: string | null;
  role: 'skipper' | 'agentur';
  seatribe_status: 'neu' | 'bestaetigt' | 'abgelehnt';
  email: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  nationality: string | null;
  birth_date: string | null;
  highest_licence: string | null;
  licence_number: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export type DocKind = 'personalausweis' | 'reisepass' | 'segelschein' | 'funkschein' | 'pyroschein' | 'haftpflicht' | 'sonstiges';

export interface SkipperDocument {
  id: string;
  user_id: string;
  kind: DocKind;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  valid_until: string | null;
  created_at: string;
}

export interface Boat {
  id: string;
  name: string | null;
  type: string | null;
  year_built: number | null;
  flag: string | null;
  callsign: string | null;
  mmsi: string | null;
  length_m: number | null;
  beam_m: number | null;
  draft_m: number | null;
}

export interface Owner {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface Delivery {
  id: string;
  from_port: string;
  to_port: string;
  planned_start: string | null;
  modules: Record<string, boolean>;
  assigned_skipper_id: string | null;
  boat: Boat | null;
  owner: Owner | null;
}

/** Ein Auftrag, wie ihn der zugewiesene Skipper sieht: ohne Preise, ohne Anschrift des Eigners. */
export interface Assignment {
  id: string;
  from_port: string;
  to_port: string;
  planned_start: string | null;
  assigned_at: string | null;
  agency_name: string | null;
  boat_name: string | null;
  boat_type: string | null;
  year_built: number | null;
  flag: string | null;
  callsign: string | null;
  mmsi: string | null;
  registration_no: string | null;
  length_m: number | null;
  beam_m: number | null;
  draft_m: number | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
}
