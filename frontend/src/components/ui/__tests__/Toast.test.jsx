import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastContainer, toast, useToasts } from '../Toast';

// We need to test ToastContainer which uses useToasts internally
// The toast() function communicates via listeners array

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders nothing when no toasts', () => {
    render(<ToastContainer />);
    // ToastContainer returns null when no toasts
    expect(document.body.textContent).not.toContain('Test message');
  });

  it('renders toast message when toast() is called', () => {
    render(<ToastContainer />);
    act(() => {
      toast('Hello world', 'info', 5000);
    });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders success variant with correct styling', () => {
    render(<ToastContainer />);
    act(() => {
      toast.success('Success!');
    });
    const toastEl = screen.getByText('Success!').closest('[role="alert"]');
    expect(toastEl.className).toContain('bg-green-50');
  });

  it('renders error variant with correct styling', () => {
    render(<ToastContainer />);
    act(() => {
      toast.error('Something went wrong');
    });
    const toastEl = screen.getByText('Something went wrong').closest('[role="alert"]');
    expect(toastEl.className).toContain('bg-red-50');
  });

  it('renders info variant with correct styling', () => {
    render(<ToastContainer />);
    act(() => {
      toast.info('Just so you know');
    });
    const toastEl = screen.getByText('Just so you know').closest('[role="alert"]');
    expect(toastEl.className).toContain('bg-blue-50');
  });

  it('auto-dismisses after duration', () => {
    render(<ToastContainer />);
    act(() => {
      toast('Auto dismiss', 'info', 3000);
    });
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
  });

  it('can be dismissed manually', () => {
    render(<ToastContainer />);
    act(() => {
      toast('Dismiss me', 'info', 5000);
    });
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss toast/i });
    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ToastContainer />);
    act(() => {
      toast('Alert message');
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('toast.success is a convenience method', () => {
    render(<ToastContainer />);
    act(() => {
      toast.success('Quick success');
    });
    expect(screen.getByText('Quick success')).toBeInTheDocument();
    const toastEl = screen.getByText('Quick success').closest('[role="alert"]');
    expect(toastEl.className).toContain('bg-green-50');
  });

  it('toast.error is a convenience method', () => {
    render(<ToastContainer />);
    act(() => {
      toast.error('Quick error');
    });
    expect(screen.getByText('Quick error')).toBeInTheDocument();
    const toastEl = screen.getByText('Quick error').closest('[role="alert"]');
    expect(toastEl.className).toContain('bg-red-50');
  });

  it('stacks multiple toasts', () => {
    render(<ToastContainer />);
    act(() => {
      toast('First');
      toast('Second');
    });
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
