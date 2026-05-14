import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

let toastId = 0;
let listeners = [];

function generateId() {
  return ++toastId;
}

export function toast(message, variant = 'info', duration = 5000) {
  const id = generateId();
  const newToast = { id, message, variant, duration };
  listeners.forEach((fn) => fn(newToast, 'add'));
  return id;
}

toast.success = (message, duration) => toast(message, 'success', duration);
toast.error = (message, duration) => toast(message, 'error', duration);
toast.info = (message, duration) => toast(message, 'info', duration);

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t, action) => {
      if (action === 'add') {
        setToasts((prev) => [...prev, t]);
      }
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}

function ToastItem({ toast, onDismiss }) {
  const Icon = icons[toast.variant];

  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${colors[toast.variant]}`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:opacity-70"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
}
