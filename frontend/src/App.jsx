import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './pages/admin/LoginPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { ToastContainer } from './components/ui/Toast';
import { Spinner } from './components/ui/Spinner';

// Lazy loaded admin pages
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const BarbersPage = lazy(() => import('./pages/admin/BarbersPage'));
const ServicesPage = lazy(() => import('./pages/admin/ServicesPage'));

function AdminFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Skip link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg"
        >
          Saltar al contenido principal
        </a>

        <Routes>
          {/* Public routes */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />

          {/* Auth routes */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected admin routes with lazy loading */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="barbers"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <BarbersPage />
                </Suspense>
              }
            />
            <Route
              path="services"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <ServicesPage />
                </Suspense>
              }
            />
          </Route>

          {/* Catch-all redirects to booking */}
          <Route path="*" element={<Navigate to="/booking" replace />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
