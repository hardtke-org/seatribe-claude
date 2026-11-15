import { supabase } from './supabase';
import type { Delivery } from './types';

const SELECT = 'id, from_port, to_port, planned_start, modules, boat:boats(*), owner:owners(*)';

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
