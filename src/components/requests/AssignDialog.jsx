import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AssignDialog = ({
  assignDialogFor,
  setAssignDialogFor,
  assignData,
  setAssignData,
  users,
  assignRequest
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    assignRequest(assignDialogFor);
    setAssignDialogFor(null);
  };

  return (
    <Dialog open={!!assignDialogFor} onOpenChange={() => setAssignDialogFor(null)}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Asignar Solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Usuario asignado */}
          <div>
            <label className="block mb-1 text-sm font-medium">Asignar a</label>
            <select
              name="assigned_to"
              value={assignData.assigned_to || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecciona un usuario</option>
              {users
                .filter(u => u.role === 'support')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
              ))}
            </select>
          </div>

          {/* Horas estimadas */}
          <div>
            <label className="block mb-1 text-sm font-medium">Horas estimadas</label>
            <input
              type="number"
              name="estimated_hours"
              value={assignData.estimated_hours || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej. 5"
              min="0"
            />
          </div>

          {/* Fecha estimada */}
          <div>
            <label className="block mb-1 text-sm font-medium">Fecha de entrega</label>
            <input
              type="datetime-local"
              name="estimated_due"
              value={assignData.estimated_due || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Botón de acción */}
          <div className="pt-2 flex justify-end">
            <Button onClick={handleSubmit}>
              Asignar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDialog;
