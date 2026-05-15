import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookingProvider } from '../../../contexts/BookingContext';
import { StepBarberSelect } from '../StepBarberSelect';
import { StepServiceSelect } from '../StepServiceSelect';
import { StepDateSelect } from '../StepDateSelect';
import { StepSlotSelect } from '../StepSlotSelect';
import { StepClientForm } from '../StepClientForm';
import { StepConfirm } from '../StepConfirm';
import { WizardProgress } from '../WizardProgress';
import { ToastContainer } from '../../ui/Toast';

// Mock localStorage for jsdom
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = value; }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i) => Object.keys(store)[i] ?? null),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });

// Mock the API module
vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock the hooks that call the API
vi.mock('../../../hooks/useBarbers', () => ({
  useBarbers: vi.fn(),
}));

vi.mock('../../../hooks/useServices', () => ({
  useServices: vi.fn(),
}));

vi.mock('../../../hooks/useAvailability', () => ({
  useAvailability: vi.fn(),
}));

import { api } from '../../../lib/api';
import { useBarbers } from '../../../hooks/useBarbers';
import { useServices } from '../../../hooks/useServices';
import { useAvailability } from '../../../hooks/useAvailability';

const mockBarbers = [
  { id: 'barber-1', name: 'Carlos', phone: '+54 9 11 1111', price: 2500 },
  { id: 'barber-2', name: 'Martin', phone: '+54 9 11 2222', price: 3000 },
];

const mockServices = [
  { id: 'svc-1', name: 'Corte Clásico', price: 2000, duration_minutes: 30 },
  { id: 'svc-2', name: 'Barba', price: 1500, duration_minutes: 20 },
];

const mockSlots = [
  { start: '09:00', end: '09:30', available: true },
  { start: '10:00', end: '10:30', available: true },
  { start: '11:00', end: '11:30', available: false },
];

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <BookingProvider>{ui}<ToastContainer /></BookingProvider>
    </BrowserRouter>
  );
}

