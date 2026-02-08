import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Dog } from '../types';
import DogForm from './DogForm';

export default function DogList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'dogs'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dogsData: Dog[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId,
          name: d.name,
          breed: d.breed,
          gender: d.gender || 'male',
          birthDate: d.birthDate,
          expanderSize: d.expanderSize || '1',
          cuffSize: d.cuffSize || '1',
          createdAt: d.createdAt?.toDate?.() || new Date(),
        };
      });
      setDogs(dogsData);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleDelete = async (dogId: string) => {
    if (!confirm(t('dog.confirmDelete'))) return;
    setDeletingId(dogId);
    try {
      await deleteDoc(doc(db, 'dogs', dogId));
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSave = () => {
    setEditingDog(null);
    setShowAddForm(false);
  };

  const handleFormCancel = () => {
    setEditingDog(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  if (showAddForm) {
    return <DogForm onSave={handleFormSave} onCancel={handleFormCancel} />;
  }

  if (editingDog) {
    return <DogForm dog={editingDog} onSave={handleFormSave} onCancel={handleFormCancel} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{t('dog.dogs')}</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-biko-600 text-white text-sm font-medium rounded-lg hover:bg-biko-700 transition-colors"
        >
          {t('dog.addDog')}
        </button>
      </div>

      {dogs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-slate-500">{t('dog.noDogs')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{dog.name}</h4>
                <p className="text-sm text-slate-500">
                  {dog.breed} &middot; {t(`dog.${dog.gender}`)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingDog(dog)}
                  className="px-3 py-1.5 text-sm font-medium text-biko-600 hover:bg-biko-50 rounded-lg transition-colors"
                >
                  {t('dog.editDog')}
                </button>
                <button
                  onClick={() => handleDelete(dog.id)}
                  disabled={deletingId === dog.id}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {t('dog.deleteDog')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
