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

interface FormData {
  firstName: string;
  email: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

export default function OwnerProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: '',
    email: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Pre-fill email from auth user
    setForm((f) => ({ ...f, email: user.email || '' }));

    const q = query(collection(db, 'users'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        const d = docData.data();
        const profileData: UserProfile = {
          id: docData.id,
          userId: d.userId,
          firstName: d.firstName || d.ownerName || '',
          email: d.email || user.email || '',
          lastName: d.lastName || '',
          address: d.address || '',
          postalCode: d.postalCode || '',
          city: d.city || '',
          country: d.country || '',
          phone: d.phone || '',
          createdAt: d.createdAt?.toDate?.() || new Date(),
        };
        setProfile(profileData);
        setForm({
          firstName: profileData.firstName,
          email: profileData.email,
          lastName: profileData.lastName || '',
          address: profileData.address || '',
          postalCode: profileData.postalCode || '',
          city: profileData.city || '',
          country: profileData.country || '',
          phone: profileData.phone || '',
        });
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

    const data = {
      firstName: form.firstName,
      email: form.email,
      lastName: form.lastName || null,
      address: form.address || null,
      postalCode: form.postalCode || null,
      city: form.city || null,
      country: form.country || null,
      phone: form.phone || null,
    };

    try {
      if (profile) {
        await updateDoc(doc(db, 'users', profile.id), data);
      } else {
        await addDoc(collection(db, 'users'), {
          ...data,
          userId: user.uid,
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

  const updateField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('owner.firstName')} *
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('owner.lastName')}
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('owner.email')} *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('owner.phone')}
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('owner.address')}
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('owner.postalCode')}
          </label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('owner.city')}
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('owner.country')}
        </label>
        <input
          type="text"
          value={form.country}
          onChange={(e) => updateField('country', e.target.value)}
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
