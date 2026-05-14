import { Check } from 'lucide-react';

const stepLabels = [
  'Barbero',
  'Servicio',
  'Fecha',
  'Horario',
  'Datos',
  'Confirmar',
];

export function WizardProgress({ currentStep }) {
  return (
    <nav aria-label="Progreso del wizard">
      {/* Desktop: horizontal timeline */}
      <ol className="hidden md:flex items-center justify-between w-full">
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isPending = stepNum > currentStep;

          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all
                    ${isCompleted
                      ? 'bg-foreground text-background border-foreground'
                      : isActive
                        ? 'border-foreground text-foreground bg-background'
                        : 'border-gray-300 text-gray-400 bg-background'
                    }
                  `}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`
                    text-xs font-medium
                    ${isActive ? 'text-foreground' : isCompleted ? 'text-foreground' : 'text-gray-400'}
                  `}
                >
                  {label}
                </span>
              </div>
              {index < stepLabels.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 mt-[-1.25rem]
                    ${isCompleted ? 'bg-foreground' : 'bg-gray-200'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact step indicator */}
      <div className="md:hidden flex items-center justify-center gap-2 text-sm">
        <span className="font-medium text-foreground">
          Paso {currentStep} de {stepLabels.length}
        </span>
        <span className="text-muted">—</span>
        <span className="text-muted">{stepLabels[currentStep - 1]}</span>
      </div>
    </nav>
  );
}
