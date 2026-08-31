/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Training, Instructor, Location, TrainingStatus } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Check, 
  RotateCcw,
  BookOpen,
  Building2,
  ListFilter
} from 'lucide-react';
import { formatTimeString } from '../utils/dateUtils';

interface TrainingsManagementProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onAddTrainingClick: () => void;
  onEditTrainingClick: (training: Training) => void;
  onDuplicateTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
  onBulkDeleteTrainings?: (ids: string[]) => void;
  onBulkUpdateStatusTrainings?: (ids: string[], status: TrainingStatus) => void;
}

export default function TrainingsManagement({
  trainings,
  instructors,
  locations,
  onAddTrainingClick,
  onEditTrainingClick,
  onDuplicateTraining,
  onDeleteTraining,
  onBulkDeleteTrainings,
  onBulkUpdateStatusTrainings,
}: TrainingsManagementProps) {
  const [search, setSearch] = useState('');
  const [instFilter, setInstFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fast maps
  const instructorsMap = useMemo(() => new Map(instructors.map((i) => [i.id, i])), [instructors]);
  const locationsMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);

  // Handle filtering
  const deferredSearch = React.useDeferredValue(search);
  const filteredTrainings = useMemo(() => {
    const list = trainings.filter((t) => {
      const matchesSearch = 
        t.title.toLowerCase().includes(deferredSearch.toLowerCase()) || 
        (t.description || '').toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesInstructor = !instFilter || t.instructorId === instFilter;
      const matchesLocation = !locFilter || t.locationId === locFilter;
      const matchesStatus = !statusFilter || t.status === statusFilter;
      
      return matchesSearch && matchesInstructor && matchesLocation && matchesStatus;
    });

    list.sort((a, b) => {
      const diff = a.startDate.localeCompare(b.startDate);
      return sortBy === 'date-asc' ? diff : -diff;
    });

    return list;
  }, [trainings, deferredSearch, instFilter, locFilter, statusFilter, sortBy]);

  // Calculate quick stats
  const stats = useMemo(() => {
    const total = filteredTrainings.length;
    const confirmed = filteredTrainings.filter((t) => t.status === 'confirmado').length;
    const pending = filteredTrainings.filter((t) => t.status === 'aguardando').length;
    const canceled = filteredTrainings.filter((t) => t.status === 'cancelado').length;
    return { total, confirmed, pending, canceled };
  }, [filteredTrainings]);

  // Checkbox helpers
  const allFilteredSelected = filteredTrainings.length > 0 && filteredTrainings.every((t) => selectedIds.has(t.id));
  const isIndeterminate = selectedIds.size > 0 && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(filteredTrainings.map((t) => t.id));
      setSelectedIds(newSet);
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedIds.size === 0 || !onBulkDeleteTrainings) return;
    onBulkDeleteTrainings(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: TrainingStatus) => {
    if (selectedIds.size === 0 || !onBulkUpdateStatusTrainings) return;
    onBulkUpdateStatusTrainings(Array.from(selectedIds), status);
  };

  // Export CSV (Selected or Filtered)
  const handleExportCSV = (exportSelectedOnly = false) => {
    const targetList = exportSelectedOnly
      ? filteredTrainings.filter((t) => selectedIds.has(t.id))
      : filteredTrainings;

    if (targetList.length === 0) return;

    const headers = ['Titulo', 'Instrutor', 'Especialidade', 'Local', 'Tipo Local', 'Data Inicio', 'Hora Inicio', 'Hora Termino', 'Participantes', 'Status', 'Descricao'];
    
    const rows = targetList.map((t) => {
      const inst = instructorsMap.get(t.instructorId);
      const loc = locationsMap.get(t.locationId);
      const datePart = t.startDate.split('T')[0];
      const startT = formatTimeString(t.startDate);
      const endT = formatTimeString(t.endDate);

      return [
        t.title,
        inst?.name || 'Não atribuído',
        inst?.specialty || '',
        loc?.name || 'Não atribuído',
        loc?.type || '',
        datePart,
        startT,
        endT,
        t.status,
        (t.description || '').replace(/"/g, '""')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `treinamentos_proeng_${exportSelectedOnly ? 'selecionados_' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date Display Helper
  const formatDateDisplay = (isoStr: string) => {
    const [datePart] = isoStr.split('T');
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  };

  // Calculate duration in hours
  const calculateDuration = (startDateStr: string, endDateStr: string) => {
    try {
      const s = new Date(startDateStr);
      const e = new Date(endDateStr);
      const diffHours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0) {
        return diffHours % 1 === 0 ? `${diffHours}h` : `${diffHours.toFixed(1)}h`;
      }
    } catch (err) {
      // ignore
    }
    return null;
  };

  // Status badge component
  const renderStatusBadge = (status: TrainingStatus) => {
    switch (status) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Confirmado
          </span>
        );
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Aguardando
          </span>
        );
      case 'cancelado':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-none">
      <div className="p-4 sm:p-6 pb-2 space-y-6 flex-shrink-0">
      {/* View Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-blue-600" />
            Painel Geral de Treinamentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie todas as agendas corporativas, realize filtros avançados, ações em massa e exportações.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="mgmt-export-csv-btn"
            onClick={() => handleExportCSV(false)}
            disabled={filteredTrainings.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Exportar Excel/CSV
          </button>
          
          <button
            id="mgmt-add-training-btn"
            onClick={onAddTrainingClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo Treinamento
          </button>
        </div>
      </div>

      {/* KPI Cards Row for Screen Space Optimization */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total Visível</span>
            <div className="text-xl font-black text-slate-800">{stats.total}</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <ListFilter className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-600">Confirmados</span>
            <div className="text-xl font-black text-emerald-700">{stats.confirmed}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-600">Aguardando</span>
            <div className="text-xl font-black text-amber-700">{stats.pending}</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Cancelados</span>
            <div className="text-xl font-black text-slate-700">{stats.canceled}</div>
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            Filtros e Pesquisa
          </div>
          {(search || instFilter || locFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setInstFilter('');
                setLocFilter('');
                setStatusFilter('');
              }}
              className="flex items-center gap-1 text-2xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Limpar Filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          {/* Search text */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              id="mgmt-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Título ou descrição..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Instructor Filter */}
          <select
            id="mgmt-filter-inst"
            value={instFilter}
            onChange={(e) => setInstFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Todos os Instrutores ({instructors.length})</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            id="mgmt-filter-loc"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Todos os Locais ({locations.length})</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="mgmt-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Todos os Status</option>
            <option value="confirmado">Confirmado</option>
            <option value="aguardando">Aguardando Confirmação</option>
            <option value="cancelado">Cancelado</option>
          </select>

          {/* Sorting direction */}
          <select
            id="mgmt-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white font-medium"
          >
            <option value="date-asc">Data: Mais Antigo primeiro</option>
            <option value="date-desc">Data: Mais Recente primeiro</option>
          </select>
        </div>
      </div>

      </div>
      
      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-hidden flex flex-col gap-4">
      {/* 🚀 FLOATING / STICKY BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="flex-shrink-0 z-30 rounded-xl border border-blue-200 bg-blue-900/95 text-white p-3.5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold tracking-wide">
              {selectedIds.size === 1 ? '1 treinamento selecionado' : `${selectedIds.size} treinamentos selecionados`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status change actions */}
            <div className="flex items-center bg-blue-950/80 p-1 rounded-lg border border-blue-800">
              <span className="text-3xs font-extrabold uppercase text-slate-400 px-2 hidden md:inline">
                Alterar Status:
              </span>
              <button
                onClick={() => handleBulkStatusChange('confirmado')}
                className="px-2.5 py-1 text-2xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer"
              >
                Confirmado
              </button>
              <button
                onClick={() => handleBulkStatusChange('aguardando')}
                className="ml-1 px-2.5 py-1 text-2xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors cursor-pointer"
              >
                Aguardando
              </button>
              <button
                onClick={() => handleBulkStatusChange('cancelado')}
                className="ml-1 px-2.5 py-1 text-2xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors cursor-pointer"
              >
                Cancelado
              </button>
            </div>

            {/* Export selected */}
            <button
              onClick={() => handleExportCSV(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer border border-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar Selecionados</span>
            </button>

            {/* Bulk Delete */}
            {onBulkDeleteTrainings && (
              <button
                id="bulk-delete-btn"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir Selecionados
              </button>
            )}

            {/* Deselect All */}
            <button
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition-colors cursor-pointer"
            >
              Desmarcar
            </button>
          </div>
        </div>
      )}

      {/* Trainings Full Width Table */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0">
        {filteredTrainings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Nenhum treinamento localizado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Tente alterar os filtros de busca ou adicione um novo treinamento corporativo agora mesmo.
            </p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
            <table className="w-full table-auto border-collapse text-left text-sm">
              <thead className="sticky top-0 z-20">
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 text-xs font-extrabold uppercase tracking-wider select-none">
                  {/* Select All Checkbox */}
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                      title={allFilteredSelected ? 'Desmarcar todos' : 'Selecionar todos os visíveis'}
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-400" />
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-3.5">Treinamento & Observações</th>
                  <th className="px-5 py-3.5">Cronograma & Duração</th>
                  <th className="px-5 py-3.5">Instrutor</th>
                  <th className="px-5 py-3.5">Local / Ambiente</th>
                  <th className="px-5 py-3.5">Participantes</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrainings.map((t) => {
                  const inst = instructorsMap.get(t.instructorId);
                  const loc = locationsMap.get(t.locationId);
                  const startT = formatTimeString(t.startDate);
                  const endT = formatTimeString(t.endDate);
                  const duration = calculateDuration(t.startDate, t.endDate);
                  const isSelected = selectedIds.has(t.id);

                  return (
                    <tr 
                      key={t.id} 
                      id={`mgmt-row-${t.id}`}
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/70 hover:bg-blue-50' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox cell */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectRow(t.id, e)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-extrabold text-slate-900 text-sm leading-snug" title={t.title}>
                          {t.title}
                        </div>
                        {t.description ? (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={t.description}>
                            {t.description}
                          </div>
                        ) : (
                          <div className="text-2xs text-slate-300 italic mt-0.5">Sem observações cadastradas</div>
                        )}
                      </td>

                      {/* Date, Time & Duration */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                          {formatDateDisplay(t.startDate)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{startT}h às {endT}h</span>
                          {duration && (
                            <span className="ml-1 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                              {duration}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-5 py-4 max-w-[200px]">
                        {inst ? (
                          <div className="flex items-start gap-2">
                            <span 
                              style={{ backgroundColor: inst.color }}
                              className="h-3 w-3 rounded-full flex-shrink-0 mt-0.5 shadow-xs"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-xs truncate" title={inst.name}>{inst.name}</div>
                              <div className="text-2xs text-slate-500 truncate" title={inst.specialty}>{inst.specialty}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 max-w-[220px]">
                        {loc ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                              <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate" title={loc.name}>{loc.name}</span>
                            </div>
                            {loc.details && (
                              <div className="text-2xs text-slate-500 truncate pl-5" title={loc.details}>
                                {loc.details}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>

                      {/* Participantes */}
                      <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-700">
                        {t.attendeeCount ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {t.attendeeCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(t.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`dupl-train-${t.id}`}
                            onClick={() => onDuplicateTraining(t)}
                            title="Duplicar treinamento"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            id={`edit-train-${t.id}`}
                            onClick={() => onEditTrainingClick(t)}
                            title="Editar treinamento"
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            id={`delete-train-${t.id}`}
                            onClick={() => onDeleteTraining(t.id)}
                            title="Excluir treinamento"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
