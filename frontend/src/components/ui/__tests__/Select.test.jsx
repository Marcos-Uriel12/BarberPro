import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

describe('Select', () => {
  const options = [
    { value: '', label: 'Select one' },
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('renders with label', () => {
    render(<Select label="Choose" options={options} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('renders select element', () => {
    render(<Select label="Choose" options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="Choose" options={options} />);
    expect(screen.getByText('Select one')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select label="Choose" options={options} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows error message when error prop is provided', () => {
    render(<Select label="Choose" options={options} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('sets aria-invalid when there is an error', () => {
    render(<Select label="Choose" options={options} error="Required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is disabled when disabled=true', () => {
    render(<Select label="Choose" options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('associates label with select via htmlFor', () => {
    render(<Select label="Choose" options={options} />);
    const label = screen.getByText('Choose');
    const select = screen.getByRole('combobox');
    expect(label).toHaveAttribute('for', select.id);
  });

  it('uses id prop when provided', () => {
    render(<Select label="Choose" options={options} id="custom-select" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'custom-select');
  });

  it('renders with empty options array', () => {
    render(<Select label="Empty" options={[]} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('error message has role="alert"', () => {
    render(<Select label="Choose" options={options} error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
