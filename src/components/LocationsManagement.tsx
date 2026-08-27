/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Location, Training } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  MapPin, 
  Laptop, 
  Users, 
  Calendar, 
  LayoutGrid, 
  List, 
  Search,
  BookOpen
} from 'lucide-react';

interface LocationsManagementProps {
  locations: Location[];
  trainings: Training[];
  onAddLocationClick: () => void;
  onEditLocationClick: (location: Location) => void;
  onDeleteLocation: (id: string) => void;
}

export default function LocationsManagement({
  locations,
  trainings,
  onAddLocationClick,
  onEditLocationClick,
  onDeleteLocation,
}: LocationsManagementProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  // Calculate training sessions per location
  const getTrainingCount = (locId: string) => {
    return trainings.filter((t) => t.locationId === locId).length;
  };

  // Filter locations by search
  const deferredSearch = React.useDeferredValue(search);
  const filteredLocations = useMemo(() => {
    if (!deferredSearch.trim()) return locations;
    const q = deferredSearch.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.details || '').toLowerCase().includes(q) ||
        loc.type.toLowerCase().includes(q)
    );
  }, [locations, deferredSearch]);

  const externalCount = useMemo(() => {
    return locations.filter((l) => l.type === 'externo').length;
  }, [locations]);

  // Render localized badge for location types
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'sala':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-2xs font-bold text-blue-700 uppercase tracking-wide">
            <Building2 className="h-3 w-3" />
            Sala / Interno
          </span>
        );
      case 'externo':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-2xs font-bold text-rose-700 uppercase tracking-wide">
            <MapPin className="h-3 w-3" />
            Externo / Cliente
          </span>
        );
      case 'interno':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-2xs font-bold text-indigo-700 uppercase tracking-wide">
            <Laptop className="h-3 w-3" />
            Online / Outros
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-none p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* View Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MapPin className="h-7 w-7 text-blue-600" />
            Cadastro de Locais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie as salas físicas, auditórios, escritórios de clientes e ambientes virtuais de treinamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              id="view-grid-loc-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Blocos</span>
            </button>
            <button
              id="view-list-loc-btn"
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
          </div>

          <button
            id="mgmt-add-location-btn"
            onClick={onAddLocationClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Novo Local
          </button>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Total de Locais</span>
            <span className="text-2xl font-black text-slate-800">{locations.length}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Locais Externos</span>
            <span className="text-2xl font-black text-slate-800">{externalCount}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider block">Sessões Agendadas</span>
            <span className="text-2xl font-black text-slate-800">{trainings.length}</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar local por nome, tipo, endereço ou capacidade..."
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Content Rendering based on viewMode */}
      {filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Nenhum local localizado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {search ? 'Tente ajustar os termos da busca.' : 'Adicione locais ao sistema para poder vinculá-los aos eventos do calendário.'}
          </p>
          {!search && (
            <button
              id="empty-add-location-btn"
              onClick={onAddLocationClick}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-100"
            >
              Adicionar Primeiro Local
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID / BLOCO VIEW */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredLocations.map((loc) => {
            const count = getTrainingCount(loc.id);
            return (
              <div
                key={loc.id}
                id={`location-card-${loc.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="p-4 flex-1">
                  {/* Category Type Badge & Capacity */}
                  <div className="mb-3 flex justify-between items-start gap-2">
                    {renderTypeBadge(loc.type)}
                    
                    {loc.capacity && (
                      <span className="inline-flex items-center gap-1 text-3xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        <Users className="h-3 w-3 text-slate-400" />
                        Cap: {loc.capacity}
                      </span>
                    )}
                  </div>

                  {/* Title & info */}
                  <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 truncate" title={loc.name}>
                    {loc.name}
                  </h3>

                  {/* Address or Link text area */}
                  {loc.details ? (
                    <p className="text-2xs text-slate-500 leading-relaxed line-clamp-2 min-h-[30px] mb-3" title={loc.details}>
                      {loc.details}
                    </p>
                  ) : (
                    <p className="text-2xs text-slate-300 italic leading-relaxed min-h-[30px] mb-3">
                      Nenhum detalhe adicional cadastrado.
                    </p>
                  )}

                  {/* Session counter */}
                  <div className="border-t border-slate-100 pt-2.5 flex items-center gap-2 text-2xs text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-slate-700">
                      {count === 0 
                        ? 'Sem sessões agendadas' 
                        : `${count} ${count === 1 ? 'treinamento' : 'treinamentos'}`
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 flex items-center justify-end gap-2">
                  <button
                    id={`edit-loc-${loc.id}`}
                    onClick={() => onEditLocationClick(loc)}
                    className="flex items-center gap-1.5 text-2xs font-bold text-slate-600 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-white cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    id={`delete-loc-${loc.id}`}
                    onClick={() => onDeleteLocation(loc.id)}
                    className="flex items-center gap-1.5 text-2xs font-bold text-rose-600 hover:text-rose-800 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABELA VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Nome do Local</th>
                  <th className="px-5 py-3.5">Endereço / Detalhes</th>
                  <th className="px-5 py-3.5">Capacidade</th>
                  <th className="px-5 py-3.5">Treinamentos</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLocations.map((loc) => {
                  const count = getTrainingCount(loc.id);
                  return (
                    <tr 
                      key={loc.id}
                      id={`location-row-${loc.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderTypeBadge(loc.type)}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                        {loc.name}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-600 max-w-md truncate">
                        {loc.details || <span className="text-slate-300 italic">Sem detalhes</span>}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {loc.capacity ? `${loc.capacity} pessoas` : <span className="text-slate-300 italic">-</span>}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-2xs font-bold text-blue-700">
                          {count}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`edit-loc-list-${loc.id}`}
                            onClick={() => onEditLocationClick(loc)}
                            title="Editar local"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-loc-list-${loc.id}`}
                            onClick={() => onDeleteLocation(loc.id)}
                            title="Excluir local"
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
        </div>
      )}
    </div>
  );
}
