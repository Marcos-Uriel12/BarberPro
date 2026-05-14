import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { LogOut } from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar username={user?.username || 'Admin'} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between lg:pl-6 pl-16">
          <h1 className="text-xl font-semibold text-foreground">Panel de Administración</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:inline">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-foreground transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
