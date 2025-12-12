import { useMemo } from 'react';

// Normaliza llaves de estado que llegan desde el backend para agruparlas en las
// columnas del dashboard. Se soportan mayúsculas/minúsculas y variantes en
// español/inglés para no depender de un único formato.
const STATUS_KEYS = {
  pendiente: 'pending',
  pending: 'pending',
  'in progress': 'inProgress',
  'en progreso': 'inProgress',
  progreso: 'inProgress',
  progress: 'inProgress',
  revision: 'inReview',
  review: 'inReview',
  'en revisión': 'inReview',
  'en revision': 'inReview',
  revisado: 'inReview',
  finalizada: 'finished',
  finalizadas: 'finished',
  finalizado: 'finished',
  finished: 'finished',
  done: 'finished',
  completada: 'finished',
};

const coalesce = (...values) => values.find((v) => Number.isFinite(Number(v))) ?? 0;

const normalizeStatusKey = (key) => {
  if (!key) return null;
  const normalized = String(key).trim().toLowerCase();
  if (STATUS_KEYS[normalized]) return STATUS_KEYS[normalized];
  return null;
};

const extractStatusBreakdown = (row) => {
  const sources = [
    row?.status_breakdown,
    row?.statuses,
    row?.status_counts,
    row?.status_count_by_state,
  ].find((m) => m && typeof m === 'object');
  if (!sources) return {};

  return Object.entries(sources).reduce((acc, [key, raw]) => {
    const mapped = normalizeStatusKey(key);
    if (!mapped) return acc;
    const asNumber = Number(raw) || 0;
    acc[mapped] = (acc[mapped] || 0) + asNumber;
    return acc;
  }, {});
};

export const normalizeProductivityRows = (rows = []) => {
  return rows.map((row) => {
    const statusCounts = extractStatusBreakdown(row);

    const pending = coalesce(statusCounts.pending, row?.pending_now, row?.pending);
    const inProgress = coalesce(statusCounts.inProgress, row?.in_progress, row?.progress);
    const inReview = coalesce(statusCounts.inReview, row?.in_review, row?.review);
    const finished = coalesce(statusCounts.finished, row?.attended_period, row?.finished, row?.finalizadas);

    const assigned = coalesce(
      row?.assigned_total,
      row?.assigned,
      row?.total_assigned,
      row?.total,
      row?.count,
      pending + inProgress + inReview + finished,
    );

    return {
      user_id: row?.user_id ?? row?.id ?? row?.user ?? row?.username ?? row?.name ?? 'unknown',
      name: row?.name || row?.full_name || row?.username || 'Sin nombre',
      department: row?.department || row?.department_name || row?.dept || row?.area || 'Sin departamento',
      assigned,
      inProgress,
      inReview,
      finished,
      pending,
    };
  });
};

export const filterProductivityRows = (rows, filters = {}) => {
  const tech = filters.technician || 'all';
  const dept = filters.department || 'all';
  // Los filtros se aplican en cliente sobre el dataset de productividad por
  // técnico para que tabla, tarjetas y gráficos compartan la misma fuente de datos.
  return rows.filter((row) => {
    const matchesTech = tech === 'all' || String(row.user_id) === String(tech);
    const matchesDept =
      dept === 'all' || (row.department && String(row.department).toLowerCase() === String(dept).toLowerCase());
    return matchesTech && matchesDept;
  });
};

export const computeGlobalMetrics = (rows = []) => {
  const totals = rows.reduce(
    (acc, row) => {
      acc.assigned += Number(row.assigned) || 0;
      acc.inProgress += Number(row.inProgress) || 0;
      acc.inReview += Number(row.inReview) || 0;
      acc.finished += Number(row.finished) || 0;
      acc.pending += Number(row.pending) || 0;
      return acc;
    },
    { assigned: 0, inProgress: 0, inReview: 0, finished: 0, pending: 0 },
  );

  const technicianCount = rows.length;
  const averagePerTech = technicianCount ? totals.assigned / technicianCount : 0;
  const averageFinishedPerTech = technicianCount ? totals.finished / technicianCount : 0;
  const active = totals.inProgress + totals.inReview + totals.pending;

  return {
    ...totals,
    active,
    technicianCount,
    averagePerTech,
    averageFinishedPerTech,
  };
};

export const useProductivity = (analytics, filters) => {
  return useMemo(() => {
    const normalized = normalizeProductivityRows(analytics?.productivity_by_tech || []);
    const filtered = filterProductivityRows(normalized, filters);
    const global = computeGlobalMetrics(filtered);
    return { normalized, filtered, global };
  }, [analytics, filters]);
};

