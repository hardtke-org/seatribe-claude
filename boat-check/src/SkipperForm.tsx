import { useState } from 'react';
import type { SkipperInfo } from './types';

const FIELDS: { key: keyof SkipperInfo; label: string; placeholder: string }[] = [
  { key: 'name',        label: 'Name Skipper',  placeholder: 'Max Mustermann' },
  { key: 'auftragId',   label: 'Auftrags-ID',   placeholder: 'A-2024-001' },
  { key: 'bootstyp',    label: 'Bootstyp',      placeholder: 'Bavaria 40' },
  { key: 'starthafen',  label: 'Starthafen',    placeholder: 'Hamburg' },
  { key: 'zielhafen',   label: 'Zielhafen',     placeholder: 'Kiel' },
];

export function SkipperForm({ onSubmit }: { onSubmit: (info: SkipperInfo) => void }) {
  const [form, setForm] = useState<SkipperInfo>({
    name: '', auftragId: '', bootstyp: '', starthafen: '', zielhafen: '',
  });

  const valid = Object.values(form).every(v => v.trim() !== '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onSubmit(form);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Seatribe Deliveries" className="w-28 h-28 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-900">Bootsübernahme-Check</h1>
          <p className="mt-2 text-sm text-slate-500">Bitte fülle die folgenden Felder aus, bevor du die Checkliste startest.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={!valid}
            className="w-full mt-2 py-3 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter zur Checkliste →
          </button>
        </form>
      </div>
    </div>
  );
}
