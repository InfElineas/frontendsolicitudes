import React, { useState } from 'react';
import { Plus } from 'lucide-react';
// ❌ import axios from 'axios';  // ya no: usamos cliente central
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import CreateRequestDialog from './CreateRequestDialog';
import RequestDetailDialog from './RequestDetailDialog';
import EditRequestDialog from './EditRequestDialog';
import RequestFilters from './RequestFilters';
import RequestCard from './RequestCard';

// ✅ Cliente axios centralizado (mismo que App.js)
import api from '@/api/client';

const RequestsView = ({
  user,
  users,
  requests,
  filters,
  setFilters,
  departments,
  setRequestDialog,
  requestDialog,
  newRequest,
  setNewRequest,
  createRequest,
  deleteRequest,
  setPage,
  page,
  pageInfo,
  total,
  pageSize,
  setPageSize,
  totalPages,
  classifyDialogFor,
  setClassifyDialogFor,
  setClassifyData,
  assignDialogFor,
  setAssignDialogFor,
  setAssignData,
  feedbackDialogFor,
  setFeedbackDialogFor,
  setFeedbackData,
  takeRequest,
  rejectRequest,
  sendToReview,
  backToProgress,
  finishRequest,
}) => {
  const [viewDialogFor, setViewDialogFor] = useState(null);

  const [editDialogFor, setEditDialogFor] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    type: '',
    channel: '',
    department: '',
    level: '',
    estimated_hours: '',
    estimated_due: '',
    priority: '',
    assigned_to: ''
  });
  const [saving, setSaving] = useState(false);

  // Abre modal de edición con datos precargados
  const openEdit = (id, data) => {
    setEditDialogFor(id);
    setEditData({
      title: data?.title || '',
      description: data?.description || '',
      type: data?.type || '',
      channel: data?.channel || '',
      department: data?.department || '',
      level: data?.level ?? '',
      estimated_hours: data?.estimated_hours ?? '',
      estimated_due: data?.estimated_due || '',
      priority: data?.priority || '',
      assigned_to: data?.assigned_to || ''
    });
  };

  // ✅ updateRequest ahora recibe payload ya saneado desde EditRequestDialog
  const updateRequest = async (id, payloadFromDialog) => {
    try {
      setSaving(true);

      // Fallback: si no nos pasan payload (compat), usamos editData pero lo saneamos aquí
      const src = payloadFromDialog || editData;

      const payload = {};
      if (src.title != null) payload.title = String(src.title).trim();
      if (src.description != null) payload.description = String(src.description).trim();
      if (src.type) payload.type = src.type;
      if (src.channel) payload.channel = src.channel;
      if (src.department) payload.department = src.department;
      if (src.priority) payload.priority = src.priority;

      if (src.level !== '' && src.level != null) payload.level = Number(src.level);
      if (src.assigned_to) payload.assigned_to = src.assigned_to;
      if (src.estimated_hours !== '' && src.estimated_hours != null) {
        payload.estimated_hours = Number(src.estimated_hours);
      }
      if ((src.estimated_due || '').trim()) payload.estimated_due = src.estimated_due;

      await api.put(`/requests/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setEditDialogFor(null);

      // Si el fetch de la lista se hace en App, podemos forzar un refresco simple:
      window.location.reload();
    } catch (error) {
      const msg = error?.response?.data?.detail || error.message;
      console.error('❌ Error al actualizar la solicitud:', msg);
      alert(`No se pudo actualizar la solicitud: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y botón */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Automatización</h2>
        <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Nueva Solicitud</span>
            </Button>
          </DialogTrigger>
          <CreateRequestDialog
            user={user}
            users={users}
            newRequest={newRequest}
            setNewRequest={setNewRequest}
            createRequest={createRequest}
          />
        </Dialog>
      </div>

      {/* Filtros */}
      <RequestFilters
        filters={filters}
        setFilters={setFilters}
        departments={departments}
        setPage={setPage}
      />

      {/* Lista de solicitudes */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg border">
            No hay solicitudes que coincidan con el filtro.
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              user={user}
              deleteRequest={deleteRequest}
              setClassifyDialogFor={setClassifyDialogFor}
              setClassifyData={setClassifyData}
              setAssignDialogFor={setAssignDialogFor}
              setAssignData={setAssignData}
              setFeedbackDialogFor={setFeedbackDialogFor}
              takeRequest={takeRequest}
              rejectRequest={rejectRequest}
              sendToReview={sendToReview}
              backToProgress={backToProgress}
              finishRequest={finishRequest}
              setEditDialogFor={setEditDialogFor}
              editDialogFor={editDialogFor}
              editData={editData}
              setEditData={setEditData}
              onView={(id) => setViewDialogFor(id)}
              onEdit={(id, data) => openEdit(id, data)}
            />
          ))
        )}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{pageInfo.from}</span>–<span className="font-medium">{pageInfo.to}</span> de <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm mr-2">Por página</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 30].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Página <span className="font-medium">{page}</span> / {totalPages}
            </span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Detalle de solicitud */}
      <RequestDetailDialog
        open={!!viewDialogFor}
        onOpenChange={(open) => setViewDialogFor(open ? viewDialogFor : null)}
        requestId={viewDialogFor}
      />

      {/* Editar solicitud */}
      <EditRequestDialog
        open={!!editDialogFor}
        onOpenChange={(open) => { if (!open) setEditDialogFor(null); }}
        requestId={editDialogFor}
        editData={editData}
        setEditData={setEditData}
        updateRequest={updateRequest}
        saving={saving}
        // ✅ Enums alineados con creación/app
        typeOptions={['Soporte', 'Mejora', 'Desarrollo', 'Capacitación']}
        channelOptions={['Sistema', 'Google Sheets', 'Correo Electrónico', 'WhatsApp']}
        // ✅ departments ya es array de strings en App
        departmentOptions={departments || []}
      />
    </div>
  );
};

export default RequestsView;
