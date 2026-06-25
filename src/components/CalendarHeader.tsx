/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MONTHS_PT, formatWeekRange, getDaysInWeek, formatFullDay } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, Grid3X3, ListTodo, MapPin, User, SlidersHorizontal, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function CalendarHeader({
  currentDate,
  onNavigate,
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  isSidebarOpen,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
}: CalendarHeaderProps) {
  
  // Format title depending on active view
  const getHeaderTitle = () => {
    if (view === 'month') {
      return `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const weekDays = getDaysInWeek(currentDate);
      return formatWeekRange(weekDays[0], weekDays[6]);
    } else {
      return formatFullDay(currentDate);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: Navigation controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation buttons */}
        <button
          id="nav-today-btn"
          onClick={() => onNavigate('today')}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer"
        >
          Hoje
        </button>

        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 shadow-sm">
          <button
            id="nav-prev-btn"
            onClick={() => onNavigate('prev')}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
            title="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            id="nav-next-btn"
            onClick={() => onNavigate('next')}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
            title="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Current Period Title */}
        <h2 id="calendar-header-title" className="text-lg font-bold text-slate-900 md:ml-2">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Right side: Search and view selection */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            id="training-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar treinamento..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* View Segmented Toggle (Dia / Semana / Mês) */}
        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50/50 shadow-inner">
          <button
            id="view-day-btn"
            onClick={() => onViewChange('day')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              view === 'day'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dia
          </button>
          <button
            id="view-week-btn"
            onClick={() => onViewChange('week')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              view === 'week'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semana
          </button>
          <button
            id="view-month-btn"
            onClick={() => onViewChange('month')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              view === 'month'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Mês
          </button>
        </div>

        {/* Divisor vertical sutil */}
        <div className="hidden sm:block h-8 w-px bg-slate-200" />

        {/* Controles de tela */}
        <div className="flex items-center gap-2">
          {/* Botão de Toggle da Sidebar */}
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Ocultar Menu Lateral" : "Mostrar Menu Lateral"}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isSidebarOpen ? (
              <>
                <EyeOff className="h-4 w-4 text-slate-500" />
                <span className="hidden lg:inline">Ocultar Menu</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="hidden lg:inline text-blue-600">Mostrar Menu</span>
              </>
            )}
          </button>

          {/* Botão de Fullscreen */}
          <button
            id="toggle-fullscreen-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Sair de Tela Cheia" : "Modo Tela Cheia"}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 text-blue-600" />
                <span className="hidden lg:inline text-blue-600">Sair Foco</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 text-slate-500" />
                <span className="hidden lg:inline">Foco</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
