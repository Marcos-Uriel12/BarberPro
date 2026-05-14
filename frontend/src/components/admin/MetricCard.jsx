import { Skeleton } from '../ui/Skeleton';

export function MetricCard({ title, value, icon: Icon, loading = false, error = null }) {
  return (
    <div className="bg-white border border-border rounded-lg p-4" aria-label={title}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-1" aria-label="Cargando..." />
          ) : error ? (
            <p className="text-sm text-red-600 mt-1" role="alert">Error cargando</p>
          ) : (
            <p className="text-2xl font-bold text-foreground mt-1" aria-live="polite">{value}</p>
          )}
        </div>
        {Icon && !loading && !error && (
          <div className="p-3 bg-gray-100 rounded-lg" aria-hidden="true">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
