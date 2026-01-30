import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(next);
    localStorage.setItem('biko-lang', next);
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
    >
      {i18n.language === 'de' ? 'EN' : 'DE'}
    </button>
  );
}
