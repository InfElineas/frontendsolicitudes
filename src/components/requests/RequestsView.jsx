import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import CreateRequestDialog from './CreateRequestDialog';
import EditRequestDialog from './EditRequestDialog';
import RequestFilters from './RequestFilters';
import RequestCard from './RequestCard';

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
  finishRequest
}) => {

const [editDialogFor, setEditDialogFor] = useState(null);
const [editData, setEditData] = useState({
  title: '',
  description: '',
  type: '',
  channel: '',
  department: ''
});

const updateRequest = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación.');

    console.log("➡️ Enviando actualización", { id, editData });

    const response = await fetch(`https://backendsolicitudes.onrender.com/api/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const updatedRequest = await response.json();
    console.log("⬅️ Respuesta del servidor", updatedRequest);

    setEditDialogFor(null);
    window.location.reload();
  } catch (error) {
    console.error('❌ Error al actualizar la solicitud:', error.message);
    alert(`No se pudo actualizar la solicitud: ${error.message}`);
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
      {user?.role === 'admin' && (
  <EditRequestDialog
    open={!!editDialogFor}
    onOpenChange={setEditDialogFor}
    requestId={editDialogFor}
    editData={editData}
    setEditData={setEditData}
    updateRequest={updateRequest}
  />
)}

    </div>
  );
};

export default RequestsView;
