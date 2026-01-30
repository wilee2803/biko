import { useState, useRef, useCallback } from 'react';
import { GeoPoint } from '../types';

function calculateDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGeolocation() {
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setRoute([]);
    setDistance(0);
    setError(null);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        };

        setRoute((prev) => {
          const updated = [...prev, point];
          if (updated.length >= 2) {
            const last = updated[updated.length - 2];
            const dist = calculateDistance(last, point);
            if (dist > 1) {
              setDistance((d) => d + dist);
            }
          }
          return updated;
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  return { route, distance, tracking, error, startTracking, stopTracking };
}
