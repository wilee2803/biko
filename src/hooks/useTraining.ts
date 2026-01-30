import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Training, GeoPoint } from '../types';

export function useTrainings(dogId?: string) {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTrainings([]);
      setLoading(false);
      return;
    }

    const constraints = [
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    ];
    if (dogId) {
      constraints.unshift(where('dogId', '==', dogId));
    }

    const q = query(collection(db, 'trainings'), ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          dogId: d.dogId,
          userId: d.userId,
          bandStrength: d.bandStrength,
          startTime: d.startTime?.toDate?.() || new Date(d.startTime),
          endTime: d.endTime?.toDate?.() || new Date(d.endTime),
          duration: d.duration,
          distance: d.distance,
          route: d.route || [],
          createdAt: d.createdAt?.toDate?.() || new Date(d.createdAt),
        } as Training;
      });
      setTrainings(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, dogId]);

  const saveTraining = async (data: {
    dogId: string;
    bandStrength: 1 | 2;
    startTime: Date;
    endTime: Date;
    duration: number;
    distance: number;
    route: GeoPoint[];
  }) => {
    if (!user) return;
    await addDoc(collection(db, 'trainings'), {
      ...data,
      userId: user.uid,
      startTime: Timestamp.fromDate(data.startTime),
      endTime: Timestamp.fromDate(data.endTime),
      createdAt: Timestamp.now(),
    });
  };

  const deleteTraining = async (trainingId: string) => {
    await deleteDoc(doc(db, 'trainings', trainingId));
  };

  return { trainings, loading, saveTraining, deleteTraining };
}
