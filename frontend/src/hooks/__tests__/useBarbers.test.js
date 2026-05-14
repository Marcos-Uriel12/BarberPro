import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBarbers } from '../useBarbers';
import * as apiModule from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const api = apiModule.api;

describe('useBarbers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches barbers on mount', async () => {
    const mockBarbers = [
      { id: '1', name: 'Carlos', phone: '123', price: 1000 },
      { id: '2', name: 'Maria', phone: '456', price: 1200 },
    ];
    api.get.mockResolvedValue(mockBarbers);

    const { result } = renderHook(() => useBarbers());

    expect(result.current.loading).toBe(true);
    expect(api.get).toHaveBeenCalledWith('/api/v1/barbers');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual(mockBarbers);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    api.get.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBarbers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when refetch is called', async () => {
    const firstCall = [{ id: '1', name: 'Carlos' }];
    const secondCall = [{ id: '1', name: 'Carlos' }, { id: '2', name: 'Maria' }];

    api.get.mockResolvedValueOnce(firstCall);
    api.get.mockResolvedValueOnce(secondCall);

    const { result } = renderHook(() => useBarbers());

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
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useBarbers());
    expect(result.current.data).toEqual([]);
  });

  it('sets loading to true during refetch', async () => {
    api.get.mockResolvedValue([{ id: '1', name: 'Carlos' }]);

    const { result } = renderHook(() => useBarbers());

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

// Need to import act
import { act } from '@testing-library/react';
