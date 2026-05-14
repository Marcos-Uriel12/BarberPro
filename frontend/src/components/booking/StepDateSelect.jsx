import { useBooking } from '../../contexts/BookingContext';
import { Button } from '../ui/Button';

function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getMaxDateString() {
  const max = new Date();
  max.setDate(max.getDate() + 30);
  return max.toISOString().split('T')[0];
}

export function StepDateSelect() {
  const { date, selectDate, nextStep, canProceed } = useBooking();

  const today = getTodayString();
  const maxDate = getMaxDateString();

  return (
    <div className="space-y-6">
      <h2 id="step-title" className="text-xl font-semibold text-foreground">Seleccioná la fecha</h2>
      <div className="max-w-sm">
        <label htmlFor="booking-date" className="block text-sm font-medium text-foreground mb-2">
          Fecha del turno
        </label>
        <input
          id="booking-date"
          type="date"
          min={today}
          max={maxDate}
          value={date || ''}
          onChange={(e) => selectDate(e.target.value || null)}
          className="w-full border border-border rounded px-3 py-2 text-foreground bg-background
            focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
          aria-describedby="date-range-info"
        />
        <p id="date-range-info" className="sr-only">
          Podés seleccionar una fecha desde hoy hasta 30 días en el futuro.
        </p>
        {date && (
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            Fecha seleccionada: {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
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
