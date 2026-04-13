import { useState } from 'react';
import type { Lang } from './i18n';

const STORAGE_KEY = 'boat-check-lang';

export function useLanguage(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'de';
  });

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }

  return [lang, setLang];
}
