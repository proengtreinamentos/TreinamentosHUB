/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Training, Instructor, Location, TrainingStatus } from '../types';
import { Plus, Edit3, Trash2, Copy, Download, Search, SlidersHorizontal, Calendar, Clock, MapPin, User, FileSpreadsheet } from 'lucide-react';
import { formatTimeString } from '../utils/dateUtils';

interface TrainingsManagementProps {
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onAddTrainingClick: () => void;
  onEditTrainingClick: (training: Training) => void;
  onDuplicateTraining: (training: Training) => void;
  onDeleteTraining: (id: string) => void;
}

export default function TrainingsManagement({
  trainings,
  instructors,
  locations,
  onAddTrainingClick,
  onEditTrainingClick,
  onDuplicateTraining,
  onDeleteTraining,
}: TrainingsManagementProps) {
  const [search, setSearch] = useState('');
  const [instFilter, setInstFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

  const instructorsMap = new Map(instructors.map((i) => [i.id, i]));
  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  // Handle filtering
  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesInstructor = !instFilter || t.instructorId === instFilter;
    const matchesLocation = !locFilter || t.locationId === locFilter;
    const matchesStatus = !statusFilter || t.status === statusFilter;
    
    return matchesSearch && matchesInstructor && matchesLocation && matchesStatus;
  });

  // Handle sorting
  filteredTrainings.sort((a, b) => {
    const diff = a.startDate.localeCompare(b.startDate);
    return sortBy === 'date-asc' ? diff : -diff;
  });

  // Export filtered list to CSV file
  const handleExportCSV = () => {
    if (filteredTrainings.length === 0) return;

    // CSV headers
    const headers = ['Titulo', 'Instrutor', 'Especialidade', 'Local', 'Data Inicio', 'Hora Inicio', 'Hora Termino', 'Status', 'Descricao'];
    
    // Create rows
    const rows = filteredTrainings.map((t) => {
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
        datePart,
        startT,
        endT,
        t.status,
        (t.description || '').replace(/"/g, '""') // Escape quotes in description
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cronograma_treinamentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date display (e.g. 17/06/2026)
  const formatDateDisplay = (isoStr: string) => {
    const [datePart] = isoStr.split('T');
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  };

  // Render localized status badges
  const renderStatusBadge = (status: TrainingStatus) => {
    switch (status) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-3xs font-bold text-emerald-700 uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Confirmado
          </span>
        );
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-3xs font-bold text-amber-700 uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Aguardando
          </span>
        );
      case 'cancelado':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-3xs font-bold text-slate-600 uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Painel Geral de Treinamentos
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie todas as agendas em formato de tabela, filtre por vários critérios e exporte relatórios.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            id="mgmt-export-csv-btn"
            onClick={handleExportCSV}
            disabled={filteredTrainings.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Exportar Excel/CSV
          </button>
          
          <button
            id="mgmt-add-training-btn"
            onClick={onAddTrainingClick}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            Novo Treinamento
          </button>
        </div>
      </div>

      {/* Filter and Sorting Row */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-50">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          Filtros de Pesquisa Avançada
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          {/* Search text */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              id="mgmt-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Instructor Filter */}
          <select
            id="mgmt-filter-inst"
            value={instFilter}
            onChange={(e) => setInstFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Todos os Instrutores</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            id="mgmt-filter-loc"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Todos os Locais</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="mgmt-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
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
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="date-asc">Data: Mais Antigo primeiro</option>
            <option value="date-desc">Data: Mais Recente primeiro</option>
          </select>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-3.5">Treinamento</th>
                  <th className="px-6 py-3.5">Cronograma</th>
                  <th className="px-6 py-3.5">Instrutor</th>
                  <th className="px-6 py-3.5">Local</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrainings.map((t) => {
                  const inst = instructorsMap.get(t.instructorId);
                  const loc = locationsMap.get(t.locationId);
                  const startT = formatTimeString(t.startDate);
                  const endT = formatTimeString(t.endDate);

                  return (
                    <tr 
                      key={t.id} 
                      id={`mgmt-row-${t.id}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Title & Description */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={t.title}>
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-2xs text-slate-400 mt-0.5 truncate max-w-xs" title={t.description}>
                            {t.description}
                          </div>
                        )}
                      </td>

                      {/* Date and Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDateDisplay(t.startDate)}
                        </div>
                        <div className="flex items-center gap-1.5 text-2xs text-slate-400 mt-1 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          {startT}h às {endT}h
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-6 py-4 max-w-[160px] truncate">
                        {inst ? (
                          <div className="flex items-center gap-2">
                            <span 
                              style={{ backgroundColor: inst.color }}
                              className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm"
                            />
                            <div>
                              <div className="font-bold text-slate-800 text-xs truncate">{inst.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{inst.specialty}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 max-w-[160px] truncate">
                        {loc ? (
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-800 truncate">{loc.name}</div>
                              {loc.details && (
                                <div className="text-3xs text-slate-400 truncate">{loc.details}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Não atribuído</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(t.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Duplicate */}
                          <button
                            id={`dupl-train-${t.id}`}
                            onClick={() => onDuplicateTraining(t)}
                            title="Duplicar treinamento"
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            id={`edit-train-${t.id}`}
                            onClick={() => onEditTrainingClick(t)}
                            title="Editar treinamento"
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`delete-train-${t.id}`}
                            onClick={() => {
                              if (confirm(`Excluir permanentemente o treinamento "${t.title}" do cronograma?`)) {
                                onDeleteTraining(t.id);
                              }
                            }}
                            title="Excluir treinamento"
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
  );
}
