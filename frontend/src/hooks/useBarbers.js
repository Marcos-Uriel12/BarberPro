import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useBarbers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/api/v1/barbers');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  return { data, loading, error, refetch: fetchBarbers };
}
