import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, updateDoc, doc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Dog, DogFormData } from '../types';
import EquipmentSettings from './EquipmentSettings';

interface DogFormProps {
  dog?: Dog;
  onSave: () => void;
  onCancel: () => void;
}

export default function DogForm({ dog, onSave, onCancel }: DogFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState<DogFormData>({
    name: dog?.name || '',
    breed: dog?.breed || '',
    gender: dog?.gender || 'male',
    birthDate: dog?.birthDate || '',
    expanderSize: dog?.expanderSize || '1',
    cuffSize: dog?.cuffSize || '1',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    try {
      if (dog) {
        await updateDoc(doc(db, 'dogs', dog.id), { ...form });
      } else {
        await addDoc(collection(db, 'dogs'), {
          ...form,
          userId: user.uid,
          createdAt: Timestamp.now(),
        });
      }
      onSave();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Save error:', msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">
        {dog ? t('dog.editDog') : t('dog.addDog')}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('dog.name')}
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('dog.breed')}
        </label>
        <input
          type="text"
          value={form.breed}
          onChange={(e) => setForm({ ...form, breed: e.target.value })}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('dog.gender')}
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, gender: 'male' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.gender === 'male'
                ? 'bg-biko-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('dog.male')}
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, gender: 'female' })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.gender === 'female'
                ? 'bg-biko-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('dog.female')}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('dog.birthDate')}
        </label>
        <input
          type="date"
          value={form.birthDate}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <EquipmentSettings
        expanderSize={form.expanderSize}
        cuffSize={form.cuffSize}
        onChange={(field, value) => setForm({ ...form, [field]: value })}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-biko-600 text-white rounded-lg font-medium hover:bg-biko-700 disabled:opacity-50 transition-colors"
        >
          {saving ? t('common.saving') : t('dog.save')}
        </button>
      </div>

      {error && (
        <p className="text-center text-red-500 text-sm">{error}</p>
      )}
    </form>
  );
}
