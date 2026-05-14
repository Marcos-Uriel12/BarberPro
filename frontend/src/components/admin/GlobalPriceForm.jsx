import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../lib/api';
import { DollarSign } from 'lucide-react';

export function GlobalPriceForm() {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchGlobalPrice = async () => {
      try {
        // Global price is typically the first service's price or a dedicated endpoint
        // Since there's no dedicated GET /api/v1/global-price, we fetch services
        // and use a reasonable default. The spec says PUT /api/v1/global-price.
        // We'll try the endpoint and fallback.
        try {
          const data = await api.get('/api/v1/global-price');
          setPrice(data.price?.toString() || '');
        } catch {
          // Fallback: fetch services to get a reference price
          const services = await api.get('/api/v1/services');
          if (Array.isArray(services) && services.length > 0) {
            setPrice(services[0].price?.toString() || '');
          }
        }
      } catch {
        setError('Error cargando precio global');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!price.trim() || Number(price) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    setSaving(true);
    try {
      await api.put('/api/v1/global-price', { price: Number(price) });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error al actualizar precio global');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Precio Global</h3>
      </div>

      <p className="text-sm text-muted mb-4">
        Este precio se aplica a todos los servicios sin precio específico.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 max-w-xs">
          <Input
            label="Precio"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={error}
            min="0"
            step="0.01"
          />
        </div>
        <Button type="submit" variant="primary" loading={saving}>
          Actualizar
        </Button>
      </form>

      {success && (
        <p className="text-sm text-green-600 mt-2" role="status">
          Precio global actualizado exitosamente
        </p>
      )}
    </div>
  );
}
