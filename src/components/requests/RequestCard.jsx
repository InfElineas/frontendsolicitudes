import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings2, UserPlus, ThumbsUp, ThumbsDown, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'En progreso': return 'bg-blue-100 text-blue-800';
    case 'En revisión': return 'bg-purple-100 text-purple-800';
    case 'Finalizada': return 'bg-green-100 text-green-800';
    case 'Rechazada': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Media': return 'bg-yellow-100 text-yellow-800';
    case 'Baja': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RequestCard = ({
  request,
  user,
  deleteRequest,
  setClassifyDialogFor,
  setClassifyData,
  setAssignDialogFor,
  setAssignData,
  setFeedbackDialogFor,
  takeRequest,
  rejectRequest,
  sendToReview,
  backToProgress,
  finishRequest,
  setEditDialogFor,
  editDialogFor,
  editData,
  setEditData
}) => {
  const canSendReview = () => {
    if (!user) return false;
    return user.id === request.assigned_to || user.id === request.assigned_by_id || user.role === 'admin';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
              <span>{request.requester_name}</span>
              <span>•</span>
              <span>{request.department}</span>
              <span>•</span>
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
              {request.level && <><span>•</span><span className="font-medium">Nivel:</span> {request.level}</>}
              <span>•</span>
              <span className="font-medium">Tipo:</span> {request.type}
              <span>•</span>
              <span className="font-medium">Canal:</span> {request.channel}
              {request.assigned_by_name && <><span>•</span><span className="font-medium">Asignado por:</span> {request.assigned_by_name}</>}
              {request.review_evidence?.url && (
                <>
                  <span>•</span>
                  <a href={request.review_evidence.url} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" /> Evidencia
                  </a>
                </>
              )}
              {request.status === 'Rechazada' && request.rejection_reason && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <AlertTriangle className="h-3 w-3" /> {request.rejection_reason}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 mb-4">{request.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-500 space-y-1">
            {request.assigned_to_name && <div><span className="font-medium">Asignado a:</span> {request.assigned_to_name}</div>}
            {request.estimated_hours && <div><span className="font-medium">Estimado:</span> {request.estimated_hours} h</div>}
            {request.estimated_due && <div><span className="font-medium">Compromiso:</span> {new Date(request.estimated_due).toLocaleDateString()}</div>}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Admin: Clasificar / Asignar */}
           {user?.role === 'admin' && request.status !== 'in_progress' && (
  <>
    {/* Botón Clasificar */}
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setClassifyDialogFor(request.id);
        setClassifyData({
          level: '1',
          priority: request.priority || 'Media'
        });
      }}
    >
      <Settings2 className="h-4 w-4 mr-2" />
      Clasificar
    </Button>

    {/* Botón Asignar */}
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        setAssignDialogFor(request.id);
        setAssignData({
          assigned_to: '',
          estimated_hours: '',
          estimated_due: ''
        });
      }}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Asignar
    </Button>
  </>
)}




            {(user?.role === 'support' || user?.role === 'admin') && request.status === 'Pendiente' && (
              <>
                <Button size="sm" onClick={() => takeRequest(request.id)}>Tomar</Button>
                <Button size="sm" variant="destructive" onClick={() => rejectRequest(request.id)}>Rechazar</Button>
              </>
            )}

            {(user?.role === 'support' || user?.role === 'admin') && request.status === 'En progreso' && (
              <Button size="sm" onClick={() =>
                canSendReview()
                  ? sendToReview(request.id)
                  : toast.error('No tienes permisos para enviar a revisión.')
              }>
                Enviar a revisión
              </Button>
            )}

            {(user?.role === 'support' || user?.role === 'admin') && request.status === 'En revisión' && (
              <>
                <Button size="sm" variant="outline" onClick={() => backToProgress(request.id)}>Devolver a progreso</Button>
                <Button size="sm" onClick={() => finishRequest(request.id)}>Finalizar</Button>
              </>
            )}

            {/* Feedback del solicitante */}
            {request.status === 'Finalizada' && !request.feedback && user?.id === request.requester_id && (
              <Button size="sm" variant="outline" onClick={() => setFeedbackDialogFor(request.id)}>
                Valorar
              </Button>
            )}
            {request.status === 'Finalizada' && request.feedback && (
              <div className="flex items-center text-sm text-gray-600">
                {request.feedback.rating === 'up' ? <ThumbsUp className="h-4 w-4 mr-1" /> : <ThumbsDown className="h-4 w-4 mr-1" />}
                <span>Feedback enviado</span>
              </div>
            )}

            {/* Eliminar (admin) */}
            {user?.role === 'admin' && (
              <Button size="sm" variant="destructive" onClick={() => deleteRequest(request.id)}>
                Eliminar
              </Button>
            )}
           {/*{user?.role === 'admin' && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                    setEditDialogFor(request.id);
                    setEditData({
                        title: request.title || '',
                        description: request.description || '',
                        type: request.type || '',
                        channel: request.channel || '',
                        department: request.department || ''
                    });
                    }}
                >
                    Editar
                </Button>
            )}*/}

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard;
