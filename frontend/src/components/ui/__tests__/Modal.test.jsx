import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

const MockModal = ({ children, ...props }) => (
  <Modal {...props}>
    <div data-testid="modal-content">{children}</div>
  </Modal>
);

describe('Modal', () => {
  it('does not render when open=false', () => {
    render(<MockModal open={false} onClose={vi.fn()}>Content</MockModal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<MockModal open onClose={vi.fn()}>Content</MockModal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<MockModal open onClose={vi.fn()} title="Test Title">Content</MockModal>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<MockModal open onClose={vi.fn()}>Modal Body</MockModal>);
    expect(screen.getByTestId('modal-content')).toHaveTextContent('Modal Body');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MockModal open onClose={handleClose}>Content</MockModal>);
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<MockModal open onClose={handleClose}>Content</MockModal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', () => {
    const handleClose = vi.fn();
    render(<MockModal open onClose={handleClose}>Content</MockModal>);
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal', () => {
    const handleClose = vi.fn();
    render(<MockModal open onClose={handleClose}>Content</MockModal>);
    fireEvent.click(screen.getByTestId('modal-content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('has aria-modal="true"', () => {
    render(<MockModal open onClose={vi.fn()}>Content</MockModal>);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to title', () => {
    render(<MockModal open onClose={vi.fn()} title="My Modal">Content</MockModal>);
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveTextContent('My Modal');
  });

  it('removes escape listener when closed', () => {
    const handleClose = vi.fn();
    const { rerender } = render(<MockModal open onClose={handleClose}>Content</MockModal>);
    rerender(<MockModal open={false} onClose={handleClose}>Content</MockModal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    // After closing, pressing escape should not trigger onClose
    // (the listener should be removed)
    expect(handleClose).toHaveBeenCalledTimes(0);
  });
});
