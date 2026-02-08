import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTrainings } from '../hooks/useTraining';
import { Dog } from '../types';
import DogSelector from './DogSelector';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TrainingSession() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { route, distance, tracking, error: gpsError, startTracking, stopTracking } = useGeolocation();
  const { saveTraining } = useTrainings();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [bandStrength, setBandStrength] = useState<1 | 2>(1);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (dogsData.length === 1) {
        setSelectedDogId(dogsData[0].id);
      } else if (dogsData.length > 1 && selectedDogId) {
        const stillExists = dogsData.some((d) => d.id === selectedDogId);
        if (!stillExists) {
          setSelectedDogId(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleStart = () => {
    startTimeRef.current = new Date();
    setElapsed(0);
    startTracking();
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  };

  const handleStop = async () => {
    stopTracking();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!selectedDogId || !startTimeRef.current) return;

    setSaving(true);
    try {
      await saveTraining({
        dogId: selectedDogId,
        bandStrength,
        startTime: startTimeRef.current,
        endTime: new Date(),
        duration: elapsed,
        distance: Math.round(distance),
        route,
      });
    } finally {
      setSaving(false);
      setElapsed(0);
      startTimeRef.current = null;
    }
  };

  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-slate-500">{t('training.selectDogFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">{t('training.title')}</h2>

      {!tracking && (
        <>
          <DogSelector
            dogs={dogs}
            selectedDogId={selectedDogId}
            onChange={setSelectedDogId}
          />

          {selectedDog && (
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <span className="text-sm text-slate-600">{t('training.trainingWith')}: </span>
              <span className="font-semibold text-slate-800">{selectedDog.name}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('training.bandStrength')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBandStrength(1)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  bandStrength === 1
                    ? 'bg-biko-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('training.band1')}
              </button>
              <button
                type="button"
                onClick={() => setBandStrength(2)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  bandStrength === 2
                    ? 'bg-biko-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('training.band2')}
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedDogId}
            className="w-full py-4 bg-green-500 text-white rounded-xl text-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('training.start')}
          </button>
          </div>
        </>
      )}

      {tracking && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">{t('training.duration')}</p>
            <p className="text-5xl font-mono font-bold text-slate-800">
              {formatDuration(elapsed)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">{t('training.distance')}</p>
            <p className="text-3xl font-bold text-biko-600">
              {Math.round(distance)} <span className="text-lg text-slate-400">m</span>
            </p>
          </div>

          <div className="text-center text-xs text-slate-400">
            {t('training.bandStrength')}: {bandStrength} &middot; GPS: {route.length} pts
          </div>

          {gpsError && (
            <p className="text-red-500 text-sm text-center">{t('training.gpsError')}</p>
          )}

          {route.length === 0 && !gpsError && (
            <p className="text-amber-500 text-sm text-center animate-pulse">
              {t('training.gpsWaiting')}
            </p>
          )}

          <button
            onClick={handleStop}
            disabled={saving}
            className="w-full py-4 bg-red-500 text-white rounded-xl text-lg font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {saving ? t('training.saving') : t('training.stop')}
          </button>
        </div>
      )}
    </div>
  );
}
