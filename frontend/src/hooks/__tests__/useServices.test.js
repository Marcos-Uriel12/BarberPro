import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServices } from '../useServices';
import * as apiModule from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const api = apiModule.api;

describe('useServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches services on mount', async () => {
    const mockServices = [
      { id: '1', name: 'Corte Clásico', price: 1500, duration_minutes: 30 },
      { id: '2', name: 'Barba', price: 800, duration_minutes: 20 },
    ];
    api.get.mockResolvedValue(mockServices);

    const { result } = renderHook(() => useServices());

    expect(result.current.loading).toBe(true);
    expect(api.get).toHaveBeenCalledWith('/api/v1/services');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(mockServices);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useServices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when refetch is called', async () => {
    const firstCall = [{ id: '1', name: 'Corte Clásico' }];
    const secondCall = [{ id: '1', name: 'Corte Clásico' }, { id: '2', name: 'Barba' }];

    api.get.mockResolvedValueOnce(firstCall);
    api.get.mockResolvedValueOnce(secondCall);

    const { result } = renderHook(() => useServices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(firstCall);

    api.get.mockClear();
    api.get.mockResolvedValue(secondCall);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(secondCall);
  });

  it('starts with empty data', () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useServices());
    expect(result.current.data).toEqual([]);
  });

  it('sets loading to true during refetch', async () => {
    api.get.mockResolvedValue([{ id: '1', name: 'Corte' }]);

    const { result } = renderHook(() => useServices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    api.get.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 50)));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
  });
});
