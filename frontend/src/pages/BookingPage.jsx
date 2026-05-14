import { BookingProvider, useBooking } from '../contexts/BookingContext';
import { WizardProgress } from '../components/booking/WizardProgress';
import { StepBarberSelect } from '../components/booking/StepBarberSelect';
import { StepServiceSelect } from '../components/booking/StepServiceSelect';
import { StepDateSelect } from '../components/booking/StepDateSelect';
import { StepSlotSelect } from '../components/booking/StepSlotSelect';
import { StepClientForm } from '../components/booking/StepClientForm';
import { StepConfirm } from '../components/booking/StepConfirm';

const steps = {
  1: StepBarberSelect,
  2: StepServiceSelect,
  3: StepDateSelect,
  4: StepSlotSelect,
  5: StepClientForm,
  6: StepConfirm,
};

const stepTitles = {
  1: 'Seleccioná tu barbero',
  2: 'Seleccioná el servicio',
  3: 'Seleccioná la fecha',
  4: 'Seleccioná el horario',
  5: 'Tus datos',
  6: 'Confirmá tu reserva',
};

function BookingWizard() {
  const { step } = useBooking();
  const StepComponent = steps[step] || steps[1];

  return (
    <div className="space-y-6" aria-label={`Paso ${step} de 6: ${stepTitles[step]}`}>
      <WizardProgress currentStep={step} />
      <StepComponent />
    </div>
  );
}

export function BookingPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-xl shadow-sm border border-border p-6">
            <main id="main-content">
              <BookingWizard />
            </main>
          </div>
        </div>
      </div>
    </BookingProvider>
  );
}
