import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Training, Instructor, Location } from '../types';
import { generateMonthGrid, getDaysInWeek, MONTHS_PT, formatDateString, formatTimeString } from '../utils/dateUtils';
import { getHolidayForDate, getHolidaysForYear } from '../utils/holidays';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Trash2, 
  Check, 
  Tag, 
  User, 
  Edit3,
  AlertCircle,
  Target,
  ShieldCheck,
  TrendingUp,
  Clock,
  MapPin,
  RefreshCw,
  Maximize2,
  Minimize2,
  BarChart3,
  CheckCircle2,
  PanelLeft
} from 'lucide-react';
import ProtheusToggle from './ProtheusToggle';

interface InteractiveCalendarViewProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onSyncRequested?: () => Promise<void>;
  viewMode?: 'month' | 'week';
  onViewModeChange?: (mode: 'month' | 'week') => void;
  onOpenAddModal: (dateStr: string) => void;
  onOpenEditModal: (training: Training) => void;
}

// Preset color swatches matching the exact image palette
const COLOR_PRESETS = [
  { name: 'Admir Ventura (Laranja)', hex: '#f24e1e' },
  { name: 'Alexandre Rivellino (Azul)', hex: '#0b41cd' },
  { name: 'Jaqueline Daiane (Verde Água)', hex: '#008b8b' },
  { name: 'Leandro Manha (Roxo)', hex: '#6b21a8' },
  { name: 'Naiara Cristina (Amarelo)', hex: '#e5a000' },
  { name: 'Thiago Anjos (Preto)', hex: '#18181b' },
  { name: 'Vermelho', hex: '#dc2626' },
  { name: 'Cinza (Feriado)', hex: '#64748b' },
];

