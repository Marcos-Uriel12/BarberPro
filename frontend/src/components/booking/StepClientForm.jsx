import { useState, useEffect } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const PHONE_PREFIX = '+549';
const PHONE_REGEX = /^11[\d]{7,10}$/;

export function StepClientForm() {
  const { clientName, clientPhone, setClientData, nextStep } = useBooking();

  const [name, setName] = useState(clientName);
  const [phoneDigits, setPhoneDigits] = useState(
    clientPhone?.startsWith(PHONE_PREFIX) ? clientPhone.slice(PHONE_PREFIX.length) : ''
  );
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });

  // Pre-fill from context
  useEffect(() => {
    setName(clientName);
    if (clientPhone?.startsWith(PHONE_PREFIX)) {
      setPhoneDigits(clientPhone.slice(PHONE_PREFIX.length));
    }
  }, [clientName, clientPhone]);

  const validateName = (value) => {
    if (!value.trim()) return 'El nombre es obligatorio';
    return '';
  };

  const validatePhoneDigits = (value) => {
    if (!value.trim()) return 'El teléfono es obligatorio';
    if (!PHONE_REGEX.test(value)) return 'Debe empezar con 11 y tener al menos 9 dígitos';
    return '';
  };

  const fullPhone = phoneDigits ? `${PHONE_PREFIX}${phoneDigits}` : '';

  const localCanProceed =
    name.trim() !== '' &&
    phoneDigits.trim() !== '' &&
    validateName(name) === '' &&
    validatePhoneDigits(phoneDigits) === '';

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) setNameError(validateName(value));
  };

  const handlePhoneDigitsChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setPhoneDigits(value);
    if (touched.phone) setPhoneError(validatePhoneDigits(value));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name') setNameError(validateName(name));
    if (field === 'phone') setPhoneError(validatePhoneDigits(phoneDigits));
  };

  const handleContinue = () => {
    setTouched({ name: true, phone: true });
    const nErr = validateName(name);
    const pErr = validatePhoneDigits(phoneDigits);
    setNameError(nErr);
    setPhoneError(pErr);

    if (!nErr && !pErr) {
      setClientData({ name: name.trim(), phone: fullPhone });
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <h2 id="step-title" className="text-xl font-semibold text-foreground">Tus datos</h2>
      <div className="max-w-md space-y-4">
        <Input
          label="Nombre"
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          error={nameError}
          required
          placeholder="Tu nombre"
          maxLength={100}
          autoComplete="name"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-border bg-gray-50 text-sm text-muted select-none">
              {PHONE_PREFIX}
            </span>
            <input
              type="tel"
              value={phoneDigits}
              onChange={handlePhoneDigitsChange}
              onBlur={() => handleBlur('phone')}
              placeholder="1164898358"
              autoComplete="tel-national"
              maxLength={12}
              className={`
                flex-1 px-3 py-2 rounded-r-lg border border-border
                focus:outline-none focus:ring-2 focus:ring-foreground
                ${phoneError && touched.phone ? 'border-red-500 ring-red-500' : ''}
              `}
            />
          </div>
          {phoneError && touched.phone && (
            <p className="text-sm text-red-500 mt-1">{phoneError}</p>
          )}
          <p className="text-xs text-muted mt-1">
            El +549 se agrega automáticamente. Ingresá tu número empezando con 11.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!localCanProceed}
          aria-label="Continuar al siguiente paso"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}