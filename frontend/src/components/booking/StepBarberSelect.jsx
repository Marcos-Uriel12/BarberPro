import { useBarbers } from '../../hooks/useBarbers';
import { useBooking } from '../../contexts/BookingContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

export function StepBarberSelect() {
  const { data: barbers, loading, error, refetch } = useBarbers();
  const { barberId, selectBarber, nextStep, canProceed } = useBooking();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 id="step-title" className="text-xl font-semibold text-foreground">Seleccioná tu barbero</h2>
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
        <p className="text-red-600 mb-4" role="alert">Error cargando barberos. Reintentar.</p>
        <Button variant="primary" onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  if (!barbers || barbers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-lg">No hay barberos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 id="step-title" className="text-xl font-semibold text-foreground">Seleccioná tu barbero</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-labelledby="step-title">
        {barbers.map((barber) => (
          <Card
            key={barber.id}
            selected={barberId === barber.id}
            onClick={() => selectBarber(barber.id)}
            className="transition-all"
            role="radio"
            aria-checked={barberId === barber.id}
            aria-label={`${barber.name}${barber.price ? `, $${barber.price}` : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{barber.name}</h3>
                {barber.phone && (
                  <p className="text-sm text-muted">{barber.phone}</p>
                )}
              </div>
              {barber.price && (
                <span className="text-lg font-bold text-foreground">
                  ${barber.price}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          variant="primary"
          disabled={!canProceed}
          onClick={nextStep}
          aria-label="Continuar al siguiente paso"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
