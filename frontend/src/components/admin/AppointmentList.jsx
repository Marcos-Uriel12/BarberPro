import { Skeleton } from '../ui/Skeleton';

export function AppointmentList({ appointments = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Turnos</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Turnos</h3>
        <p className="text-sm text-red-600">Error cargando turnos</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Turnos</h3>
        <p className="text-muted">No hay turnos próximos</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Turnos</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left py-2 px-3 text-muted font-medium">Hora</th>
              <th scope="col" className="text-left py-2 px-3 text-muted font-medium">Cliente</th>
              <th scope="col" className="text-left py-2 px-3 text-muted font-medium">Barbero</th>
              <th scope="col" className="text-left py-2 px-3 text-muted font-medium">Servicio</th>
              <th scope="col" className="text-left py-2 px-3 text-muted font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-b border-border last:border-0">
                <td className="py-2 px-3 text-foreground">{apt.time}</td>
                <td className="py-2 px-3 text-foreground">{apt.client_name}</td>
                <td className="py-2 px-3 text-foreground">{apt.barber_name}</td>
                <td className="py-2 px-3 text-foreground">{apt.service_name}</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      apt.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : apt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
