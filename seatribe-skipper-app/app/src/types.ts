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
  boat: Boat | null;
  owner: Owner | null;
}
