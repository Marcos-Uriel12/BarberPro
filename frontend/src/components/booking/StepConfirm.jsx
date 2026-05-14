import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { toast } from '../ui/Toast';
import { Scissors, Calendar, Clock, User, Phone } from 'lucide-react';

export function StepConfirm() {
  const {
    barberId, serviceId, date, slot, clientName, clientPhone,
    nextStep, prevStep, reset,
  } = useBooking();

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Resolve display names from context (we use IDs, but show human-readable)
  // In a real app, we'd have the full objects. Here we show the IDs as fallback.
  const summaryItems = [
    { icon: Scissors, label: 'Barbero', value: barberId },
    { icon: User, label: 'Servicio', value: serviceId },
    { icon: Calendar, label: 'Fecha', value: date ? new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '' },
    { icon: Clock, label: 'Horario', value: slot },
    { icon: User, label: 'Nombre', value: clientName },
    { icon: Phone, label: 'Teléfono', value: clientPhone },
  ];

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = {
        barber_id: barberId,
        service_id: serviceId,
        date,
        time: slot,
        client_name: clientName,
        client_phone: clientPhone,
      };

      const appointment = await api.post('/api/v1/appointments', payload);
      reset();
      navigate('/booking/success', { state: { appointment } });
    } catch (err) {
      if (err.status === 409) {
        toast.error('Este horario ya fue reservado. Volvé al paso 4.');
        prevStep();
      } else {
        toast.error('Error creando la reserva. Reintentar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Confirmá tu reserva</h2>
      <div className="space-y-3">
        {summaryItems.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted flex-shrink-0" />
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="font-medium text-foreground capitalize">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Atrás</Button>
        <Button variant="primary" onClick={handleConfirm} loading={submitting}>
          Confirmar Reserva
        </Button>
      </div>
    </div>
  );
}
