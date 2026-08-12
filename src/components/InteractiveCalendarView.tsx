import React, { useState, useEffect, useRef } from 'react';
import { Training, Instructor, Location } from '../types';
import { generateMonthGrid, MONTHS_PT, formatDateString, formatTimeString } from '../utils/dateUtils';
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
  CheckCircle2
} from 'lucide-react';

interface InteractiveCalendarViewProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onSaveTraining: (training: Omit<Training, 'id'> & { id?: string }) => void;
  onDeleteTraining: (id: string) => void;
  onSaveInstructor?: (instructor: Omit<Instructor, 'id'> & { id?: string }) => void;
  onSyncRequested?: () => Promise<void>;
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
  onSaveTraining,
  onDeleteTraining,
  onSyncRequested,
}: InteractiveCalendarViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const gridDays = generateMonthGrid(year, month);
  const yearHolidays = getHolidaysForYear(year);

  // Month holidays for sidebar notice
  const currentMonthHolidays = Array.from(yearHolidays.values()).filter((h) => {
    const [hY, hM] = h.dateStr.split('-').map(Number);
    return hY === year && hM === month + 1;
  });

  // Calculate active instructor normalized names and IDs in the current visible grid / calendar month
  const gridDateSet = new Set(gridDays.map((d) => formatDateString(d.date)));
  const activeInstructorKeys = new Set<string>();

  trainings.forEach((t) => {
    const [tDateStr] = t.startDate.split('T');
    if (gridDateSet.has(tDateStr) && t.instructorId) {
      activeInstructorKeys.add(t.instructorId.toLowerCase());
      const instObj = instructors.find((i) => i.id === t.instructorId);
      if (instObj) {
        activeInstructorKeys.add(instObj.name.trim().toLowerCase());
      }
    }
  });

  // Filter instructors for sidebar and strictly deduplicate by normalized name
  const sidebarMap = new Map<string, Instructor>();
  instructors.forEach((inst) => {
    const normName = inst.name.trim().toLowerCase();
    const isMatch = activeInstructorKeys.has(inst.id.toLowerCase()) || activeInstructorKeys.has(normName);
    if (isMatch && !sidebarMap.has(normName)) {
      sidebarMap.set(normName, inst);
    }
  });

  const calendarSidebarInstructors = Array.from(sidebarMap.values());

  // Filter state by selected instructor on left panel (null = show all)
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState<string | null>(null);

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

  // Highlight notice box on left panel (keyed by year-month)
  const [monthlyHighlights, setMonthlyHighlights] = useState<Record<string, string>>({});
  const yearMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const customHighlight = monthlyHighlights[yearMonthKey];
  const hasCustomHighlight = Boolean(customHighlight && customHighlight.trim().length > 0);
  const currentHighlightText = customHighlight ?? '';
  const [isEditingHighlight, setIsEditingHighlight] = useState(false);

  // Quick Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [targetDateStr, setTargetDateStr] = useState<string>('');

  // Quick Add Form state
  const [formTitle, setFormTitle] = useState('');
  const [formInstructorId, setFormInstructorId] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('17:00');
  const [formError, setFormError] = useState('');

  // Maps for fast lookup
  const instructorsMap = new Map<string, Instructor>(instructors.map((i) => [i.id, i]));
  const locationsMap = new Map<string, Location>(locations.map((l) => [l.id, l]));

  // Open modal for creating new training on a specific date string (YYYY-MM-DD)
  const handleOpenNewForDate = (dateStr: string) => {
    setEditingTrainingId(null);
    setTargetDateStr(dateStr);
    setFormTitle('');
    
    // Default instructor and color
    const defaultInst = instructors[0];
    setFormInstructorId(defaultInst?.id || '');
    setFormColor(defaultInst?.color || '#6b21a8');
    setFormLocationId(locations[0]?.id || '');
    
    setFormStartTime('08:00');
    setFormEndTime('17:00');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing training
  const handleOpenEditTraining = (training: Training, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent trigger day click
    setEditingTrainingId(training.id);
    
    const [datePart, startTimePart] = training.startDate.split('T');
    const [, endTimePart] = training.endDate.split('T');

    setTargetDateStr(datePart);
    setFormTitle(training.title);
    setFormInstructorId(training.instructorId);
    setFormLocationId(training.locationId);
    
    const inst = instructorsMap.get(training.instructorId);
    setFormColor(training.customColor || inst?.color || '#6b21a8');
    
    setFormStartTime(startTimePart?.substring(0, 5) || '08:00');
    setFormEndTime(endTimePart?.substring(0, 5) || '17:00');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle instructor selection in form -> auto update color if not overridden
  const handleInstructorSelect = (id: string) => {
    setFormInstructorId(id);
    const inst = instructorsMap.get(id);
    if (inst?.color) {
      setFormColor(inst.color);
    }
  };

  // Save Modal Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Por favor, informe o título do treinamento.');
      return;
    }

    if (!targetDateStr) {
      setFormError('Selecione uma data.');
      return;
    }

    const startIso = `${targetDateStr}T${formStartTime}`;
    const endIso = `${targetDateStr}T${formEndTime}`;

    onSaveTraining({
      id: editingTrainingId || undefined,
      title: formTitle.trim(),
      instructorId: formInstructorId || instructors[0]?.id || '',
      locationId: formLocationId || locations[0]?.id || '',
      startDate: startIso,
      endDate: endIso,
      status: 'confirmado',
      customColor: formColor || undefined,
    });

    setIsModalOpen(false);
  };

  // Group trainings by date (YYYY-MM-DD)
  const trainingsByDate = new Map<string, Training[]>();
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

    if (!trainingsByDate.has(dateKey)) {
      trainingsByDate.set(dateKey, []);
    }
    trainingsByDate.get(dateKey)!.push(t);
  });

  const monthNameUpper = MONTHS_PT[month].toUpperCase();

  return (
    <div 
      ref={calendarContainerRef}
      className={`flex-1 flex flex-col bg-[#030e21] text-slate-100 relative font-sans transition-all duration-150 ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none p-4 sm:p-6 overflow-y-auto' 
          : 'rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800/90 overflow-hidden'
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
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-5">
        
        {/* Left: Brand Text & Title Block */}
        <div className="flex items-center gap-5">
          {/* Clean PROENG Text */}
          <div className="flex items-center">
            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white drop-shadow-md">
              PRO<span className="text-red-600">ENG</span>
            </span>
          </div>

          <div className="h-10 w-[2px] bg-slate-700/80 hidden sm:block" />

          {/* Title Header */}
          <div className="flex flex-col">
            <p className="text-[11px] font-black tracking-widest text-slate-300 uppercase">
              GESTÃO DE TREINAMENTOS PROENG
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-red-600 uppercase drop-shadow-sm">
                {monthNameUpper}
              </h1>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {year}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title Text (no card) */}
        <div className="hidden lg:flex flex-col text-center">
          <p className="text-xs font-black text-white tracking-widest uppercase">GESTÃO DE TREINAMENTOS</p>
          <p className="text-xs font-extrabold text-red-500 tracking-tight">Transforme resultados.</p>
        </div>

        {/* Right: Quick Controls & Standalone Fullscreen Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation & Sync Actions Bar */}
          <div className="flex items-center gap-2 bg-[#0a1c38] p-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('today')}
              className="px-3 py-1.5 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-2 rounded-lg bg-[#11284d] text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Sync Button */}
            {onSyncRequested && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black px-3 py-2 rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                title="Sincronizar dados entre ambiente de teste e produção no Supabase"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}

            <button
              onClick={() => handleOpenNewForDate(formatDateString(new Date()))}
              className="ml-1 flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black px-3.5 py-2 rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              + Treinamento
            </button>
          </div>

          {/* Standalone Fullscreen Toggle Button (Separated on the right) */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer border ${
              isFullscreen 
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50 ring-2 ring-amber-400/30' 
                : 'bg-[#0a1c38] hover:bg-blue-600 text-slate-100 border-slate-700/80 hover:border-blue-500'
            }`}
            title={isFullscreen ? 'Sair da Tela Cheia (Esc)' : 'Visualizar em Tela Cheia'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 text-amber-200" />
                <span>Sair Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 text-blue-400" />
                <span>Tela Cheia</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA: LEFT PANEL + CALENDAR GRID               */}
      {/* ============================================================ */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-5">
        
        {/* LEFT PANEL: INSTRUTORES + ESTATÍSTICAS + DESTAQUE (Hidden in Fullscreen Mode) */}
        {!isFullscreen && (
          <div className="w-full md:w-60 lg:w-64 flex flex-col gap-3.5 flex-shrink-0">
            
            {/* 1. INSTRUTORES Section Header */}
            <div className="bg-[#001130] border border-slate-700 rounded-xl p-2.5 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-600 text-white">
                  <Users className="h-4 w-4 stroke-[2.5]" />
                </div>
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

            {/* Instructor Cards List (Only instructors with scheduled trainings in current calendar view) */}
            <div className="flex flex-col gap-1.5">
              {calendarSidebarInstructors.length > 0 ? (
                calendarSidebarInstructors.map((inst) => {
                  const isSelected = selectedInstructorFilter === inst.id;
                  const avatarBg = inst.color || '#ea580c';

                  return (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstructorFilter(isSelected ? null : inst.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-blue-50 ring-2 ring-blue-600 text-slate-900'
                          : 'bg-white hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div 
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0"
                        style={{ backgroundColor: avatarBg }}
                      >
                        <User className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate leading-tight">
                          {inst.name}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-2.5 bg-white/10 rounded-xl text-center text-xs text-slate-300 font-medium border border-slate-700/50">
                  Nenhum instrutor neste mês
                </div>
              )}
            </div>

            {/* 2. ESTATÍSTICAS DO MÊS Card */}
            <div className="bg-[#001130] border border-slate-700/80 rounded-2xl p-3.5 text-white shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                    <BarChart3 className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-white">
                    Estatísticas do Mês
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
                  {MONTHS_PT[month]}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 pt-0.5">
                {/* Agendados */}
                <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                      <CalendarIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Treinamentos agendados:</span>
                  </div>
                  <span className="text-xs font-black text-white px-2 py-0.5 rounded-md bg-blue-600/50 border border-blue-400/40">
                    {totalMonthTrainings}
                  </span>
                </div>

                {/* Realizados */}
                <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Realizados:</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/40">
                    {realizadosCount}
                  </span>
                </div>

                {/* Pendentes */}
                <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Pendentes:</span>
                  </div>
                  <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-600/40">
                    {pendentesCount}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {totalMonthTrainings > 0 && (
                <div className="flex flex-col gap-1 pt-1 border-t border-slate-700/50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                    <span>Progresso de Conclusão</span>
                    <span className="text-emerald-400 font-black">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. DESTAQUE & FERIADOS Card */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-red-500/80 text-slate-900 shadow-xl relative group mt-auto flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-red-600 text-white shadow-xs">
                    <CalendarIcon className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-red-600 uppercase">
                    Feriados & Destaques
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingHighlight(!isEditingHighlight)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
                  title="Editar destaque do mês"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isEditingHighlight ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={currentHighlightText}
                    onChange={(e) => setMonthlyHighlights((prev) => ({ ...prev, [yearMonthKey]: e.target.value }))}
                    className="text-xs border border-slate-300 rounded-md p-2 w-full resize-none text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                    placeholder={`Destaque personalizado para ${MONTHS_PT[month]}...`}
                  />
                  <button
                    onClick={() => setIsEditingHighlight(false)}
                    className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-red-700 transition-colors self-end cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <>
                  {hasCustomHighlight ? (
                    <p className="text-xs font-extrabold text-slate-800 leading-snug">
                      {currentHighlightText}
                    </p>
                  ) : currentMonthHolidays.length > 0 ? (
                    <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5 flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">
                        Feriados em {MONTHS_PT[month]}:
                      </span>
                      {currentMonthHolidays.map((h) => {
                        const [, , hD] = h.dateStr.split('-');
                        return (
                          <div key={h.dateStr} className="flex items-start gap-1 text-xs text-slate-800">
                            <span className="font-black text-red-600">{hD}/{String(month + 1).padStart(2, '0')}:</span>
                            <span className="font-extrabold truncate" title={h.name}>{h.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-xs font-bold text-slate-600">
                      Sem feriados cadastrados em {MONTHS_PT[month]}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

        {/* RIGHT AREA: CALENDAR GRID */}
        <div className="flex-1 flex flex-col bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Weekday Header (DOM, SEG, TER, QUA, QUI, SEX, SÁB) */}
          <div className="grid grid-cols-7 bg-[#001130] border-b-2 border-slate-800">
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-red-500 tracking-wider border-r border-slate-800/80">
              DOM
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              SEG
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              TER
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              QUA
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              QUI
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider border-r border-slate-800/80">
              SEX
            </div>
            <div className="py-2.5 text-center text-xs sm:text-sm font-black uppercase text-white tracking-wider">
              SÁB
            </div>
          </div>

          {/* Month Days Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-300 gap-[1px]">
            {gridDays.map((cell) => {
              const dateStr = formatDateString(cell.date);
              const dayTrainings = trainingsByDate.get(dateStr) || [];
              const dayNum = cell.date.getDate();
              const holiday = getHolidayForDate(cell.date);

              let dayLabel = `${dayNum}`;
              if (dayNum === 1) {
                const monthShortName = MONTHS_PT[cell.date.getMonth()].substring(0, 3).toLowerCase();
                dayLabel = `1 ${monthShortName}.`;
              }

              return (
                <div
                  key={cell.key}
                  onClick={() => handleOpenNewForDate(dateStr)}
                  className={`min-h-[120px] sm:min-h-[145px] p-1.5 flex flex-col gap-1 transition-colors cursor-pointer relative group border-r border-b border-slate-300/80 ${
                    holiday
                      ? 'bg-amber-50/60 hover:bg-amber-100/70'
                      : cell.isCurrentMonth
                      ? 'bg-[#f8fafc] text-slate-800 hover:bg-blue-50/70'
                      : 'bg-slate-100/90 text-slate-400 hover:bg-slate-200/70'
                  }`}
                >
                  {/* Top Day Number Header */}
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className={`text-xs sm:text-sm font-extrabold select-none ${
                        holiday 
                          ? 'text-red-700 font-black' 
                          : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {dayLabel}
                      </span>
                      {holiday && (
                        <span 
                          className={`inline-flex items-center px-1 py-0.2 rounded text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight truncate max-w-[120px] ${
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
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-opacity"
                      title="Adicionar evento"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Holiday Indicator Banner */}
                  {holiday && (
                    <div 
                      className={`rounded px-1.5 py-1 text-[9.5px] sm:text-[10px] font-bold flex items-center gap-1.5 border shadow-2xs ${
                        holiday.type === 'municipal'
                          ? 'bg-amber-100/95 text-amber-950 border-amber-300'
                          : 'bg-red-100/95 text-red-950 border-red-200'
                      }`}
                      title={holiday.name}
                    >
                      <span className="text-[11px] leading-none flex-shrink-0">🎉</span>
                      <span className="truncate font-black">{holiday.name}</span>
                    </div>
                  )}

                  {/* List of Detailed Training Cards */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto min-h-0 pr-0.5 scrollbar-thin">
                    {dayTrainings.map((t) => {
                      const inst = instructorsMap.get(t.instructorId);
                      const loc = locationsMap.get(t.locationId);

                      // Determine color matching instructor or custom selection
                      const instColor = t.customColor || inst?.color || '#3b82f6';
                      const timeStr = formatTimeString(t.startDate) || '08:00';
                      const isCanceled = t.status === 'cancelado';

                      const cardBg = isCanceled ? '#f8fafc' : '#ffffff';

                      return (
                        <div
                          key={t.id}
                          onClick={(e) => handleOpenEditTraining(t, e)}
                          style={{ 
                            backgroundColor: cardBg,
                            borderLeftColor: isCanceled ? '#cbd5e1' : instColor 
                          }}
                          className={`rounded-r-lg px-2 py-1.5 text-2xs ${
                            isCanceled 
                              ? 'border-l-[5px] border-dashed border-slate-300' 
                              : 'border-l-[5px]'
                          } border-y border-r border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-1 group/card hover:translate-x-0.5 select-none`}
                          title={`${t.title} - ${inst?.name || ''} (${loc?.name || ''}) - Clique para editar`}
                        >
                          {/* Row 1: Time Pill Badge + Title */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span 
                              style={{ backgroundColor: isCanceled ? '#94a3b8' : instColor }}
                              className="px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px] font-black text-white tracking-tight flex-shrink-0 shadow-2xs"
                            >
                              {timeStr}
                            </span>
                            <span className={`truncate font-black text-[11px] sm:text-[12px] leading-tight ${
                              isCanceled ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}>
                              {t.title}
                            </span>
                          </div>

                          {/* Row 2: Location */}
                          <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] text-slate-500 font-semibold truncate">
                            <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{loc?.name || 'Local N/A'}</span>
                          </div>

                          {/* Row 3: Instructor Name */}
                          <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] font-extrabold truncate text-slate-700">
                            <div 
                              className="h-2 w-2 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: isCanceled ? '#94a3b8' : instColor }}
                            />
                            <span className="truncate">{inst?.name || 'Instrutor N/A'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* QUICK ADD / EDIT MODAL                                      */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#001130] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-black tracking-wide uppercase">
                  {editingTrainingId ? 'Editar Treinamento' : 'Agendamento Rápido'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Data display */}
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <CalendarIcon className="h-4 w-4 text-red-600" />
                  Data Selecionada:
                </span>
                <span className="text-red-600 font-black text-sm">
                  {targetDateStr ? targetDateStr.split('-').reverse().join('/') : ''}
                </span>
              </div>

              {/* Título do Treinamento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Treinamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: NR 35 - P3, PEMT - Ecolab, Integração..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              {/* Seleção do Instrutor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instrutor Responsável
                </label>
                <select
                  value={formInstructorId}
                  onChange={(e) => handleInstructorSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all bg-white"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Palette Color Swatches */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cor da Tag
                </label>
                <div className="flex items-center flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = formColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setFormColor(preset.hex)}
                        style={{ backgroundColor: preset.hex }}
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform cursor-pointer ${
                          isSelected ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105 opacity-90'
                        }`}
                        title={preset.name}
                      >
                        {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local
                </label>
                <select
                  value={formLocationId}
                  onChange={(e) => setFormLocationId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all bg-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Início
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Término
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingTrainingId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingTrainingId) {
                        onDeleteTraining(editingTrainingId);
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Salvar
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
