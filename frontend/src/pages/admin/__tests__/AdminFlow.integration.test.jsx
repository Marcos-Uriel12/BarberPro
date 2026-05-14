import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LoginPage } from '../LoginPage';
import { DashboardPage } from '../DashboardPage';
import { BarbersPage } from '../BarbersPage';
import { ServicesPage } from '../ServicesPage';
import { ProtectedRoute } from '../../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { api } from '../../../lib/api';

// Mock the api module
vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message, status, data) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

function AdminTestWrapper({ children, initialEntries = ['/admin/dashboard'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={children || <DashboardPage />} />
            <Route path="barbers" element={<BarbersPage />} />
            <Route path="services" element={<ServicesPage />} />
          </Route>
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockConfirm.mockReturnValue(true);
});

describe('Auth Flow', () => {
  it('shows login page and navigates to dashboard on success', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValueOnce({ csrf_token: 'test-token' });
    api.get.mockResolvedValueOnce({ username: 'admin' });

    render(<LoginPage />, { wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )});

    await user.type(screen.getByLabelText(/usuario/i), 'admin');
    await user.type(screen.getByLabelText(/contraseña/i), 'changeme');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        username: 'admin',
        password: 'changeme',
      });
    });
  });

  it('shows error on invalid credentials (401)', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce(null);
    api.post.mockRejectedValueOnce({ status: 401, message: 'Credenciales inválidas' });

    render(<LoginPage />, { wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )});

    await user.type(screen.getByLabelText(/usuario/i), 'admin');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
    });
  });

  it('blocks empty form submission', async () => {
    const user = userEvent.setup();
    api.get.mockResolvedValueOnce(null);

    render(<LoginPage />, { wrapper: ({ children }) => (
      <MemoryRouter initialEntries={['/admin/login']}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    )});

    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Campo obligatorio');
    });
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe('Protected Route', () => {
  it('redirects to login when not authenticated', async () => {
    api.get.mockResolvedValueOnce(null);

    render(
      <AdminTestWrapper initialEntries={['/admin/dashboard']}>
        <DashboardPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    });
  });
});

describe('Dashboard', () => {
  it('renders metric cards and appointment list with data', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/appointments'))
        return Promise.resolve([
          { id: '1', time: '10:00', client_name: 'Juan', barber_name: 'Carlos', service_name: 'Corte', status: 'confirmed', service_price: 1500 },
        ]);
      if (url.includes('/barbers')) return Promise.resolve([{ id: '1', name: 'Carlos', phone: '+5491112345678', price: 0 }]);
      if (url.includes('/services')) return Promise.resolve([{ id: '1', name: 'Corte', price: 1500, duration_minutes: 30 }]);
      return Promise.resolve([]);
    });

    render(
      <AdminTestWrapper initialEntries={['/admin/dashboard']}>
        <DashboardPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      const values = screen.getAllByText('1');
      expect(values.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows empty state when no appointments', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/appointments')) return Promise.resolve([]);
      if (url.includes('/barbers')) return Promise.resolve([]);
      if (url.includes('/services')) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    render(
      <AdminTestWrapper initialEntries={['/admin/dashboard']}>
        <DashboardPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay turnos próximos')).toBeInTheDocument();
    });
  });
});

describe('Barbers CRUD', () => {
  const mockBarbers = [
    { id: '1', name: 'Carlos', phone: '+5491112345678', price: 1500 },
    { id: '2', name: 'María', phone: '+5491187654321', price: null },
  ];

  it('lists barbers in a table', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/barbers')) return Promise.resolve(mockBarbers);
      return Promise.resolve([]);
    });

    render(
      <AdminTestWrapper initialEntries={['/admin/barbers']}>
        <BarbersPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
      expect(screen.getByText('María')).toBeInTheDocument();
    });
  });

  it('creates a new barber via modal form', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/barbers')) return Promise.resolve(mockBarbers);
      return Promise.resolve([]);
    });
    api.post.mockResolvedValueOnce({ id: '3', name: 'Nuevo', phone: '+5491199999999', price: 2000 });

    render(
      <AdminTestWrapper initialEntries={['/admin/barbers']}>
        <BarbersPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /nuevo barbero/i }));

    await user.type(screen.getByLabelText(/nombre/i), 'Nuevo Barbero');
    await user.type(screen.getByLabelText(/teléfono/i), '+5491199999999');
    await user.type(screen.getByLabelText(/precio/i), '2000');

    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/barbers', {
        name: 'Nuevo Barbero',
        phone: '+5491199999999',
        price: 2000,
      });
    });
  });

  it('deletes a barber with confirmation', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/barbers')) return Promise.resolve(mockBarbers);
      return Promise.resolve([]);
    });
    api.delete.mockResolvedValueOnce(null);

    render(
      <AdminTestWrapper initialEntries={['/admin/barbers']}>
        <BarbersPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/eliminar/i);
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/v1/barbers/1');
    });
  });

  it('shows 409 error when barber has appointments', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/barbers')) return Promise.resolve(mockBarbers);
      return Promise.resolve([]);
    });
    api.delete.mockRejectedValueOnce({ status: 409 });

    render(
      <AdminTestWrapper initialEntries={['/admin/barbers']}>
        <BarbersPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/eliminar/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('tiene turnos asociados');
    });
  });
});

describe('Services CRUD', () => {
  const mockServices = [
    { id: '1', name: 'Corte Clásico', price: 1500, duration_minutes: 30 },
    { id: '2', name: 'Barba', price: 800, duration_minutes: 20 },
  ];

  it('lists services in a table', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/services')) return Promise.resolve(mockServices);
      return Promise.resolve([]);
    });

    render(
      <AdminTestWrapper initialEntries={['/admin/services']}>
        <ServicesPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Corte Clásico')).toBeInTheDocument();
      expect(screen.getByText('Barba')).toBeInTheDocument();
    });
  });

  it('creates a new service via modal form', async () => {
    const user = userEvent.setup();
    api.get.mockImplementation((url) => {
      if (url.includes('/auth/me')) return Promise.resolve({ username: 'admin' });
      if (url.includes('/services')) return Promise.resolve(mockServices);
      if (url.includes('/global-price')) return Promise.resolve({ price: 2000 });
      return Promise.resolve([]);
    });
    api.post.mockResolvedValueOnce({ id: '3', name: 'Fade', price: 2000, duration_minutes: 45 });
    api.put.mockResolvedValueOnce({ price: 2500 });

    render(
      <AdminTestWrapper initialEntries={['/admin/services']}>
        <ServicesPage />
      </AdminTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Corte Clásico')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /nuevo servicio/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const inputs = dialog.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(3);

    await user.type(inputs[0], 'Corte Fade');
    await user.type(inputs[1], '2000');
    await user.type(inputs[2], '45');

    const createBtn = dialog.querySelector('button[type="submit"]');
    expect(createBtn).not.toBeNull();
    await user.click(createBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/services', {
        name: 'Corte Fade',
        price: 2000,
        duration_minutes: 45,
      });
    });
  });
});
