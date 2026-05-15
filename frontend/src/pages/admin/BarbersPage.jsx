import { useState, useCallback } from 'react';
import { useBarbers } from '../../hooks/useBarbers';
import { BarberForm } from '../../components/admin/BarberForm';
import { ScheduleModal } from '../../components/admin/ScheduleModal';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';

export function BarbersPage() {
  const { data: barbers, loading, error, refetch } = useBarbers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [scheduleBarberId, setScheduleBarberId] = useState(null);

  const handleNew = () => {
    setEditingBarber(null);
    setModalOpen(true);
  };

  const handleEdit = (barber) => {
    setEditingBarber(barber);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBarber(null);
    refetch();
  };

  const handleDelete = async (barber) => {
    setDeleteError('');
    if (!window.confirm(`¿Eliminar a "${barber.name}"?`)) return;

    try {
      await api.delete(`/api/v1/barbers/${barber.id}`);
      refetch();
    } catch (err) {
      if (err.status === 409) {
        setDeleteError('No se puede eliminar: tiene turnos asociados');
      } else {
        setDeleteError('Error al eliminar. Reintentar.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error cargando barberos</p>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Barberos</h2>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" />
          Nuevo Barbero
        </Button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm" role="alert">
          {deleteError}
        </div>
      )}

      {barbers.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-8 text-center">
          <p className="text-muted">No hay barberos. Crear uno nuevo.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Nombre</th>
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Teléfono</th>
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Precio</th>
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Horarios</th>
                  <th scope="col" className="text-right py-3 px-4 text-muted font-medium">Acciones</th>
                </tr>
              </thead>
            <tbody>
              {barbers.map((barber) => (
                <tr key={barber.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-foreground">{barber.name}</td>
                  <td className="py-3 px-4 text-foreground">{barber.phone}</td>
                  <td className="py-3 px-4 text-foreground">
                    {barber.price ? `$${Number(barber.price).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => setScheduleBarberId(barber.id)}>
                      <Clock className="w-4 h-4" />
                      Horarios
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(barber)}
                        className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-foreground transition-colors"
                        aria-label={`Editar ${barber.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(barber)}
                        className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                        aria-label={`Eliminar ${barber.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
        open={modalOpen}
        onClose={handleCloseModal}
      >
        <BarberForm barber={editingBarber} onClose={handleCloseModal} />
      </Modal>

      <ScheduleModal
        barberId={scheduleBarberId}
        open={!!scheduleBarberId}
        onClose={() => setScheduleBarberId(null)}
        onSaved={() => {/* optional refetch */}}
      />
    </div>
  );
}
