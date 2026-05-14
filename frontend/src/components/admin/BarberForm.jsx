import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../lib/api';

const PHONE_REGEX = /^\+?[\d\s-]{7,20}$/;

export function BarberForm({ barber, onClose }) {
  const [name, setName] = useState(barber?.name || '');
  const [phone, setPhone] = useState(barber?.phone || '');
  const [price, setPrice] = useState(barber?.price?.toString() || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (barber) {
      setName(barber.name || '');
      setPhone(barber.phone || '');
      setPrice(barber.price?.toString() || '');
    }
  }, [barber]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nombre obligatorio';
    } else if (name.trim().length > 100) {
      newErrors.name = 'El nombre debe tener menos de 100 caracteres';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Teléfono obligatorio';
    } else if (!PHONE_REGEX.test(phone.trim())) {
      newErrors.phone = 'Teléfono inválido';
    }

    if (price.trim() && Number(price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
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
        phone: phone.trim(),
        ...(price.trim() ? { price: Number(price) } : {}),
      };

      if (barber) {
        await api.put(`/api/v1/barbers/${barber.id}`, payload);
      } else {
        await api.post('/api/v1/barbers', payload);
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
        label="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        required
      />

      <Input
        label="Precio (opcional)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={errors.price}
        min="0"
        step="0.01"
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {barber ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
