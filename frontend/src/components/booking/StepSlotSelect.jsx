import { useBooking } from '../../contexts/BookingContext';
import { useAvailability } from '../../hooks/useAvailability';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { CalendarDays } from 'lucide-react';

export function StepSlotSelect() {
  const { barberId, date, slot, serviceId, serviceDuration, selectDate, selectSlot, nextStep, prevStep, canProceed } = useBooking();
  const { slots, loading, error, refetchSlots } = useAvailability(barberId, date, serviceId);

  if (loading) {
    return (
      <div className="space-y-6 text-center py-8">
        <Spinner size="lg" />
        <p className="text-muted">Buscando horarios disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4" role="alert">Error cargando horarios. Reintentar.</p>
        <Button variant="primary" onClick={refetchSlots}>Reintentar</Button>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="space-y-4 text-center py-8">
        <CalendarDays className="w-12 h-12 mx-auto text-muted" aria-hidden="true" />
        <p className="text-lg text-foreground font-medium">
          No hay horarios disponibles para esta fecha
        </p>
        <Button variant="outline" onClick={prevStep}>
          Seleccioná otra fecha
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 id="step-title" className="text-xl font-semibold text-foreground">Seleccioná el horario</h2>
      <p className="text-sm text-muted" id="slot-date-info">
        Horarios disponibles para el {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      {serviceDuration && (
        <p className="text-sm text-muted">
          Cada turno dura {serviceDuration} minutos
        </p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" role="radiogroup" aria-labelledby="step-title">
        {slots.map((s) => {
          const isAvailable = s.available !== false;
          const isSelected = slot === s.start;
          return (
            <button
              key={s.start}
              disabled={!isAvailable}
              onClick={() => selectSlot(s.start)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Horario ${s.start}${isAvailable ? '' : ' no disponible'}`}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium border transition-all
                ${isSelected
                  ? 'bg-foreground text-background border-foreground'
                  : isAvailable
                    ? 'border-border text-foreground hover:border-foreground hover:bg-gray-50'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                }
              `}
            >
              {s.start}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} aria-label="Volver al paso anterior">Atrás</Button>
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
