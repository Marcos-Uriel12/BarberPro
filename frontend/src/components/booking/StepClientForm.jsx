import { useState, useEffect } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const PHONE_REGEX = /^\+?[\d\s-]{7,20}$/;

export function StepClientForm() {
  const { clientName, clientPhone, setClientData, nextStep, canProceed } = useBooking();

  const [name, setName] = useState(clientName);
  const [phone, setPhone] = useState(clientPhone);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });

  // Pre-fill from context (which loads from localStorage)
  useEffect(() => {
    setName(clientName);
    setPhone(clientPhone);
  }, [clientName, clientPhone]);

  const validateName = (value) => {
    if (!value.trim()) return 'El nombre es obligatorio';
    if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
    return '';
  };

  const validatePhone = (value) => {
    if (!value.trim()) return 'El teléfono es obligatorio';
    if (!PHONE_REGEX.test(value)) return 'Teléfono inválido. Ej: +54 9 11 1234 5678';
    return '';
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) setNameError(validateName(value));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (touched.phone) setPhoneError(validatePhone(value));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name') setNameError(validateName(name));
    if (field === 'phone') setPhoneError(validatePhone(phone));
  };

  const handleContinue = () => {
    setTouched({ name: true, phone: true });
    const nErr = validateName(name);
    const pErr = validatePhone(phone);
    setNameError(nErr);
    setPhoneError(pErr);

    if (!nErr && !pErr) {
      setClientData({ name: name.trim(), phone: phone.trim() });
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Tus datos</h2>
      <div className="max-w-md space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          error={nameError}
          required
          placeholder="Juan Pérez"
          maxLength={100}
        />
        <Input
          label="Teléfono"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          onBlur={() => handleBlur('phone')}
          error={phoneError}
          required
          placeholder="+54 9 11 1234 5678"
        />
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
