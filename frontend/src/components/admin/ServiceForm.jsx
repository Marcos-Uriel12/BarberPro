import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../lib/api';

export function ServiceForm({ service, onClose }) {
  const [name, setName] = useState(service?.name || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.duration_minutes?.toString() || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setPrice(service.price?.toString() || '');
      setDuration(service.duration_minutes?.toString() || '');
    }
  }, [service]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nombre obligatorio';
    } else if (name.trim().length > 100) {
      newErrors.name = 'El nombre debe tener menos de 100 caracteres';
    }

    if (!price.trim()) {
      newErrors.price = 'Precio obligatorio';
    } else if (Number(price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!duration.trim()) {
      newErrors.duration = 'Duración obligatoria';
    } else if (Number(duration) <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        duration_minutes: Number(duration),
      };

      if (service) {
        await api.put(`/api/v1/services/${service.id}`, payload);
      } else {
        await api.post('/api/v1/services', payload);
      }
      onClose();
    } catch {
      setErrors({ submit: 'Error al guardar. Reintentar.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm" role="alert">
          {errors.submit}
        </div>
      )}

      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Input
        label="Precio"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={errors.price}
        required
        min="0"
        step="0.01"
      />

      <Input
        label="Duración (minutos)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        error={errors.duration}
        required
        min="1"
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {service ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
