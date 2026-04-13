import { useState } from 'react';
import type { SkipperInfo } from './types';
import { ui, type Lang } from './i18n';

export function SkipperForm({ onSubmit, initial, lang, onLangChange }: {
  onSubmit: (info: SkipperInfo) => void;
  initial?: SkipperInfo | null;
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const t = ui[lang];
  const fields: { key: keyof SkipperInfo; label: string; placeholder: string }[] = [
    { key: 'name',       label: t.fieldName,       placeholder: t.placeholderName },
    { key: 'auftragId',  label: t.fieldAuftragId,  placeholder: t.placeholderAuftragId },
    { key: 'bootstyp',   label: t.fieldBootstyp,   placeholder: t.placeholderBootstyp },
    { key: 'starthafen', label: t.fieldStarthafen, placeholder: t.placeholderStarthafen },
    { key: 'zielhafen',  label: t.fieldZielhafen,  placeholder: t.placeholderZielhafen },
  ];

  const [form, setForm] = useState<SkipperInfo>(
    initial ?? { name: '', auftragId: '', bootstyp: '', starthafen: '', zielhafen: '' }
  );

  const valid = Object.values(form).every(v => v.trim() !== '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onSubmit(form);
  }

  return (
    <div className="min-h-screen bg-ui-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => onLangChange(lang === 'de' ? 'en' : 'de')}
              className="text-2xl leading-none"
              title={lang === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            >
              {lang === 'de' ? '🇬🇧' : '🇩🇪'}
            </button>
          </div>
          <img src="/logo.png" alt="Seatribe Deliveries" className="w-28 h-28 mx-auto mb-4 object-contain" />
<h1 className="text-2xl font-bold text-brand-dark">{t.appTitle}</h1>
          <p className="mt-2 text-sm text-ui-text-secondary">{t.formSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ui-card rounded-2xl border border-ui-border p-6 space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-brand-dark uppercase tracking-wide mb-1">
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full px-3 py-2.5 text-base border border-ui-border rounded-xl bg-ui-card focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-colors duration-150"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={!valid}
            className="w-full mt-2 py-3 text-sm font-semibold rounded-xl bg-brand-primary text-white shadow-sm hover:brightness-110 hover:shadow-md active:brightness-90 active:shadow-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.formSubmit}
          </button>
        </form>
      </div>
    </div>
  );
}
