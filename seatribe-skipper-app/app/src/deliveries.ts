import { supabase } from './supabase';
import type { Assignment, Delivery } from './types';

const SELECT = 'id, from_port, to_port, planned_start, modules, assigned_skipper_id, hubspot_deal_id, order_no, hubspot_stage, when_text, hubspot_synced_at, boat:boats(*), owner:owners(*)';

export async function listDeliveries(): Promise<Delivery[]> {
  const { data, error } = await supabase.from('deliveries').select(SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Delivery[];
}

export async function getDelivery(id: string): Promise<Delivery | null> {
  const { data, error } = await supabase.from('deliveries').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as unknown as Delivery | null;
}

/** Aufträge, die dem angemeldeten Skipper zugewiesen sind. */
export async function listAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase.rpc('my_assignments');
  if (error) throw error;
  return (data ?? []) as Assignment[];
}
