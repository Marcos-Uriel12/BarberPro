import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAvailability } from '../useAvailability';
import * as apiModule from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const api = apiModule.api;

describe('useAvailability', () => {
  const barberId = 'barber-123';
  const date = '2026-05-15';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches slots when barberId and date are provided', async () => {
    const mockSlots = [
      { start: '09:00', end: '09:30', available: true },
      { start: '10:00', end: '10:30', available: true },
      { start: '11:00', end: '11:30', available: false },
    ];
    api.get.mockResolvedValue(mockSlots);

    const { result } = renderHook(() => useAvailability(barberId, date));

    expect(result.current.loading).toBe(true);
    expect(api.get).toHaveBeenCalledWith(
      `/api/v1/availability/barbers/${barberId}/slots?date=${date}`
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.slots).toEqual(mockSlots);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when barberId is missing', () => {
    renderHook(() => useAvailability(null, date));
    expect(api.get).not.toHaveBeenCalled();
  });

  it('does not fetch when date is missing', () => {
    renderHook(() => useAvailability(barberId, null));
    expect(api.get).not.toHaveBeenCalled();
  });

  it('handles fetch error', async () => {
    api.get.mockRejectedValue(new Error('Unavailable'));

    const { result } = renderHook(() => useAvailability(barberId, date));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Unavailable');
    expect(result.current.slots).toEqual([]);
  });

  it('refetches slots when refetchSlots is called', async () => {
    const firstCall = [{ start: '09:00', available: true }];
    const secondCall = [{ start: '09:00', available: true }, { start: '10:00', available: true }];

    api.get.mockResolvedValueOnce(firstCall);
    api.get.mockResolvedValueOnce(secondCall);

    const { result } = renderHook(() => useAvailability(barberId, date));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.slots).toEqual(firstCall);

    api.get.mockClear();
    api.get.mockResolvedValue(secondCall);

    await act(async () => {
      result.current.refetchSlots();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.slots).toEqual(secondCall);
  });

  it('re-fetches when barberId changes', async () => {
    api.get.mockResolvedValue([{ start: '09:00', available: true }]);

    const { result, rerender } = renderHook(
      ({ id, d }) => useAvailability(id, d),
      { initialProps: { id: barberId, d: date } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    api.get.mockClear();
    api.get.mockResolvedValue([{ start: '14:00', available: true }]);

    rerender({ id: 'barber-456', d: date });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/api/v1/availability/barbers/barber-456/slots?date=${date}`
      );
    });
  });

  it('re-fetches when date changes', async () => {
    api.get.mockResolvedValue([{ start: '09:00', available: true }]);

    const { result, rerender } = renderHook(
      ({ id, d }) => useAvailability(id, d),
      { initialProps: { id: barberId, d: date } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    api.get.mockClear();
    api.get.mockResolvedValue([{ start: '15:00', available: true }]);

    rerender({ id: barberId, d: '2026-05-16' });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/api/v1/availability/barbers/${barberId}/slots?date=2026-05-16`
      );
    });
  });

  it('starts with empty slots', () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAvailability(barberId, date));
    expect(result.current.slots).toEqual([]);
  });
});
