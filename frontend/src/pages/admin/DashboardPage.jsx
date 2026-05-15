import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MetricCard } from '../../components/admin/MetricCard';
import { AppointmentList } from '../../components/admin/AppointmentList';
import { CalendarDays, DollarSign, Users } from 'lucide-react';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function DashboardPage() {
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState({ appointments: true, barbers: true, services: true });
  const [error, setError] = useState({ appointments: null, barbers: null, services: null });

  useEffect(() => {
    const fetchAll = async () => {
      const date = todayStr();

      // Fetch appointments today
      (async () => {
        try {
          const data = await api.get(`/api/v1/appointments?date=${date}`);
          setAppointmentsToday(Array.isArray(data) ? data : []);
        } catch {
          setError((prev) => ({ ...prev, appointments: true }));
        } finally {
          setLoading((prev) => ({ ...prev, appointments: false }));
        }
      })();

      // Fetch barbers
      (async () => {
        try {
          const data = await api.get('/api/v1/barbers');
          setBarbers(Array.isArray(data) ? data : []);
        } catch {
          setError((prev) => ({ ...prev, barbers: true }));
        } finally {
          setLoading((prev) => ({ ...prev, barbers: false }));
        }
      })();

      // Fetch services
      (async () => {
        try {
          const data = await api.get('/api/v1/services');
          setServices(Array.isArray(data) ? data : []);
        } catch {
          setError((prev) => ({ ...prev, services: true }));
        } finally {
          setLoading((prev) => ({ ...prev, services: false }));
        }
      })();
    };

    fetchAll();
  }, []);

  // Calculate estimated revenue from today's CONFIRMED appointments
  const estimatedRevenue = appointmentsToday.reduce((sum, apt) => {
    if (apt.status !== 'confirmed') return sum;
    const price = apt.service_price || 0;
    return sum + Number(price);
  }, 0);

  const handleRefresh = () => {
    // Re-fetch appointments
    const date = todayStr();
    (async () => {
      try {
        const data = await api.get(`/api/v1/appointments?date=${date}`);
        setAppointmentsToday(Array.isArray(data) ? data : []);
      } catch {
        setError((prev) => ({ ...prev, appointments: true }));
      }
    })();
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Turnos Hoy"
          value={appointmentsToday.length}
          icon={CalendarDays}
          loading={loading.appointments}
          error={error.appointments}
        />
        <MetricCard
          title="Ingresos Estimados"
          value={`$${estimatedRevenue.toLocaleString()}`}
          icon={DollarSign}
          loading={loading.services}
          error={error.services}
        />
        <MetricCard
          title="Barberos Activos"
          value={barbers.length}
          icon={Users}
          loading={loading.barbers}
          error={error.barbers}
        />
      </div>

      {/* Appointment List */}
      <AppointmentList
        appointments={appointmentsToday.slice(0, 10)}
        loading={loading.appointments}
        error={error.appointments}
        onStatusChange={handleRefresh}
      />
    </div>
  );
}
