import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingProvider, useBooking } from '../BookingContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('BookingContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <BookingProvider>{children}</BookingProvider>;

  it('starts at step 1', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.step).toBe(1);
  });

  it('selectBarber updates barberId', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
    });
    expect(result.current.barberId).toBe('barber-123');
  });

  it('selectService updates serviceId', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectService('service-456');
    });
    expect(result.current.serviceId).toBe('service-456');
  });

  it('selectDate updates date', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectDate('2026-05-15');
    });
    expect(result.current.date).toBe('2026-05-15');
  });

  it('selectSlot updates slot', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectSlot('10:00');
    });
    expect(result.current.slot).toBe('10:00');
  });

  it('setClientData updates name and phone', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.setClientData({ name: 'Juan', phone: '+54 9 11 1234 5678' });
    });
    expect(result.current.clientName).toBe('Juan');
    expect(result.current.clientPhone).toBe('+54 9 11 1234 5678');
  });

  it('nextStep increments step', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(2);
  });

  it('nextStep caps at step 6', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.nextStep();
      }
    });
    expect(result.current.step).toBe(6);
  });

  it('prevStep decrements step', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.prevStep();
    });
    expect(result.current.step).toBe(2);
  });

  it('prevStep caps at step 1', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.step).toBe(1);
  });

  it('goToStep sets specific step', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.goToStep(4);
    });
    expect(result.current.step).toBe(4);
  });

  it('reset clears all state', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
      result.current.selectService('service-456');
      result.current.selectDate('2026-05-15');
      result.current.selectSlot('10:00');
      result.current.setClientData({ name: 'Juan', phone: '+54 9 11 1234 5678' });
      result.current.nextStep();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.step).toBe(1);
    expect(result.current.barberId).toBeNull();
    expect(result.current.serviceId).toBeNull();
    expect(result.current.date).toBeNull();
    expect(result.current.slot).toBeNull();
    expect(result.current.clientName).toBe('');
    expect(result.current.clientPhone).toBe('');
  });

  it('reset removes localStorage data', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
    });
    act(() => {
      result.current.reset();
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('bookingWizardState');
  });

  it('persists state to localStorage on change', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    expect(lastCall[0]).toBe('bookingWizardState');
    const data = JSON.parse(lastCall[1]);
    expect(data.barberId).toBe('barber-123');
  });

  it('recovers state from localStorage on mount', () => {
    const savedData = JSON.stringify({
      step: 3,
      barberId: 'barber-123',
      serviceId: 'service-456',
      date: '2026-05-15',
      slot: null,
      clientName: '',
      clientPhone: '',
    });
    localStorageMock.getItem.mockReturnValue(savedData);

    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.barberId).toBe('barber-123');
    expect(result.current.serviceId).toBe('service-456');
    expect(result.current.date).toBe('2026-05-15');
    expect(result.current.step).toBe(3);
  });

  it('canProceed is true when barber is selected (step 1)', async () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.step).toBe(1);
    expect(result.current.barberId).toBeNull();
    expect(result.current.canProceed).toBe(false);

    await act(async () => {
      result.current.selectBarber('barber-123');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is false when no barber selected (step 1)', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    expect(result.current.step).toBe(1);
    expect(result.current.barberId).toBeNull();
    expect(result.current.canProceed).toBe(false);
  });

  it('canProceed is true when service is selected (step 2)', async () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    await act(async () => {
      result.current.selectBarber('barber-123');
    });
    await act(async () => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(2);
    await act(async () => {
      result.current.selectService('service-456');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is true when date is selected (step 3)', async () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    await act(async () => {
      result.current.selectBarber('barber-123');
    });
    await act(async () => {
      result.current.nextStep();
    });
    await act(async () => {
      result.current.selectService('service-456');
    });
    await act(async () => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(3);
    await act(async () => {
      result.current.selectDate('2026-05-15');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is true when slot is selected (step 4)', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
      result.current.nextStep();
      result.current.selectService('service-456');
      result.current.nextStep();
      result.current.selectDate('2026-05-15');
      result.current.nextStep();
      result.current.selectSlot('10:00');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is true when client data is valid (step 5)', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.selectBarber('barber-123');
      result.current.nextStep();
      result.current.selectService('service-456');
      result.current.nextStep();
      result.current.selectDate('2026-05-15');
      result.current.nextStep();
      result.current.selectSlot('10:00');
      result.current.nextStep();
      result.current.setClientData({ name: 'Juan Pérez', phone: '+54 9 11 1234 5678' });
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is always true at step 6', () => {
    const { result } = renderHook(() => useBooking(), { wrapper });
    act(() => {
      result.current.goToStep(6);
    });
    expect(result.current.canProceed).toBe(true);
  });
});
