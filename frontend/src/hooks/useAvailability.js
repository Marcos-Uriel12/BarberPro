import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useAvailability(barberId, date) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!barberId || !date) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(
        `/api/v1/availability/barbers/${barberId}/slots?date=${date}`
      );
      setSlots(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [barberId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, error, refetchSlots: fetchSlots };
}
