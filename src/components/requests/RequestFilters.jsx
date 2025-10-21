import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Props:
 * - filters: {
 *     q, status, department, type, level, channel, sort,
 *     created_by,  // 'all' o id (string/number)
 *     assigned_by, // 'all' o id (string/number)
 *   }
 * - setFilters: (f) => void
 * - departments: string[]
 * - setPage: (n) => void
 * - users: Array<{ id: number|string, full_name: string, role?: string, department?: string }>
 */
const RequestFilters = ({ filters, setFilters, departments, setPage, users = [] }) => {
  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1); // reset paginación al cambiar filtros
  };

  // Opciones para "Creado por": todos los usuarios
  const creatorOptions = users;

  // Opciones para "Asignado por": quienes asignan (support/admin). Si no viene role, mostramos todos.
  const assignerOptions = Array.isArray(users)
    ? users.filter(u => !u.role || u.role === 'support' || u.role === 'admin')
    : [];

  const userLabel = (u) => u?.full_name || u?.username || `Usuario ${u?.id}`;

  return (
    <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-8 gap-4">
      {/* Buscar */}
      <div className="md:col-span-2">
        <Label className="text-sm">Buscar</Label>
        <Input
          placeholder="Título o descripción..."
          value={filters.q}
          onChange={(e) => handleChange('q', e.target.value)}
        />
      </div>

      {/* Estado */}
      <div>
        <Label className="text-sm">Estado</Label>
        <Select value={filters.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En progreso">En progreso</SelectItem>
            <SelectItem value="En revisión">En revisión</SelectItem>
            <SelectItem value="Finalizada">Finalizada</SelectItem>
            <SelectItem value="Rechazada">Rechazada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Departamento */}
      <div>
        <Label className="text-sm">Departamento</Label>
        <Select value={filters.department} onValueChange={(value) => handleChange('department', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo */}
      <div>
        <Label className="text-sm">Tipo</Label>
        <Select value={filters.type} onValueChange={(value) => handleChange('type', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Soporte">Soporte</SelectItem>
            <SelectItem value="Mejora">Mejora</SelectItem>
            <SelectItem value="Desarrollo">Desarrollo</SelectItem>
            <SelectItem value="Capacitación">Capacitación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nivel */}
      <div>
        <Label className="text-sm">Nivel</Label>
        <Select value={filters.level} onValueChange={(value) => handleChange('level', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Canal */}
      <div>
        <Label className="text-sm">Canal</Label>
        <Select value={filters.channel} onValueChange={(value) => handleChange('channel', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Sistema">Sistema</SelectItem>
            <SelectItem value="Google Sheets">Google Sheets</SelectItem>
            <SelectItem value="Correo Electrónico">Correo Electrónico</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Creado por */}
      <div>
        <Label className="text-sm">Creado por</Label>
        <Select
          value={filters.created_by}
          onValueChange={(value) => handleChange('created_by', value)}
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {creatorOptions.map(u => (
              <SelectItem key={u.id} value={String(u.id)}>{userLabel(u)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asignado por */}
      <div>
        <Label className="text-sm">Asignado por</Label>
        <Select
          value={filters.assigned_by}
          onValueChange={(value) => handleChange('assigned_by', value)}
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {assignerOptions.map(u => (
              <SelectItem key={u.id} value={String(u.id)}>{userLabel(u)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orden */}
      <div className="md:col-span-2">
        <Label className="text-sm">Orden</Label>
        <Select value={filters.sort} onValueChange={(value) => handleChange('sort', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Creación: más recientes</SelectItem>
            <SelectItem value="created_at">Creación: más antiguas</SelectItem>
            <SelectItem value="-requested_at">Solicitada: más recientes</SelectItem>
            <SelectItem value="requested_at">Solicitada: más antiguas</SelectItem>
            <SelectItem value="status">Estado (A→Z)</SelectItem>
            <SelectItem value="-status">Estado (Z→A)</SelectItem>
            <SelectItem value="department">Depto (A→Z)</SelectItem>
            <SelectItem value="-department">Depto (Z→A)</SelectItem>
            <SelectItem value="priority">Prioridad (A→Z)</SelectItem>
            <SelectItem value="-priority">Prioridad (Z→A)</SelectItem>
            <SelectItem value="level">Nivel (1→3)</SelectItem>
            <SelectItem value="-level">Nivel (3→1)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RequestFilters;
