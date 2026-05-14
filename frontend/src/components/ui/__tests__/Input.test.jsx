import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders input element', () => {
    render(<Input label="Username" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(<Input label="Username" />);
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('sets aria-invalid when there is an error', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby pointing to error element', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByRole('textbox');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId)).toHaveTextContent('Invalid email');
  });

  it('shows required indicator when required=true', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('is disabled when disabled=true', () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'John' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies error styling to input border', () => {
    render(<Input label="Email" error="Invalid" />);
    expect(screen.getByRole('textbox').className).toContain('border-red-500');
  });

  it('uses id prop when provided', () => {
    render(<Input label="Name" id="custom-id" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  it('renders without label when label is not provided', () => {
    render(<Input />);
    expect(screen.queryByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText(/label/i)).not.toBeInTheDocument();
  });

  it('error message has role="alert"', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });
});
