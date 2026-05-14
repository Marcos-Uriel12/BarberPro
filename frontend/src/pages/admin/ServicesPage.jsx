import { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import { ServiceForm } from '../../components/admin/ServiceForm';
import { GlobalPriceForm } from '../../components/admin/GlobalPriceForm';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function ServicesPage() {
  const { data: services, loading, error, refetch } = useServices();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleNew = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingService(null);
    refetch();
  };

  const handleDelete = async (service) => {
    setDeleteError('');
    if (!window.confirm(`¿Eliminar "${service.name}"?`)) return;

    try {
      await api.delete(`/api/v1/services/${service.id}`);
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
        <p className="text-red-600 mb-4">Error cargando servicios</p>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Price Section */}
      <GlobalPriceForm />

      {/* Services Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Servicios</h2>
          <Button variant="primary" onClick={handleNew}>
            <Plus className="w-4 h-4" />
            Nuevo Servicio
          </Button>
        </div>

        {deleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm" role="alert">
            {deleteError}
          </div>
        )}

        {services.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-8 text-center">
            <p className="text-muted">No hay servicios. Crear uno nuevo.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Nombre</th>
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Precio</th>
                  <th scope="col" className="text-left py-3 px-4 text-muted font-medium">Duración</th>
                  <th scope="col" className="text-right py-3 px-4 text-muted font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-foreground">{service.name}</td>
                    <td className="py-3 px-4 text-foreground">
                      ${Number(service.price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-foreground">{service.duration_minutes} min</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-foreground transition-colors"
                          aria-label={`Editar ${service.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                          aria-label={`Eliminar ${service.name}`}
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
      </div>

      <Modal
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        open={modalOpen}
        onClose={handleCloseModal}
      >
        <ServiceForm service={editingService} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
}
