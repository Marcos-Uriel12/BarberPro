import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

const STORAGE_KEY = 'bookingWizardState';

const PHONE_REGEX = /^\+?[\d\s-]{7,20}$/;

export function BookingProvider({ children }) {
  const [step, setStep] = useState(1);
  const [barberId, setBarberId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Recover from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.barberId) setBarberId(data.barberId);
        if (data.serviceId) setServiceId(data.serviceId);
        if (data.date) setDate(data.date);
        if (data.slot) setSlot(data.slot);
        if (data.clientName) setClientName(data.clientName);
        if (data.clientPhone) setClientPhone(data.clientPhone);
        if (data.step) setStep(data.step); // Recover step too
      } catch {
        // Corrupted data, ignore
      }
    }
  }, []);

  // Persist on every change (including step)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      step, barberId, serviceId, date, slot, clientName, clientPhone,
    }));
  }, [step, barberId, serviceId, date, slot, clientName, clientPhone]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (n) => setStep(Math.max(1, Math.min(n, 6)));

  const reset = () => {
    setStep(1);
    setBarberId(null);
    setServiceId(null);
    setDate(null);
    setSlot(null);
    setClientName('');
    setClientPhone('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const validatePhone = (phone) => PHONE_REGEX.test(phone);

  const canProceed = {
    1: barberId !== null,
    2: serviceId !== null,
    3: date !== null,
    4: slot !== null,
    5: clientName.trim() !== '' && validatePhone(clientPhone),
    6: true,
  }[step];

  return (
    <BookingContext.Provider
      value={{
        step,
        barberId,
        serviceId,
        date,
        slot,
        clientName,
        clientPhone,
        nextStep,
        prevStep,
        goToStep,
        reset,
        selectBarber: setBarberId,
        selectService: setServiceId,
        selectDate: setDate,
        selectSlot: setSlot,
        setClientData: ({ name, phone }) => {
          setClientName(name);
          setClientPhone(phone);
        },
        canProceed,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return ctx;
}
