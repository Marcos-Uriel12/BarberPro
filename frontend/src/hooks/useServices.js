import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useServices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/api/v1/services');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { data, loading, error, refetch: fetchServices };
}
