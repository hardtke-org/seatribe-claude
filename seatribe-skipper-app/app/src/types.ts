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
  role: 'skipper' | 'crew' | 'agentur';
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
  passport_no: string | null;
  deposit_rule: { admin?: number; honorar?: number; logistik?: number } | null;
  signature_data: string | null;
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
  registration_no: string | null;
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
  nationality: string | null;
  passport_no: string | null;
}

export interface Delivery {
  id: string;
  from_port: string;
  to_port: string;
  planned_start: string | null;
  modules: Record<string, boolean>;
  assigned_skipper_id: string | null;
  hubspot_deal_id: string | null;
  order_no: string | null;
  hubspot_stage: string | null;
  when_text: string | null;
  hubspot_synced_at: string | null;
  boat: Boat | null;
  owner: Owner | null;
}

/** Ein Auftrag, wie ihn der zugewiesene Skipper sieht: ohne Preise, ohne Anschrift des Eigners. */
export interface Assignment {
  id: string;
  from_port: string;
  to_port: string;
  planned_start: string | null;
  when_text: string | null;
  order_no: string | null;
  status: 'geplant' | 'unterwegs' | 'abgeschlossen';
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

/** Antwort der Abruf-Funktion: ein Auftrag, wie er in HubSpot steht. */
export interface HubspotContact { id: string; label: string | null; name: string | null; email: string | null; phone: string | null; address: string | null }
export type Terms = Record<string, number | null>;
export interface HubspotOrder {
  deal_id: string;
  order_no: string;
  stage: string | null;
  pipeline: string | null;
  route: { from: string | null; to: string | null; when: string | null };
  boat: { type: string | null; name: string | null; registration_no: string | null; year_built: number | null; length_m: number | null; beam_m: number | null; draft_m: number | null };
  contacts: HubspotContact[];
  contacts_note: string | null;
  terms: Terms;
}

export interface Invitation {
  id: string;
  invited_by: string;
  email: string;
  role: 'skipper' | 'crew';
  created_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
}

export interface Contract {
  id: string;
  delivery_id: string;
  kind: 'eigner' | 'skipper';
  file_path: string;
  file_name: string;
  signed_path: string | null;
  signed_name: string | null;
  signed_at: string | null;
  data: { entwurf?: boolean } & Record<string, unknown>;
  created_at: string;
}
