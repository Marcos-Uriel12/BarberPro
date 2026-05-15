import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useAvailability(barberId, date, serviceId = null) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!barberId || !date) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/v1/availability/barbers/${barberId}/slots?date=${date}`;
      if (serviceId) {
        url += `&service_id=${serviceId}`;
      }
      const result = await api.get(url);
      setSlots(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [barberId, date, serviceId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, error, refetchSlots: fetchSlots };
}
