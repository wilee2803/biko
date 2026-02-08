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
    </div>
  );
}
