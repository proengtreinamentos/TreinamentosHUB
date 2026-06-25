/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Location, Training } from '../types';
import { Plus, Edit3, Trash2, Building2, MapPin, Laptop, Users, Calendar, ShieldAlert } from 'lucide-react';

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

  // Calculate training sessions per location
  const getTrainingCount = (locId: string) => {
    return trainings.filter((t) => t.locationId === locId).length;
  };

  // Render localized badge for location types
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'sala':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-2xs font-bold text-blue-700 uppercase tracking-wide">
            <Building2 className="h-3 w-3" />
            Sala / Interno
          </span>
        );
      case 'externo':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-1 text-2xs font-bold text-rose-700 uppercase tracking-wide">
            <MapPin className="h-3 w-3" />
            Externo / Cliente
          </span>
        );
      case 'interno':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-2xs font-bold text-indigo-700 uppercase tracking-wide">
            <Laptop className="h-3 w-3" />
            Online / Outros
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
            Cadastro de Locais
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie as salas físicas, escritórios de clientes e ambientes virtuais de treinamento.
          </p>
        </div>
        <button
          id="mgmt-add-location-btn"
          onClick={onAddLocationClick}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
          Novo Local
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total de Locais</span>
            <span className="text-xl font-black text-slate-800">{locations.length}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Locais Externos</span>
            <span className="text-xl font-black text-slate-800">
              {locations.filter((l) => l.type === 'externo').length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Nenhum local cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Adicione locais de treinamento ao sistema para poder vinculá-los aos eventos do calendário.
          </p>
          <button
            id="empty-add-location-btn"
            onClick={onAddLocationClick}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
          >
            Adicionar Primeiro Local
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => {
            const count = getTrainingCount(loc.id);
            return (
              <div
                key={loc.id}
                id={`location-card-${loc.id}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="p-5 flex-1">
                  {/* Category Type Badge */}
                  <div className="mb-3.5 flex justify-between items-start gap-2">
                    {renderTypeBadge(loc.type)}
                    
                    {/* Capacity indicators */}
                    {loc.capacity && (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Users className="h-3 w-3 text-slate-400" />
                        Capacidade: {loc.capacity}
                      </span>
                    )}
                  </div>

                  {/* Title & info */}
                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5 truncate">
                    {loc.name}
                  </h3>

                  {/* Address or Link text area */}
                  {loc.details ? (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[32px] mb-4">
                      {loc.details}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic leading-relaxed min-h-[32px] mb-4">
                      Nenhum detalhe adicional de endereço ou link virtual cadastrado.
                    </p>
                  )}

                  {/* Session counter */}
                  <div className="border-t border-slate-100 pt-3.5 flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">
                      {count === 0 
                        ? 'Sem sessões agendadas' 
                        : `${count} ${count === 1 ? 'treinamento neste local' : 'treinamentos neste local'}`
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-end gap-2.5">
                  <button
                    id={`edit-loc-${loc.id}`}
                    onClick={() => onEditLocationClick(loc)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    id={`delete-loc-${loc.id}`}
                    onClick={() => {
                      if (confirm(`Tem certeza de que deseja excluir o local "${loc.name}"? Os treinamentos associados a ele continuarão agendados, mas perderão a referência de local.`)) {
                        onDeleteLocation(loc.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
