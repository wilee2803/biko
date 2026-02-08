import { useTranslation } from 'react-i18next';
import OwnerProfile from './OwnerProfile';
import DogList from './DogList';

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">{t('nav.profile')}</h2>
      <OwnerProfile />
      <DogList />

      {/* Spare Parts Link */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{t('shop.title')}</h3>
        <a
          href="https://biko.co.at/fuer-hunde/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 bg-biko-50 rounded-xl hover:bg-biko-100 transition-colors"
        >
          <span className="font-medium text-biko-700">{t('shop.spareParts')}</span>
          <svg className="w-5 h-5 text-biko-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{t('contact.title')}</h3>
        <a
          href="mailto:info@biko.co.at"
          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-slate-700">info@biko.co.at</span>
        </a>
      </div>
    </div>
  );
}
