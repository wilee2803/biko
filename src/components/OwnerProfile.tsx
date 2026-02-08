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
import { UserProfile } from '../types';

export default function OwnerProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        const d = docData.data();
        const profileData: UserProfile = {
          id: docData.id,
          userId: d.userId,
          ownerName: d.ownerName || '',
          createdAt: d.createdAt?.toDate?.() || new Date(),
        };
        setProfile(profileData);
        setOwnerName(profileData.ownerName);
      }
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err.message);
      setError(err.message);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    try {
      if (profile) {
        await updateDoc(doc(db, 'users', profile.id), { ownerName });
      } else {
        await addDoc(collection(db, 'users'), {
          userId: user.uid,
          ownerName,
          createdAt: Timestamp.now(),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Save error:', msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biko-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">{t('owner.title')}</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('owner.name')}
        </label>
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 bg-biko-600 text-white rounded-lg font-medium hover:bg-biko-700 disabled:opacity-50 transition-colors"
      >
        {saving ? t('common.saving') : t('dog.save')}
      </button>

      {error && (
        <p className="text-center text-red-500 text-sm">{error}</p>
      )}

      {saved && (
        <p className="text-center text-green-600 text-sm font-medium">{t('dog.saved')}</p>
      )}
    </form>
  );
}
