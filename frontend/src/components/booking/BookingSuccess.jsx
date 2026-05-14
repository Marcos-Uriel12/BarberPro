import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CheckCircle, Calendar, Clock, User, Phone, Scissors } from 'lucide-react';

export function BookingSuccess({ appointment }) {
  const navigate = useNavigate();
  const { reset } = useBooking();

  const handleNewBooking = () => {
    reset();
    navigate('/booking');
  };

  if (!appointment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">No hay datos de la reserva.</p>
        <Button variant="primary" onClick={handleNewBooking} className="mt-4">
          Nueva Reserva
        </Button>
      </div>
    );
  }

  const details = [
    { icon: Calendar, label: 'Fecha', value: appointment.date },
    { icon: Clock, label: 'Horario', value: appointment.time },
    { icon: Scissors, label: 'Barbero', value: appointment.barber_name || appointment.barber_id },
    { icon: User, label: 'Servicio', value: appointment.service_name || appointment.service_id },
    { icon: User, label: 'Nombre', value: appointment.client_name },
    { icon: Phone, label: 'Teléfono', value: appointment.client_phone },
  ];

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle className="w-16 h-16 text-green-500" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-foreground">¡Reserva confirmada!</h2>
        <p className="text-muted">Tu turno fue creado exitosamente.</p>
      </div>

      <div className="max-w-md mx-auto space-y-3 text-left" aria-label="Detalles de la reserva">
        {details.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="primary" onClick={handleNewBooking} size="lg" aria-label="Crear una nueva reserva">
        Nueva Reserva
      </Button>
    </div>
  );
}
