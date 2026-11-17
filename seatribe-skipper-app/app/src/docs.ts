import { supabase } from './supabase';
import type { DocKind, SkipperDocument } from './types';

const BUCKET = 'skipper-docs';
export const MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif';

export async function listDocuments(userId: string): Promise<SkipperDocument[]> {
  const { data, error } = await supabase.from('skipper_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SkipperDocument[];
}

/** Lädt die Datei in den geschützten Speicher und trägt sie als Nachweis ein. */
export async function uploadDocument(userId: string, kind: DocKind, file: File, validUntil: string | null): Promise<void> {
  if (file.size > MAX_BYTES) throw new Error('Die Datei ist größer als 10 MB.');
  if (file.type && !ACCEPT.split(',').includes(file.type)) throw new Error('Bitte ein Foto (JPG, PNG, HEIC) oder ein PDF auswählen.');
  const ext = (file.name.split('.').pop() || 'dat').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'dat';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (up.error) throw up.error;
  const ins = await supabase.from('skipper_documents').insert({
    kind, file_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size, valid_until: validUntil,
  });
  if (ins.error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw ins.error;
  }
}

export async function deleteDocument(doc: SkipperDocument): Promise<void> {
  const rm = await supabase.storage.from(BUCKET).remove([doc.file_path]);
  if (rm.error) throw rm.error;
  const del = await supabase.from('skipper_documents').delete().eq('id', doc.id);
  if (del.error) throw del.error;
}

/** Kurzlebiger Link zum Ansehen. Der Speicher selbst ist nicht öffentlich. */
export async function documentUrl(doc: SkipperDocument): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 120);
  if (error) throw error;
  return data.signedUrl;
}
