/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Instructor, Location, Training, TrainingStatus } from './types';
import { 
  INITIAL_INSTRUCTORS, 
  INITIAL_LOCATIONS, 
  INITIAL_TRAININGS 
} from './data/seeds';
import { formatDateString } from './utils/dateUtils';
import {
  isSupabaseConfigured,
  getStorageMode,
  dbGetInstructors,
  dbSaveInstructor,
  dbDeleteInstructor,
  dbGetLocations,
  dbSaveLocation,
  dbDeleteLocation,
  dbGetTrainings,
  dbSaveTraining,
  dbDeleteTraining
} from './lib/supabase';

// Components
import Sidebar from './components/Sidebar';
import CalendarHeader, { CalendarViewType } from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';

// Modals
import InstructorModal from './components/InstructorModal';
import LocationModal from './components/LocationModal';
import TrainingModal from './components/TrainingModal';
import ConfirmationModal from './components/ConfirmationModal';

// CRUD Screens
import InstructorsManagement from './components/InstructorsManagement';
import LocationsManagement from './components/LocationsManagement';
import TrainingsManagement from './components/TrainingsManagement';

// Icons
import { 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  ListTodo, 
  CheckCircle2, 
  Database,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';

type TabType = 'calendario' | 'instrutores' | 'locais' | 'treinamentos';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>('calendario');
  
  // Sidebar visibility toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fullscreen state & ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Synchronize fullscreen state on browser changes (e.g. pressing Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (!calendarRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await calendarRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
      triggerToast('Seu navegador não oferece suporte ou bloqueou a tela cheia para o calendário.', 'error');
    }
  };
  
  // Calendar-specific active date & view (Starts default June 25, 2026 as in metadata)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 25)); // month 5 is June
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');

  // Persistence States
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Status/Category Filters
  const [selectedStatuses, setSelectedStatuses] = useState<TrainingStatus[]>(['confirmado', 'aguardando']);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals visibility and selected items for editing
  const [activeModal, setActiveModal] = useState<'instructor' | 'location' | 'training' | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  // Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'instructor' | 'location' | 'training';
    id: string;
    title: string;
    message: string;
  } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. Initial Load from Supabase (with LocalStorage fallback) or Seeds
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const dbInstructors = await dbGetInstructors(INITIAL_INSTRUCTORS);
        setInstructors(dbInstructors);

        const dbLocations = await dbGetLocations(INITIAL_LOCATIONS);
        setLocations(dbLocations);

        const dbTrainings = await dbGetTrainings(INITIAL_TRAININGS);
        setTrainings(dbTrainings);
        
        if (isSupabaseConfigured) {
          triggerToast('Conectado ao banco de dados Supabase com sucesso!', 'success');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        triggerToast('Erro ao carregar dados do banco. Operando localmente.', 'error');
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadAllData();
  }, []);

  // Toast system
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Reset demo data
  const resetToSeeds = async () => {
    if (confirm('Deseja redefinir todo o sistema para os dados iniciais do exemplo? Seus cadastros atuais serão perdidos.')) {
      setInstructors(INITIAL_INSTRUCTORS);
      setLocations(INITIAL_LOCATIONS);
      setTrainings(INITIAL_TRAININGS);
      
      localStorage.setItem('tr_instructors', JSON.stringify(INITIAL_INSTRUCTORS));
      localStorage.setItem('tr_locations', JSON.stringify(INITIAL_LOCATIONS));
      localStorage.setItem('tr_trainings', JSON.stringify(INITIAL_TRAININGS));
      setCurrentDate(new Date(2026, 5, 25));

      if (isSupabaseConfigured) {
        try {
          triggerToast('Semeando dados iniciais no Supabase...', 'info');
          for (const inst of INITIAL_INSTRUCTORS) {
            await dbSaveInstructor(inst);
          }
          for (const loc of INITIAL_LOCATIONS) {
            await dbSaveLocation(loc);
          }
          for (const t of INITIAL_TRAININGS) {
            await dbSaveTraining(t);
          }
          triggerToast('Dados do Supabase redefinidos com sucesso!', 'success');
        } catch (err) {
          console.error('Erro ao semear dados no Supabase:', err);
          triggerToast('Erro ao semear dados no banco. Redefinido localmente.', 'error');
        }
      } else {
        triggerToast('Dados redefinidos com sucesso para o padrão do exemplo!', 'info');
      }
    }
  };

  // ----------------------------------------------------
  // CRUD ACTIONS: INSTRUTORES
  // ----------------------------------------------------
  const handleSaveInstructor = async (data: Omit<Instructor, 'id'> & { id?: string }) => {
    let updated: Instructor[];
    const targetId = data.id || `inst-${Date.now()}`;
    const instructorToSave: Instructor = {
      ...data,
      id: targetId,
    };

    if (data.id) {
      updated = instructors.map((i) => i.id === data.id ? instructorToSave : i);
    } else {
      updated = [...instructors, instructorToSave];
    }
    setInstructors(updated);

    try {
      await dbSaveInstructor(instructorToSave);
      triggerToast(`Instrutor "${data.name}" salvo com sucesso!`);
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao salvar na nuvem.', 'info');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    const updated = instructors.filter((i) => i.id !== id);
    setInstructors(updated);
    
    const updatedTrainings = trainings.map((t) => t.instructorId === id ? { ...t, instructorId: '' } : t);
    setTrainings(updatedTrainings);

    try {
      // 1. Desvincular treinamentos primeiro no banco para evitar erro de FK (Foreign Key)
      const affectedTrainings = trainings.filter((t) => t.instructorId === id);
      for (const t of affectedTrainings) {
        await dbSaveTraining({ ...t, instructorId: '' });
      }
      // 2. Só então excluir o instrutor
      await dbDeleteInstructor(id);
      triggerToast('Instrutor removido e treinamentos desvinculados.', 'info');
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao excluir na nuvem.', 'info');
    }
  };

  // ----------------------------------------------------
  // CRUD ACTIONS: LOCAIS
  // ----------------------------------------------------
  const handleSaveLocation = async (data: Omit<Location, 'id'> & { id?: string }) => {
    let updated: Location[];
    const targetId = data.id || `loc-${Date.now()}`;
    const locationToSave: Location = {
      ...data,
      id: targetId,
    };

    if (data.id) {
      updated = locations.map((l) => l.id === data.id ? locationToSave : l);
    } else {
      updated = [...locations, locationToSave];
    }
    setLocations(updated);

    try {
      await dbSaveLocation(locationToSave);
      triggerToast(`Local "${data.name}" salvo com sucesso!`);
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao salvar na nuvem.', 'info');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const updated = locations.filter((l) => l.id !== id);
    setLocations(updated);

    const updatedTrainings = trainings.map((t) => t.locationId === id ? { ...t, locationId: '' } : t);
    setTrainings(updatedTrainings);

    try {
      // 1. Desvincular treinamentos primeiro no banco para evitar erro de FK (Foreign Key)
      const affectedTrainings = trainings.filter((t) => t.locationId === id);
      for (const t of affectedTrainings) {
        await dbSaveTraining({ ...t, locationId: '' });
      }
      // 2. Só então excluir o local
      await dbDeleteLocation(id);
      triggerToast('Local removido e treinamentos desvinculados.', 'info');
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao excluir na nuvem.', 'info');
    }
  };

  // ----------------------------------------------------
  // CRUD ACTIONS: TREINAMENTOS (SCHEDULE)
  // ----------------------------------------------------
  const handleSaveTraining = async (data: Omit<Training, 'id'> & { id?: string }) => {
    let updated: Training[];
    const targetId = data.id || `t-${Date.now()}`;
    const trainingToSave: Training = {
      ...data,
      id: targetId,
    };

    if (data.id) {
      updated = trainings.map((t) => t.id === data.id ? trainingToSave : t);
    } else {
      updated = [...trainings, trainingToSave];
    }
    setTrainings(updated);

    try {
      await dbSaveTraining(trainingToSave);
      triggerToast(`Treinamento "${data.title}" salvo com sucesso!`);
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao salvar na nuvem.', 'info');
    }
  };

  const handleDeleteTraining = async (id: string) => {
    const updated = trainings.filter((t) => t.id !== id);
    setTrainings(updated);

    try {
      await dbDeleteTraining(id);
      triggerToast('Treinamento excluído com sucesso.', 'info');
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao excluir na nuvem.', 'info');
    }
  };

  // ----------------------------------------------------
  // UNIFIED DELETION TRIGGERS (CUSTOM MODAL CONFIRMATION)
  // ----------------------------------------------------
  const handleDeleteLocationTrigger = (id: string) => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    setConfirmDelete({
      type: 'location',
      id,
      title: 'Excluir Local',
      message: `Tem certeza de que deseja excluir o local "${loc.name}"? Os treinamentos associados a ele continuarão agendados, mas perderão a referência de local.`,
    });
  };

  const handleDeleteInstructorTrigger = (id: string) => {
    const inst = instructors.find((i) => i.id === id);
    if (!inst) return;
    setConfirmDelete({
      type: 'instructor',
      id,
      title: 'Excluir Instrutor',
      message: `Tem certeza de que deseja excluir o instrutor "${inst.name}"? Isso não removerá os treinamentos, mas eles perderão o vínculo.`,
    });
  };

  const handleDeleteTrainingTrigger = (id: string) => {
    const t = trainings.find((tr) => tr.id === id);
    if (!t) return;
    setConfirmDelete({
      type: 'training',
      id,
      title: 'Excluir Treinamento',
      message: `Deseja realmente excluir permanentemente o treinamento "${t.title}" do cronograma?`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);

    if (type === 'location') {
      await handleDeleteLocation(id);
    } else if (type === 'instructor') {
      await handleDeleteInstructor(id);
    } else if (type === 'training') {
      await handleDeleteTraining(id);
    }
  };

  const handleDuplicateTraining = async (training: Training) => {
    const duplicated: Training = {
      ...training,
      id: `t-${Date.now()}`,
      title: `${training.title} (Cópia)`,
    };
    const updated = [...trainings, duplicated];
    setTrainings(updated);

    try {
      await dbSaveTraining(duplicated);
      triggerToast(`Treinamento "${training.title}" duplicado com sucesso!`);
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao duplicar na nuvem.', 'info');
    }
  };

  // Drag and drop reschedule date
  const handleEventReschedule = async (trainingId: string, newDateStr: string) => {
    const training = trainings.find((t) => t.id === trainingId);
    if (!training) return;

    const [originalStartDate, originalStartTime] = training.startDate.split('T');
    const [originalEndDate, originalEndTime] = training.endDate.split('T');

    const newStartDate = `${newDateStr}T${originalStartTime}`;
    const newEndDate = `${newDateStr}T${originalEndTime}`;

    const updatedTraining: Training = {
      ...training,
      startDate: newStartDate,
      endDate: newEndDate,
    };

    const updated = trainings.map((t) => t.id === trainingId ? updatedTraining : t);
    setTrainings(updated);

    try {
      await dbSaveTraining(updatedTraining);
      const [y, m, d] = newDateStr.split('-');
      triggerToast(`Treinamento "${training.title}" reagendado para ${d}/${m}/${y}!`, 'success');
    } catch (err) {
      triggerToast('Sincronizado localmente. Erro ao reagendar na nuvem.', 'info');
    }
  };

  // ----------------------------------------------------
  // CALENDAR NAVIGATION HELPERS
  // ----------------------------------------------------
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date(2026, 5, 25)); // Set back to June 25, 2026 (our demo pivot date)
      return;
    }

    const offset = direction === 'next' ? 1 : -1;
    const newDate = new Date(currentDate);

    if (calendarView === 'month') {
      newDate.setMonth(currentDate.getMonth() + offset);
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + offset * 7);
    } else {
      newDate.setDate(currentDate.getDate() + offset);
    }
    setCurrentDate(newDate);
  };

  // ----------------------------------------------------
  // FILTER TRIGGERS
  // ----------------------------------------------------
  const handleToggleStatus = (status: TrainingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleToggleInstructor = (id: string) => {
    setSelectedInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleLocation = (id: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  // ----------------------------------------------------
  // COMPUTE FILTERED EVENTS FOR THE CALENDAR VIEWS
  // ----------------------------------------------------
  const getFilteredCalendarEvents = () => {
    return trainings.filter((t) => {
      // 1. Filter by search query
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Filter by statuses selected (My Calendars)
      const matchesStatus = selectedStatuses.includes(t.status);

      // 3. Filter by instructors if any selected
      const matchesInstructor = selectedInstructorIds.length === 0 || selectedInstructorIds.includes(t.instructorId);

      // 4. Filter by locations if any selected
      const matchesLocation = selectedLocationIds.length === 0 || selectedLocationIds.includes(t.locationId);

      return matchesSearch && matchesStatus && matchesInstructor && matchesLocation;
    });
  };

  const filteredEventsForCalendar = getFilteredCalendarEvents();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100">
      
      {/* 🚀 Sleek Portal Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-100 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight text-slate-900 leading-none">
              Portal de Treinamento - Proeng
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
              Plataforma Corporativa
            </span>
          </div>
        </div>

        {/* Tab selector */}
        <nav className="flex items-center rounded-xl bg-slate-100/80 p-1 border border-slate-100 shadow-inner">
          <button
            id="tab-calendario"
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calendario'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            Agenda Calendário
          </button>
          
          <button
            id="tab-treinamentos"
            onClick={() => setActiveTab('treinamentos')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'treinamentos'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Lista Geral
          </button>

          <button
            id="tab-instrutores"
            onClick={() => setActiveTab('instrutores')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'instrutores'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Instrutores
          </button>

          <button
            id="tab-locais"
            onClick={() => setActiveTab('locais')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'locais'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-100/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Locais
          </button>
        </nav>

        {/* Right Info: local cache indicator + Reset Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            id="reset-demo-btn"
            onClick={resetToSeeds}
            title="Redefinir para dados do exemplo"
            className="flex items-center gap-1.5 text-2xs font-extrabold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Redefinir Exemplo
          </button>

          {isSupabaseConfigured ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100 text-[10px] font-bold text-blue-800 shadow-sm shadow-blue-50 select-none" title="Conectado com sucesso ao banco de dados Supabase na nuvem!">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <Database className="h-3.5 w-3.5 text-blue-600" />
              Supabase Nuvem
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100 text-[10px] font-bold text-amber-800 shadow-sm shadow-amber-50 select-none" title="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env ou no painel do projeto para habilitar persistência automática na nuvem!">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <Database className="h-3.5 w-3.5 text-amber-600" />
              Sem Banco (Local)
            </div>
          )}
        </div>
      </header>

      {/* 🚀 Tab View Routing */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'calendario' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] w-full mx-auto">
            {/* Sidebar workspace */}
            {isSidebarOpen && (
              <Sidebar
                selectedDate={currentDate}
                onDateSelect={setCurrentDate}
                onAddEventClick={() => {
                  setEditingTraining(null);
                  setModalDefaultDate(formatDateString(currentDate));
                  setActiveModal('training');
                }}
                instructors={instructors}
                locations={locations}
                selectedInstructorIds={selectedInstructorIds}
                onToggleInstructor={handleToggleInstructor}
                onClearInstructorFilters={() => setSelectedInstructorIds([])}
                selectedLocationIds={selectedLocationIds}
                onToggleLocation={handleToggleLocation}
                onClearLocationFilters={() => setSelectedLocationIds([])}
              />
            )}

            {/* Main Calendar Body Workspace */}
            <div 
              ref={calendarRef}
              id="calendar-main-container"
              className={`flex-1 flex flex-col bg-white overflow-hidden transition-all ${
                isFullscreen 
                  ? 'p-4 bg-white rounded-none border-none w-full h-full' 
                  : 'rounded-xl border border-slate-200 shadow-sm'
              }`}
            >
              <CalendarHeader
                currentDate={currentDate}
                onNavigate={handleNavigate}
                view={calendarView}
                onViewChange={setCalendarView}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />

              {/* Dynamic View rendering */}
              <div className="flex-1 flex flex-col">
                {calendarView === 'month' && (
                  <MonthView
                    currentDate={currentDate}
                    trainings={filteredEventsForCalendar}
                    instructors={instructors}
                    locations={locations}
                    onEventClick={(t) => {
                      setEditingTraining(t);
                      setActiveModal('training');
                    }}
                    onEventDrop={handleEventReschedule}
                    onCellClick={(dateStr) => {
                      setEditingTraining(null);
                      setModalDefaultDate(dateStr);
                      setActiveModal('training');
                    }}
                  />
                )}

                {calendarView === 'week' && (
                  <WeekView
                    currentDate={currentDate}
                    trainings={filteredEventsForCalendar}
                    instructors={instructors}
                    locations={locations}
                    onEventClick={(t) => {
                      setEditingTraining(t);
                      setActiveModal('training');
                    }}
                    onEventDrop={handleEventReschedule}
                    onCellClick={(dateStr) => {
                      setEditingTraining(null);
                      setModalDefaultDate(dateStr);
                      setActiveModal('training');
                    }}
                  />
                )}

                {calendarView === 'day' && (
                  <DayView
                    currentDate={currentDate}
                    trainings={filteredEventsForCalendar}
                    instructors={instructors}
                    locations={locations}
                    onEventClick={(t) => {
                      setEditingTraining(t);
                      setActiveModal('training');
                    }}
                    onEventDrop={handleEventReschedule}
                    onCellClick={(dateStr) => {
                      setEditingTraining(null);
                      setModalDefaultDate(dateStr);
                      setActiveModal('training');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instrutores' && (
          <InstructorsManagement
            instructors={instructors}
            trainings={trainings}
            onAddInstructorClick={() => {
              setEditingInstructor(null);
              setActiveModal('instructor');
            }}
            onEditInstructorClick={(inst) => {
              setEditingInstructor(inst);
              setActiveModal('instructor');
            }}
            onDeleteInstructor={handleDeleteInstructorTrigger}
          />
        )}

        {activeTab === 'locais' && (
          <LocationsManagement
            locations={locations}
            trainings={trainings}
            onAddLocationClick={() => {
              setEditingLocation(null);
              setActiveModal('location');
            }}
            onEditLocationClick={(loc) => {
              setEditingLocation(loc);
              setActiveModal('location');
            }}
            onDeleteLocation={handleDeleteLocationTrigger}
          />
        )}

        {activeTab === 'treinamentos' && (
          <TrainingsManagement
            trainings={trainings}
            instructors={instructors}
            locations={locations}
            onAddTrainingClick={() => {
              setEditingTraining(null);
              setModalDefaultDate(formatDateString(currentDate));
              setActiveModal('training');
            }}
            onEditTrainingClick={(t) => {
              setEditingTraining(t);
              setActiveModal('training');
            }}
            onDuplicateTraining={handleDuplicateTraining}
            onDeleteTraining={handleDeleteTrainingTrigger}
          />
        )}
      </main>

      {/* 🚀 MODALS WORKSPACE */}
      
      {/* Instructor Modal */}
      <InstructorModal
        isOpen={activeModal === 'instructor'}
        onClose={() => {
          setActiveModal(null);
          setEditingInstructor(null);
        }}
        onSave={handleSaveInstructor}
        instructor={editingInstructor}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={activeModal === 'location'}
        onClose={() => {
          setActiveModal(null);
          setEditingLocation(null);
        }}
        onSave={handleSaveLocation}
        location={editingLocation}
      />

      {/* Training Modal */}
      <TrainingModal
        isOpen={activeModal === 'training'}
        onClose={() => {
          setActiveModal(null);
          setEditingTraining(null);
          setModalDefaultDate(undefined);
        }}
        onSave={handleSaveTraining}
        training={editingTraining}
        instructors={instructors}
        locations={locations}
        defaultDate={modalDefaultDate}
      />

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.title || ''}
        message={confirmDelete?.message || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        isDestructive={true}
      />

      {/* 🚀 TOAST ALERTS OVERLAY */}
      <div 
        id="toast-overlay"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl shadow-xl shadow-slate-900/10 pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100 flex-shrink-0 animate-in fade-in slide-in-from-bottom-2"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
