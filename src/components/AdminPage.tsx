import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, Dog, Training } from '../types';

type Tab = 'users' | 'dogs' | 'trainings';

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            userId: d.userId,
            firstName: d.firstName || d.ownerName || '',
            email: d.email || '',
            lastName: d.lastName || '',
            address: d.address || '',
            postalCode: d.postalCode || '',
            city: d.city || '',
            country: d.country || '',
            phone: d.phone || '',
            createdAt: d.createdAt?.toDate?.() || new Date(),
          } as UserProfile;
        });
        setUsers(data);
      }
    );

    const unsubDogs = onSnapshot(
      query(collection(db, 'dogs'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            userId: d.userId,
            name: d.name,
            breed: d.breed,
            gender: d.gender || 'male',
            birthDate: d.birthDate,
            expanderSize: d.expanderSize || '1',
            cuffSize: d.cuffSize || '1',
            createdAt: d.createdAt?.toDate?.() || new Date(),
          } as Dog;
        });
        setDogs(data);
      }
    );

    const unsubTrainings = onSnapshot(
      query(collection(db, 'trainings'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            dogId: d.dogId,
            userId: d.userId,
            bandStrength: d.bandStrength,
            startTime: d.startTime?.toDate?.() || new Date(),
            endTime: d.endTime?.toDate?.() || new Date(),
            duration: d.duration,
            distance: d.distance,
            route: d.route || [],
            createdAt: d.createdAt?.toDate?.() || new Date(),
          } as Training;
        });
        setTrainings(data);
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubDogs();
      unsubTrainings();
    };
  }, []);

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.userId === userId);
    return user?.email || user?.firstName || userId.slice(0, 8) + '...';
  };

  const getDogName = (dogId: string) => {
    const dog = dogs.find((d) => d.id === dogId);
    return dog?.name || dogId.slice(0, 8) + '...';
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'users', label: t('admin.users'), count: users.length },
    { id: 'dogs', label: t('admin.dogs'), count: dogs.length },
    { id: 'trainings', label: t('admin.trainings'), count: trainings.length },
  ];

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{t('admin.title')}</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-biko-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-slate-500">{user.phone}</p>
                  )}
                  {user.city && (
                    <p className="text-sm text-slate-400">
                      {user.postalCode} {user.city}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-400">
                  {user.createdAt.toLocaleDateString(locale)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dogs' && (
        <div className="space-y-3">
          {dogs.map((dog) => (
            <div key={dog.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">{dog.name}</p>
                  <p className="text-sm text-slate-500">
                    {dog.breed} &middot; {t(`dog.${dog.gender}`)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('admin.owner')}: {getUserEmail(dog.userId)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">
                    Exp: {dog.expanderSize} / Cuff: {dog.cuffSize}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'trainings' && (
        <div className="space-y-3">
          {trainings.map((training) => {
            const mins = Math.floor(training.duration / 60);
            const secs = training.duration % 60;
            return (
              <div key={training.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-biko-600">
                      {getDogName(training.dogId)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {training.startTime.toLocaleDateString(locale)}{' '}
                      {training.startTime.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {mins}m {secs}s &middot; {Math.round(training.distance)}m
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-biko-100 text-biko-700 text-xs font-medium rounded-full">
                      Band {training.bandStrength}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {getUserEmail(training.userId)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
