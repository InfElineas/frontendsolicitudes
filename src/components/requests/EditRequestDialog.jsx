import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const EditRequestDialog = ({
  open,
  onOpenChange,
  requestId,
  editData,
  setEditData,
  updateRequest
}) => {
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRequest(requestId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Editar Solicitud</DialogTitle>
          <DialogDescription>
            Modifica los campos de la solicitud y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={editData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              name="type"
              value={editData.type}
              onChange={handleChange}
            />
          </div>

          {/* Canal */}
          <div>
            <Label htmlFor="channel">Canal</Label>
            <Input
              id="channel"
              name="channel"
              value={editData.channel}
              onChange={handleChange}
            />
          </div>

          {/* Departamento */}
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              name="department"
              value={editData.department}
              onChange={handleChange}
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestDialog;
