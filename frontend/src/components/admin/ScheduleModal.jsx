import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { toast } from '../ui/Toast';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';

export function ScheduleModal({ barberId, open, onClose, onSaved }) {
  const [schedule, setSchedule] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing availabilities
  useEffect(() => {
    if (!open || !barberId) return;
    setLoading(true);
    api.get(`/api/v1/availability/barbers/${barberId}`)
      .then((availabilities) => {
        const initial = {};
        for (let i = 0; i < 7; i++) {
          const existing = availabilities.find(a => a.day_of_week === i);
          initial[i] = existing
            ? { active: true, start: existing.start_time, end: existing.end_time, id: existing.id }
            : { active: false, start: DEFAULT_START, end: DEFAULT_END, id: null };
        }
        setSchedule(initial);
      })
      .catch(() => toast.error('Error cargando horarios'))
      .finally(() => setLoading(false));
  }, [open, barberId]);

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const updateTime = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(schedule);
      for (const [day, entry] of entries) {
        if (entry.active) {
          // Delete existing if any (delete-then-create to avoid conflicts)
          if (entry.id) {
            await api.delete(`/api/v1/availability/${entry.id}`);
          }
          // Create new
          await api.post('/api/v1/availability/', {
            barber_id: barberId,
            day_of_week: parseInt(day),
            start_time: entry.start,
            end_time: entry.end,
          });
        } else if (entry.id) {
          // Was active, now inactive → delete
          await api.delete(`/api/v1/availability/${entry.id}`);
        }
      }
      toast.success('Horarios guardados');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error('Error guardando horarios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Horarios del barbero">
      {loading ? (
        <div className="p-4 text-center text-muted">Cargando horarios...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((dayName, i) => (
            <div key={i} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-24">
                <input
                  type="checkbox"
                  checked={schedule[i]?.active || false}
                  onChange={() => toggleDay(i)}
                  className="rounded"
                />
                <span className="text-sm font-medium">{dayName}</span>
              </label>
              {schedule[i]?.active && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={schedule[i].start}
                    onChange={(e) => updateTime(i, 'start', e.target.value)}
                    className="border border-border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-muted">a</span>
                  <input
                    type="time"
                    value={schedule[i].end}
                    onChange={(e) => updateTime(i, 'end', e.target.value)}
                    className="border border-border rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Guardar Horarios
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
