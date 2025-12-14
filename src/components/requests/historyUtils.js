export const deriveHistory = (data) => {
  const baseHistory = Array.isArray(data?.history) ? data.history : [];
  const knownTimestampKeys = [
    { key: 'created_at', label: 'Creado' },
    { key: 'requested_at', label: 'Solicitado' },
    { key: 'assigned_at', label: 'Asignado' },
    { key: 'in_progress_at', label: 'En progreso' },
    { key: 'in_review_at', label: 'En revisión' },
    { key: 'finished_at', label: 'Finalizada' },
    { key: 'rejected_at', label: 'Rechazada' },
    { key: 'closed_at', label: 'Cerrada' },
    { key: 'updated_at', label: 'Actualizado' },
  ];

  const timeline = [...baseHistory];

  const statusMap = data && typeof data === 'object' && !Array.isArray(data)
    ? data.status_history || data.status_timestamps || data.status_dates
    : null;

  if (statusMap && typeof statusMap === 'object') {
    Object.entries(statusMap).forEach(([status, at]) => {
      if (at) timeline.push({ at, from: null, to: status });
    });
  }

  knownTimestampKeys.forEach(({ key, label }) => {
    const value = data?.[key];
    if (value) timeline.push({ at: value, from: null, to: label });
  });

  return timeline
    .filter((entry) => entry && (entry.at || entry.to))
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
};