export default function InteractiveCalendarView({
  currentDate,
  onNavigate,
  trainings,
  instructors,
  locations,
  onSyncRequested,
  viewMode = 'month',
  onViewModeChange,
  onOpenAddModal,
  onOpenEditModal,
}: InteractiveCalendarViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (calendarContainerRef.current && calendarContainerRef.current.requestFullscreen) {
        calendarContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleManualSync = async () => {
    if (!onSyncRequested) return;
    setIsSyncing(true);
    try {
      await onSyncRequested();
    } finally {
      setIsSyncing(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const gridDays = useMemo(() => {
    if (viewMode === 'week') {
      const days = getDaysInWeek(currentDate);
      return days.map((d) => ({
        date: d,
        isCurrentMonth: d.getMonth() === month,
        key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      }));
    }
    return generateMonthGrid(year, month);
  }, [year, month, currentDate, viewMode]);

  const weeks = useMemo(() => {
    const res: Array<typeof gridDays> = [];
    for (let i = 0; i < gridDays.length; i += 7) {
      res.push(gridDays.slice(i, i + 7));
    }
    return res;
  }, [gridDays]);
  const yearHolidays = useMemo(() => getHolidaysForYear(year), [year]);

  const instructorsMap = useMemo(() => new Map<string, Instructor>(instructors.map((i) => [i.id, i])), [instructors]);
  const locationsMap = useMemo(() => new Map<string, Location>(locations.map((l) => [l.id, l])), [locations]);

  // Filter state by selected instructor on left panel (null = show all)
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState<string | null>(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | null>(null);

  // Monthly statistics for current viewed month
  const monthTrainings = trainings.filter((t) => {
    if (t.status === 'cancelado') return false;
    const [tY, tM] = t.startDate.split('T')[0].split('-').map(Number);
    return tY === year && tM === month + 1;
  });

  const totalMonthTrainings = monthTrainings.length;

  const now = new Date();
  const realizadosCount = monthTrainings.filter((t) => {
    const endDate = new Date(t.endDate || t.startDate);
    return endDate.getTime() < now.getTime();
  }).length;

  const pendentesCount = monthTrainings.filter((t) => {
    const endDate = new Date(t.endDate || t.startDate);
    return endDate.getTime() >= now.getTime();
  }).length;

  const completionPercent = totalMonthTrainings > 0
    ? Math.round((realizadosCount / totalMonthTrainings) * 100)
    : 0;

  // Open modal for creating new training on a specific date string (YYYY-MM-DD)
  const handleOpenNewForDate = (dateStr: string) => {
    onOpenAddModal(dateStr);
  };

  // Open modal for editing existing training
  const handleOpenEditTraining = (training: Training, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent trigger day click
    onOpenEditModal(training);
  };

  // Group trainings by date (YYYY-MM-DD)
  const trainingsByDate = useMemo(() => {
    const map = new Map<string, Training[]>();
    trainings.forEach((t) => {
      const dateKey = t.startDate.split('T')[0];
      
      // Apply instructor filter if active
      if (selectedInstructorFilter) {
        const selectedInstObj = instructors.find((i) => i.id === selectedInstructorFilter);
        const selectedNameNorm = selectedInstObj?.name.trim().toLowerCase();
        const tInstObj = instructorsMap.get(t.instructorId);
        const tNameNorm = tInstObj?.name.trim().toLowerCase();

        const matches =
          t.instructorId === selectedInstructorFilter ||
          (selectedNameNorm && tNameNorm && selectedNameNorm === tNameNorm);

        if (!matches) {
          return;
        }
      }

      // Apply location filter if active
      if (selectedLocationFilter && t.locationId !== selectedLocationFilter) {
        return;
      }

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(t);
    });
    return map;
  }, [trainings, selectedInstructorFilter, selectedLocationFilter, instructors, instructorsMap]);

  const monthNameUpper = MONTHS_PT[month].toUpperCase();

  return (
    <div 
      ref={calendarContainerRef}
      className={`flex-1 flex flex-col min-h-0 bg-[#030e21] text-slate-100 relative font-sans transition-all duration-150 ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none p-3 sm:p-4 md:p-5 overflow-hidden' 
          : 'h-full rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 shadow-2xl border border-slate-800/90 overflow-hidden'
      }`}
    >
      
      {/* Background Top & Bottom Red Diagonal Geometry Accents */}
      <div 
        className="absolute top-0 right-0 w-80 h-32 bg-red-600 opacity-90 pointer-events-none transform translate-x-12 -translate-y-12 rotate-12 blur-xs z-0"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-28 bg-red-600 opacity-90 pointer-events-none transform translate-x-16 translate-y-8 -rotate-6 z-0"
        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }}
      />

      {/* ============================================================ */}
      {/* HEADER BANNER: PROENG TEXT + AGENDA MONTH TITLE + CONTROLS    */}
      {/* ============================================================ */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80 mb-3 flex-shrink-0">
        
        {/* Left: Brand Text & Title Block */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Clean PROENG Text */}
          <div className="flex items-center">
            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white drop-shadow-md">
              PRO<span className="text-red-600">ENG</span>
            </span>
          </div>

          <div className="h-8 w-[2px] bg-slate-700/80 hidden sm:block" />

          {/* Title Header */}
          <div className="flex flex-col">
            <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 uppercase">
              GESTÃO DE TREINAMENTOS PROENG
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-red-600 uppercase drop-shadow-sm">
                {monthNameUpper}
              </h1>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {year}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title Text */}
        <div className="hidden xl:flex flex-col text-center">
          <p className="text-sm font-black text-slate-200 tracking-wider uppercase">
            CALENDÁRIO DE TREINAMENTOS
          </p>
        </div>

        {/* Right: Quick Controls & Standalone Fullscreen Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Navigation & Sync Actions Bar */}
          <div className="flex items-center gap-1.5 bg-[#0a1c38] p-1 rounded-xl border border-slate-700/80">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showSidebar 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-[#11284d] text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={showSidebar ? 'Ocultar painel lateral' : 'Exibir painel lateral (Instrutores/Locais/Estatísticas)'}
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <div className="h-5 w-[1px] bg-slate-700 mx-0.5" />

            <button
              onClick={() => onNavigate('prev')}
              className="p-1.5 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('today')}
              className="px-2.5 py-1 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-1.5 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              title="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-[#11284d] rounded-lg p-0.5 ml-1">
              <button
                onClick={() => onViewModeChange && onViewModeChange('month')}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
                  viewMode === 'month' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => onViewModeChange && onViewModeChange('week')}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
                  viewMode === 'week' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semana
              </button>
            </div>

            {/* Sync Button */}
            {onSyncRequested && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black px-2.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                title="Sincronizar com banco de dados"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}

            <button
              onClick={() => handleOpenNewForDate(formatDateString(currentDate))}
              className="ml-0.5 flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Treinamento</span>
            </button>
          </div>

          {/* Standalone Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer border ${
              isFullscreen 
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50 ring-2 ring-amber-400/30' 
                : 'bg-[#0a1c38] hover:bg-blue-600 text-slate-100 border-slate-700/80 hover:border-blue-500'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia (Esc)' : 'Visualizar em Tela Cheia'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5 text-amber-200" />
                <span className="hidden sm:inline">Sair Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Tela Cheia</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA: LEFT PANEL + CALENDAR GRID               */}
      {/* ============================================================ */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: INSTRUTORES + LOCAIS + ESTATÍSTICAS */}
        {showSidebar && (
          <div className="w-full md:w-56 lg:w-64 flex flex-col gap-2.5 flex-shrink-0 min-h-0 overflow-y-auto custom-scrollbar pb-1">
            
            {/* 1. INSTRUTORES Card */}
            <div className="bg-white rounded-2xl flex flex-col shadow-lg border border-slate-200/90 overflow-hidden flex-shrink-0 max-h-52">
              <div className="bg-[#001130] px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-400 stroke-[2.5]" />
                  <h3 className="text-xs font-black tracking-widest uppercase text-white">
                    Instrutores
                  </h3>
                </div>
                {selectedInstructorFilter && (
                  <button
                    onClick={() => setSelectedInstructorFilter(null)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-col p-1.5 gap-1 overflow-y-auto custom-scrollbar">
                {instructors.map((inst) => {
                  const isSelected = selectedInstructorFilter === inst.id;
                  const avatarBg = inst.color || '#ea580c';

                  return (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstructorFilter(isSelected ? null : inst.id)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 ring-2 ring-blue-600 text-slate-900'
                          : 'bg-white hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div 
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: avatarBg }}
                      >
                        <User className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate leading-tight">
                          {inst.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. LOCAIS Card */}
            <div className="bg-white rounded-2xl flex flex-col shadow-lg border border-slate-200/90 overflow-hidden flex-shrink-0 max-h-44">
              <div className="bg-[#001130] px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400 stroke-[2.5]" />
                  <h3 className="text-xs font-black tracking-widest uppercase text-white">
                    Locais
                  </h3>
                </div>
                {selectedLocationFilter && (
                  <button
                    onClick={() => setSelectedLocationFilter(null)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-col p-1.5 gap-1 overflow-y-auto custom-scrollbar">
                {locations.map((loc) => {
                  const isSelected = selectedLocationFilter === loc.id;
                  
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocationFilter(isSelected ? null : loc.id)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 ring-2 ring-blue-600 text-slate-900'
                          : 'bg-white hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs flex-shrink-0 bg-slate-600">
                        <MapPin className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate leading-tight" title={loc.name}>
                          {loc.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. ESTATÍSTICAS DO MÊS Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-slate-900 shadow-md flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-blue-600 text-white shadow-2xs">
                    <BarChart3 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                    Estatísticas
                  </span>
                </div>
                <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 uppercase">
                  {MONTHS_PT[month]}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {/* Agendados */}
                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3 w-3 text-blue-600 stroke-[2.5]" />
                    <span className="text-[11px] font-bold text-slate-700">Agendados:</span>
                  </div>
                  <span className="text-[11px] font-black text-blue-700 px-1.5 py-0.2 rounded bg-blue-100 border border-blue-200">
                    {totalMonthTrainings}
                  </span>
                </div>

                {/* Realizados */}
                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                    <span className="text-[11px] font-bold text-slate-700">Realizados:</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-200">
                    {realizadosCount}
                  </span>
                </div>

                {/* Pendentes */}
                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-600 stroke-[2.5]" />
                    <span className="text-[11px] font-bold text-slate-700">Pendentes:</span>
                  </div>
                  <span className="text-[11px] font-black text-amber-700 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-200">
                    {pendentesCount}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {totalMonthTrainings > 0 && (
                <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-600">
                    <span>Conclusão</span>
                    <span className="text-emerald-600 font-black">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/80">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 shadow-2xs" 
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* RIGHT AREA: CALENDAR GRID */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Weekday Header (DOM, SEG, TER, QUA, QUI, SEX, SÁB) */}
          <div className="grid grid-cols-7 bg-[#001130] border-b-2 border-slate-800 flex-shrink-0">
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-red-500 tracking-wider border-r border-slate-800/80">
              DOM
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              SEG
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              TER
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              QUA
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              QUI
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              SEX
            </div>
            <div className="py-2 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider">
              SÁB
            </div>
          </div>

          {/* Month/Week Days Grid: Grouped by Week Rows */}
          <div className="flex-1 min-h-0 bg-slate-300 flex flex-col overflow-y-auto custom-scrollbar gap-[1px]">
            {weeks.map((week, weekIndex) => (
              <div 
                key={weekIndex} 
                className={`grid grid-cols-7 gap-[1px] bg-slate-300 flex-1 ${viewMode === 'week' ? 'min-h-[260px]' : 'min-h-[105px]'}`}
              >
                {week.map((cell) => {
                  const dateStr = formatDateString(cell.date);
                  const dayTrainings = trainingsByDate.get(dateStr) || [];
                  const dayNum = cell.date.getDate();
                  const holiday = getHolidayForDate(cell.date);

                  const todayStr = formatDateString(new Date());
                  const isToday = dateStr === todayStr;
                  const isPast = cell.date.getTime() < new Date().setHours(0, 0, 0, 0) && !isToday;

                  let dayLabel = `${dayNum}`;
                  if (dayNum === 1) {
                    const monthShortName = MONTHS_PT[cell.date.getMonth()].substring(0, 3).toLowerCase();
                    dayLabel = `1 ${monthShortName}.`;
                  }

                  return (
                    <div
                      key={cell.key}
                      onClick={() => handleOpenNewForDate(dateStr)}
                      className={`h-full min-h-[105px] p-1.5 sm:p-2 flex flex-col gap-1 transition-all cursor-pointer relative group ${
                        !cell.isCurrentMonth
                          ? 'bg-slate-100/80 text-slate-400 opacity-40 grayscale-[25%] hover:opacity-90 hover:grayscale-0'
                          : isPast
                          ? 'bg-[#f8fafc] text-slate-500 opacity-60 grayscale-[30%] hover:opacity-90 hover:grayscale-0'
                          : isToday
                          ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-500 hover:bg-blue-100/50 z-10 shadow-xs'
                          : holiday
                          ? 'bg-amber-50/60 hover:bg-amber-100/70'
                          : 'bg-[#f8fafc] text-slate-800 hover:bg-blue-50/70'
                      }`}
                    >
                      {/* Top Day Number Header */}
                      <div className="flex items-center justify-between mb-0.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-xs sm:text-sm font-extrabold select-none flex items-center justify-center ${
                            isToday 
                              ? 'h-6 w-6 rounded-full bg-blue-600 text-white shadow-xs'
                              : holiday 
                              ? 'text-red-700 font-black' 
                              : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                          }`}>
                            {dayLabel}
                          </span>
                          {holiday && (
                            <span 
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight truncate max-w-[110px] ${
                                holiday.type === 'municipal' 
                                   ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                   : 'bg-red-100 text-red-800 border border-red-200'
                              }`} 
                              title={holiday.name}
                            >
                              {holiday.type === 'municipal' ? 'Feriado Municipal' : 'Feriado'}
                            </span>
                          )}
                        </div>

                        {/* Plus Icon on Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNewForDate(dateStr);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-opacity"
                          title="Adicionar treinamento nesta data"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Holiday Indicator Banner */}
                      {holiday && (
                        <div 
                          className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[9.5px] font-bold flex items-center gap-1 border shadow-2xs flex-shrink-0 ${
                            holiday.type === 'municipal'
                              ? 'bg-amber-100/95 text-amber-950 border-amber-300'
                              : 'bg-red-100/95 text-red-950 border-red-200'
                          }`}
                          title={holiday.name}
                        >
                          <span className="text-[10px] leading-none flex-shrink-0">🎉</span>
                          <span className="truncate font-black">{holiday.name}</span>
                        </div>
                      )}

                      {/* List of Detailed Training Cards */}
                      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-0.5">
                        {dayTrainings.map((t) => {
                          const inst = instructorsMap.get(t.instructorId);
                          const loc = locationsMap.get(t.locationId);

                          // Determine color matching instructor or custom selection
                          const instColor = t.customColor || inst?.color || '#3b82f6';
                          const timeStr = formatTimeString(t.startDate) || '08:00';
                          const isCanceled = t.status === 'cancelado';

                          // Helper to convert hex to rgba tint for card background and border
                          const getLightTint = (hex: string, alpha: number) => {
                            if (!hex || !hex.startsWith('#') || hex.length !== 7) return `rgba(59, 130, 246, ${alpha})`;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                          };

                          const cardBg = isCanceled ? '#f8fafc' : getLightTint(instColor, 0.10);
                          const cardBorderColor = isCanceled ? '#e2e8f0' : getLightTint(instColor, 0.30);

                          return (
                            <div
                              key={t.id}
                              onClick={(e) => handleOpenEditTraining(t, e)}
                              style={{ 
                                backgroundColor: cardBg,
                                borderColor: cardBorderColor,
                                borderLeftColor: isCanceled ? '#cbd5e1' : instColor 
                              }}
                              className={`rounded-r-lg p-1.5 sm:p-2 text-2xs ${
                                isCanceled 
                                  ? 'border-l-[4px] border-dashed border-slate-300' 
                                  : 'border-l-[4px]'
                              } border-y border-r shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 group/card hover:translate-x-0.5 select-none`}
                              title={`${t.title} - ${inst?.name || 'Sem Instrutor'} (${loc?.name || 'Sem Local'}) - Clique para editar`}
                            >
                              {/* Row 1: Time Pill + Title + Badges (Mini Toggle + Attendee count) */}
                              <div className="flex items-start justify-between gap-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span 
                                    style={{ backgroundColor: isCanceled ? '#94a3b8' : instColor }}
                                    className="px-1.5 py-0.5 rounded text-[9.5px] sm:text-[10px] font-black text-white tracking-tight flex-shrink-0 shadow-2xs leading-none"
                                  >
                                    {timeStr}
                                  </span>
                                  <span className={`font-black text-[10.5px] sm:text-[11.5px] leading-tight break-words line-clamp-2 ${
                                    isCanceled ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}>
                                    {t.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                                  {t.protheusLaunched && (
                                    <ProtheusToggle checked={true} size="replica" className="flex-shrink-0" />
                                  )}
                                  {t.attendeeCount && t.attendeeCount > 0 && (
                                    <span 
                                      className="bg-slate-200/90 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-300 shadow-2xs leading-none flex-shrink-0" 
                                      title={`${t.attendeeCount} alunos cadastrados`}
                                    >
                                      {t.attendeeCount}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: Location & Instructor with Clear Structure */}
                              <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] leading-tight pt-1 border-t border-black/5">
                                {/* Location */}
                                <span className="flex items-center gap-0.5 truncate text-slate-600 font-bold min-w-0 flex-1" title={loc?.name || 'Local não definido'}>
                                  <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-slate-500" />
                                  <span className="truncate">{loc?.name || 'Local não definido'}</span>
                                </span>

                                {/* Instructor */}
                                <span className="flex items-center gap-1 truncate font-extrabold text-slate-900 flex-shrink-0 max-w-[55%]" title={inst?.name || 'Instrutor não definido'}>
                                  <div 
                                    className="h-2 w-2 rounded-full flex-shrink-0 shadow-2xs" 
                                    style={{ backgroundColor: isCanceled ? '#94a3b8' : instColor }}
                                  />
                                  <span className="truncate">{inst?.name || 'Instrutor não definido'}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
