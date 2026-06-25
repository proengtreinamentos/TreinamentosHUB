/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MiniCalendar from './MiniCalendar';
import { Instructor, Location } from '../types';
import { Plus, Check, UserCheck, MapPin } from 'lucide-react';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddEventClick: () => void;
  instructors: Instructor[];
  locations: Location[];
  
  // Instructor Filters
  selectedInstructorIds: string[];
  onToggleInstructor: (id: string) => void;
  onClearInstructorFilters: () => void;

  // Location Filters
  selectedLocationIds: string[];
  onToggleLocation: (id: string) => void;
  onClearLocationFilters: () => void;
}

export default function Sidebar({
  selectedDate,
  onDateSelect,
  onAddEventClick,
  instructors,
  locations,
  selectedInstructorIds,
  onToggleInstructor,
  onClearInstructorFilters,
  selectedLocationIds,
  onToggleLocation,
  onClearLocationFilters,
}: SidebarProps) {
  return (
    <aside 
      id="calendar-sidebar"
      className="w-full flex-shrink-0 flex-col gap-6 lg:flex lg:w-72"
    >
      {/* Quick Action Button */}
      <button
        id="sidebar-add-event-btn"
        onClick={onAddEventClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
        Agendar Treinamento
      </button>

      {/* Mini Interactive Calendar */}
      <MiniCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

      {/* Filter Sections Container */}
      <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        
        {/* Filter by Instructor */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
              Instrutores
            </h5>
            {selectedInstructorIds.length > 0 && (
              <button
                id="clear-instructor-filters-btn"
                onClick={onClearInstructorFilters}
                className="text-2xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Limpar ({selectedInstructorIds.length})
              </button>
            )}
          </div>
          {instructors.length === 0 ? (
            <p className="text-xs italic text-slate-400">Nenhum cadastrado</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {instructors.map((inst) => {
                const isSelected = selectedInstructorIds.includes(inst.id);
                return (
                  <button
                    key={inst.id}
                    id={`sidebar-filter-instructor-${inst.id}`}
                    onClick={() => onToggleInstructor(inst.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span 
                        style={{ backgroundColor: inst.color }}
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      />
                      <span className="truncate">{inst.name}</span>
                    </span>
                    {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter by Location */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Locais
            </h5>
            {selectedLocationIds.length > 0 && (
              <button
                id="clear-location-filters-btn"
                onClick={onClearLocationFilters}
                className="text-2xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Limpar ({selectedLocationIds.length})
              </button>
            )}
          </div>
          {locations.length === 0 ? (
            <p className="text-xs italic text-slate-400">Nenhum cadastrado</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {locations.map((loc) => {
                const isSelected = selectedLocationIds.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    id={`sidebar-filter-location-${loc.id}`}
                    onClick={() => onToggleLocation(loc.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </span>
                    {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
