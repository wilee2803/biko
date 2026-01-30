import { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Dog, DogFormData } from '../types';
import EquipmentSettings from './EquipmentSettings';

export default function DogProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dog, setDog] = useState<Dog | null>(null);
  const [form, setForm] = useState<DogFormData>({
    name: '',
    breed: '',
    birthDate: '',
    expanderSize: 'M',
    cuffSize: 'M',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'dogs'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        const d = docData.data();
        const dogData: Dog = {
          id: docData.id,
          userId: d.userId,
          name: d.name,
          breed: d.breed,
          birthDate: d.birthDate,
          expanderSize: d.expanderSize || 'M',
          cuffSize: d.cuffSize || 'M',
          createdAt: d.createdAt?.toDate?.() || new Date(),
        };
        setDog(dogData);
        setForm({
          name: dogData.name,
          breed: dogData.breed,
          birthDate: dogData.birthDate,
          expanderSize: dogData.expanderSize,
          cuffSize: dogData.cuffSize,
        });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (dog) {
      await updateDoc(doc(db, 'dogs', dog.id), { ...form });
    } else {
      await addDoc(collection(db, 'dogs'), {
        ...form,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">{t('dog.title')}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
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

        <button
          type="submit"
          className="w-full py-2.5 bg-biko-600 text-white rounded-lg font-medium hover:bg-biko-700 transition-colors"
        >
          {t('dog.save')}
        </button>

        {saved && (
          <p className="text-center text-green-600 text-sm font-medium">{t('dog.saved')}</p>
        )}
      </form>
    </div>
  );
}
