import { useServices } from '../../hooks/useServices';
import { useBooking } from '../../contexts/BookingContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Clock } from 'lucide-react';

export function StepServiceSelect() {
  const { data: services, loading, error, refetch } = useServices();
  const { serviceId, selectService, nextStep, canProceed } = useBooking();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Seleccioná el servicio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error cargando servicios. Reintentar.</p>
        <Button variant="primary" onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-lg">No hay servicios disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Seleccioná el servicio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            selected={serviceId === service.id}
            onClick={() => selectService(service.id)}
            className="transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{service.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{service.duration_minutes} min</span>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                ${service.price}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button variant="primary" disabled={!canProceed} onClick={nextStep}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