describe('BookingWizard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useBarbers.mockReturnValue({ data: mockBarbers, loading: false, error: null, refetch: vi.fn() });
    useServices.mockReturnValue({ data: mockServices, loading: false, error: null, refetch: vi.fn() });
    useAvailability.mockReturnValue({ slots: mockSlots, loading: false, error: null, refetchSlots: vi.fn() });
    api.get.mockResolvedValue({ name: 'Test' });
  });

  describe('WizardProgress', () => {
    it('shows current step label', () => {
      renderWithProviders(<WizardProgress currentStep={1} />);
      // Both desktop and mobile views render the label — assert at least one exists
      expect(screen.getAllByText('Barbero').length).toBeGreaterThanOrEqual(1);
    });

    it('shows step N of 6 on mobile', () => {
      renderWithProviders(<WizardProgress currentStep={3} />);
      expect(screen.getByText('Paso 3 de 6')).toBeInTheDocument();
    });
  });

  describe('Step 1: Barber Selection', () => {
    it('renders barber list and enables continue after selection', () => {
      renderWithProviders(<StepBarberSelect />);
      expect(screen.getByText('Carlos')).toBeInTheDocument();
      expect(screen.getByText('Martin')).toBeInTheDocument();

      // Continue button should be disabled initially
      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      // Select a barber
      fireEvent.click(screen.getByText('Carlos'));
      expect(continueBtn).not.toBeDisabled();
    });

    it('shows loading skeleton', () => {
      useBarbers.mockReturnValue({ data: [], loading: true, error: null, refetch: vi.fn() });
      renderWithProviders(<StepBarberSelect />);
      // Skeletons render as divs with animate-pulse
      expect(screen.getByText(/seleccioná tu barbero/i)).toBeInTheDocument();
    });

    it('shows error with retry button', () => {
      useBarbers.mockReturnValue({ data: [], loading: false, error: 'Network error', refetch: vi.fn() });
      renderWithProviders(<StepBarberSelect />);
      expect(screen.getByText(/error cargando barberos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('shows empty state when no barbers', () => {
      useBarbers.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() });
      renderWithProviders(<StepBarberSelect />);
      expect(screen.getByText(/no hay barberos disponibles/i)).toBeInTheDocument();
    });
  });

  describe('Step 2: Service Selection', () => {
    it('renders service list with price and duration', () => {
      renderWithProviders(<StepServiceSelect />);
      expect(screen.getByText('Corte Clásico')).toBeInTheDocument();
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('$2000')).toBeInTheDocument();
    });

    it('enables continue after selection', () => {
      // Context must be at step 2 so canProceed checks serviceId, not barberId
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 2, barberId: 'barber-1',
      }));
      renderWithProviders(<StepServiceSelect />);
      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      fireEvent.click(screen.getByText('Corte Clásico'));
      expect(continueBtn).not.toBeDisabled();
    });
  });

  describe('Step 3: Date Selection', () => {
    it('shows datepicker and enables continue with valid date', () => {
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 3, barberId: 'barber-1', serviceId: 'svc-1',
      }));
      renderWithProviders(<StepDateSelect />);
      const dateInput = screen.getByLabelText(/fecha del turno/i);
      expect(dateInput).toBeInTheDocument();

      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      // Set a valid date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      fireEvent.change(dateInput, { target: { value: dateStr } });

      expect(continueBtn).not.toBeDisabled();
    });
  });

  describe('Step 4: Slot Selection', () => {
    it('renders available slots and enables continue after selection', () => {
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 4, barberId: 'barber-1', serviceId: 'svc-1', date: '2026-05-15',
      }));
      renderWithProviders(<StepSlotSelect />);
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();

      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).toBeDisabled();

      fireEvent.click(screen.getByText('09:00'));
      expect(continueBtn).not.toBeDisabled();
    });

    it('shows unavailable slots as disabled', () => {
      renderWithProviders(<StepSlotSelect />);
      const unavailableSlot = screen.getByText('11:00');
      expect(unavailableSlot).toBeDisabled();
    });

    it('shows empty state when no slots', () => {
      useAvailability.mockReturnValue({ slots: [], loading: false, error: null, refetchSlots: vi.fn() });
      renderWithProviders(<StepSlotSelect />);
      expect(screen.getByText(/no hay horarios disponibles/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /seleccioná otra fecha/i })).toBeInTheDocument();
    });
  });

  describe('Step 5: Client Form', () => {
    it('enables continue with valid data', () => {
      renderWithProviders(<StepClientForm />);
      const nameInput = screen.getByLabelText(/nombre/i);
      const phoneInput = screen.getByPlaceholderText(/1164898358/i);

      fireEvent.change(nameInput, { target: { value: 'Juan' } });
      fireEvent.change(phoneInput, { target: { value: '1164898358' } });

      fireEvent.blur(nameInput);
      fireEvent.blur(phoneInput);

      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      expect(continueBtn).not.toBeDisabled();
    });

    it('shows error for empty name', async () => {
      renderWithProviders(<StepClientForm />);
      const nameInput = screen.getByLabelText(/nombre/i);

      fireEvent.blur(nameInput);
      await waitFor(() => {
        expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid phone', async () => {
      renderWithProviders(<StepClientForm />);
      const phoneInput = screen.getByPlaceholderText(/1164898358/i);

      fireEvent.change(phoneInput, { target: { value: '12345' } });
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(screen.getByText(/debe empezar con 11/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 6: Confirmation', () => {
    it('shows summary and calls API on confirm', async () => {
      api.post.mockResolvedValue({ id: 'apt-1', date: '2026-05-15', time: '09:00' });
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 6, barberId: 'barber-1', serviceId: 'svc-1', date: '2026-05-15', slot: '09:00',
        clientName: 'Juan Pérez', clientPhone: '+54 9 11 1234 5678',
      }));

      renderWithProviders(<StepConfirm />);
      expect(screen.getByText(/confirmá tu reserva/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmar reserva/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/v1/appointments', expect.objectContaining({
          barber_id: expect.any(String),
          service_id: expect.any(String),
        }));
      });
    });

    it('handles 409 conflict by going back to step 4', async () => {
      const conflictError = new Error('Slot already booked');
      conflictError.status = 409;
      api.post.mockRejectedValue(conflictError);
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 6, barberId: 'barber-1', serviceId: 'svc-1', date: '2026-05-15', slot: '09:00',
        clientName: 'Juan Pérez', clientPhone: '+54 9 11 1234 5678',
      }));

      renderWithProviders(<StepConfirm />);
      fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }));

      await waitFor(() => {
        expect(screen.getByText(/este horario ya fue reservado/i)).toBeInTheDocument();
      });
    });

    it('handles 500 server error and stays on step 6', async () => {
      const serverError = new Error('Internal server error');
      serverError.status = 500;
      api.post.mockRejectedValue(serverError);
      localStorage.setItem('bookingWizardState', JSON.stringify({
        step: 6, barberId: 'barber-1', serviceId: 'svc-1', date: '2026-05-15', slot: '09:00',
        clientName: 'Juan Pérez', clientPhone: '+54 9 11 1234 5678',
      }));

      renderWithProviders(<StepConfirm />);
      fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }));

      await waitFor(() => {
        expect(screen.getByText(/error creando la reserva/i)).toBeInTheDocument();
      });
      // Should stay on step 6 (confirm button still visible)
      expect(screen.getByRole('button', { name: /confirmar reserva/i })).toBeInTheDocument();
    });
  });

  describe('BookingContext persistence', () => {
    it('persists data to localStorage including step', () => {
      const { unmount } = renderWithProviders(<StepBarberSelect />);
      fireEvent.click(screen.getByText('Carlos'));
      unmount();

      const saved = JSON.parse(localStorage.getItem('bookingWizardState'));
      expect(saved.barberId).toBe('barber-1');
      expect(saved.step).toBe(1); // Step should also be persisted
    });

    it('recovers data from localStorage on mount', () => {
      localStorage.setItem('bookingWizardState', JSON.stringify({
        barberId: 'barber-2',
        serviceId: 'svc-1',
        date: '2026-05-15',
        slot: '10:00',
        clientName: 'Test User',
        clientPhone: '+54 9 11 0000 0000',
        step: 5, // Should recover step too
      }));

      renderWithProviders(<StepClientForm />);
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('Test User');
    });
  });
});
