import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when loading=true', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is disabled when loading=true', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled when disabled=true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies primary variant by default', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-foreground');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-gray-200');
  });

  it('applies danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-600');
  });

  it('applies outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border border-foreground');
  });

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-foreground');
    expect(button.className).toContain('hover:bg-gray-100');
  });

  it('applies size prop', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('text-lg');
  });

  it('passes through additional props', () => {
    render(<Button type="submit" data-testid="submit-btn">Submit</Button>);
    expect(screen.getByTestId('submit-btn')).toHaveAttribute('type', 'submit');
  });

  it('has focus ring styles', () => {
    render(<Button>Focusable</Button>);
    expect(screen.getByRole('button').className).toContain('focus:ring-2');
  });
});
