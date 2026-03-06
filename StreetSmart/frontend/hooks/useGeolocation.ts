import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location access denied',
          2: 'Location unavailable',
          3: 'Location request timed out',
        };
        setState(prev => ({
          ...prev,
          error: messages[error.code] || 'Unknown location error',
          loading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return () => {};

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { ...state, getCurrentPosition, watchPosition };
}
