import { useTranslation } from 'react-i18next';
import { Dog } from '../types';

interface DogSelectorProps {
  dogs: Dog[];
  selectedDogId: string | null;
  onChange: (dogId: string) => void;
}

export default function DogSelector({ dogs, selectedDogId, onChange }: DogSelectorProps) {
  const { t } = useTranslation();

  if (dogs.length === 0) {
    return null;
  }

  if (dogs.length === 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {t('training.selectDog')}
      </label>
      <select
        value={selectedDogId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
      >
        <option value="" disabled>
          {t('training.selectDog')}
        </option>
        {dogs.map((dog) => (
          <option key={dog.id} value={dog.id}>
            {dog.name}
          </option>
        ))}
      </select>
    </div>
  );
}
