import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, LogOut, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/barbers', label: 'Barberos', icon: Users },
  { to: '/admin/services', label: 'Servicios', icon: Wrench },
];

export function Sidebar({ username, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const navRef = useRef(null);

  // Focus first nav item when sidebar opens on mobile
  useEffect(() => {
    if (mobileOpen && navRef.current) {
      const firstLink = navRef.current.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  }, [mobileOpen]);

  // Restore focus to hamburger when sidebar closes
  useEffect(() => {
    if (!mobileOpen && hamburgerRef.current) {
      hamburgerRef.current.focus();
    }
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-foreground text-background'
        : 'text-muted hover:bg-gray-100 hover:text-foreground'
    }`;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        ref={hamburgerRef}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded bg-background border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={mobileOpen}
        aria-controls="sidebar-nav"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        role="navigation"
        aria-label="Navegación principal del panel de administración"
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-border
          flex flex-col transition-transform lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">BarberPro</h2>
          <p className="text-sm text-muted">{username}</p>
        </div>

        <nav ref={navRef} className="flex-1 p-3 space-y-1" aria-label="Secciones del panel">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
