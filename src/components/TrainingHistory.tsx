import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useTrainings } from '../hooks/useTraining';
import TrainingDetail from './TrainingDetail';
import { Training, Dog } from '../types';

export default function TrainingHistory() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { trainings, loading, error, deleteTraining } = useTrainings();
  const [selected, setSelected] = useState<Training | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [dogsLoading, setDogsLoading] = useState(true);

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
      setDogsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const getDogName = (dogId: string) => {
    const dog = dogs.find((d) => d.id === dogId);
    return dog?.name || '';
  };

  const filteredTrainings = selectedDogId
    ? trainings.filter((t) => t.dogId === selectedDogId)
    : trainings;

  if (loading || dogsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('history.title')}</h2>
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-red-500 text-sm">{t('history.error')}</p>
          <p className="text-slate-400 text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <TrainingDetail
        training={selected}
        dogName={getDogName(selected.dogId)}
        onBack={() => setSelected(null)}
        onDelete={async () => {
          await deleteTraining(selected.id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{t('history.title')}</h2>

      {dogs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDogId(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDogId === null
                ? 'bg-biko-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('history.allDogs')}
          </button>
          {dogs.map((dog) => (
            <button
              key={dog.id}
              onClick={() => setSelectedDogId(dog.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDogId === dog.id
                  ? 'bg-biko-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {dog.name}
            </button>
          ))}
        </div>
      )}

      {filteredTrainings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-slate-500">{t('history.noTrainings')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrainings.map((training) => {
            const mins = Math.floor(training.duration / 60);
            const secs = training.duration % 60;
            const date = training.startTime.toLocaleDateString(
              i18n.language === 'de' ? 'de-DE' : 'en-US',
              { day: '2-digit', month: '2-digit', year: 'numeric' }
            );
            const time = training.startTime.toLocaleTimeString(
              i18n.language === 'de' ? 'de-DE' : 'en-US',
              { hour: '2-digit', minute: '2-digit' }
            );
            const dogName = getDogName(training.dogId);

            return (
              <button
                key={training.id}
                onClick={() => setSelected(training)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    {dogName && (
                      <p className="text-xs font-medium text-biko-600 mb-0.5">{dogName}</p>
                    )}
                    <p className="text-sm text-slate-500">{date} &middot; {time}</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {mins} {t('history.minutes')} {secs} {t('history.seconds')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-biko-100 text-biko-700 text-xs font-medium rounded-full">
                      {t('history.band')} {training.bandStrength}
                    </span>
                    <p className="text-sm text-slate-600 mt-1">
                      {Math.round(training.distance)} {t('history.meters')}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
