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
//import api from '@/api/client';

const toISO = (v) => {
  if (!v || !String(v).trim()) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const normalize = (src) => {
  const out = {};
  const put = (k, v) => { if (v !== '' && v !== undefined && v !== null) out[k] = v; };

  put('title', src.title != null ? String(src.title).trim() : undefined);
  put('description', src.description != null ? String(src.description).trim() : undefined);
  put('type', src.type || undefined);
  put('channel', src.channel || undefined);
  put('department', src.department || undefined);
  put('priority', src.priority || undefined);

  if (src.level !== '' && src.level != null) put('level', Number(src.level));
  if (src.assigned_to !== '' && src.assigned_to != null) put('assigned_to', Number(src.assigned_to));
  if (src.estimated_hours !== '' && src.estimated_hours != null) put('estimated_hours', Number(src.estimated_hours));

  const iso = toISO(src.estimated_due);
  if (iso) put('estimated_due', iso);

  if (src.status) put('status', src.status); // opcional: si permites editar estado
  return out;
};

const updateRequest = async (id, payloadFromDialog) => {
  setSaving(true);
  try {
    // 1) preparar payload para el backend (PUT parcial)
    const upd = normalize(payloadFromDialog || editData);
    if (Object.keys(upd).length === 0) {
      setEditDialogFor(null);
      return;
    }

    // 2) PUT parcial (el backend lo soporta)
    await api.put(`/requests/${id}`, upd, {
      headers: { 'Content-Type': 'application/json' },
    });

    // 3) éxito: cerramos y refrescamos la lista (sin validación extra que da falsos negativos)
    setEditDialogFor(null);

    // Si tienes fetchRequests en el padre, úsalo; si no, reload
    // await fetchRequests(); // <— úsalo si lo tienes accesible aquí
    window.location.reload();
  } catch (error) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    console.error('❌ PUT /requests/:id error', { status, detail, error });
    alert(`No se pudo actualizar la solicitud.\n${Array.isArray(detail) ? JSON.stringify(detail) : (detail || error.message)}`);
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
