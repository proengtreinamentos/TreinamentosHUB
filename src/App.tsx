/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Instructor, Location, Training, TrainingStatus } from './types';
import { 
  INITIAL_INSTRUCTORS, 
  INITIAL_LOCATIONS, 
  INITIAL_TRAININGS 
} from './data/seeds';
import { formatDateString } from './utils/dateUtils';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import {
  supabase,
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
import MainSidebar, { TabType } from './components/MainSidebar';
import InteractiveCalendarView from './components/InteractiveCalendarView';

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
  RefreshCw,
  Menu
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>('interativo');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Sidebar visibility toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Collapsed state for desktop main sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('tr_sidebar_collapsed');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('tr_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  
  // Calendar-specific active date (Defaults to current date/month)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');

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
    type: 'instructor' | 'location' | 'training' | 'bulk_trainings';
    id: string;
    title: string;
    message: string;
  } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 1. Fetch data logic (Extracted for manual sync)
  const loadAllData = async (isManualSync = false, showToast = true) => {
    try {
      const dbInstructors = await dbGetInstructors(INITIAL_INSTRUCTORS);
      
      // Map exact colors from image by instructor name
      const rawFiltered = dbInstructors;

      // Deduplicate strictly by normalized instructor name
      const uniqueNameMap = new Map<string, Instructor>();
      rawFiltered.forEach((inst) => {
        const normName = inst.name.trim().toLowerCase();
        if (!uniqueNameMap.has(normName)) {
          uniqueNameMap.set(normName, inst);
        }
      });

      const updatedInstructors = Array.from(uniqueNameMap.values());

      setInstructors(updatedInstructors);
      localStorage.setItem('tr_instructors', JSON.stringify(updatedInstructors));

      const dbLocations = await dbGetLocations(INITIAL_LOCATIONS);
      setLocations(dbLocations);

      const dbTrainings = await dbGetTrainings(INITIAL_TRAININGS);
      setTrainings(dbTrainings);
      
      if (getStorageMode() === 'supabase') {
        if (!isManualSync && showToast) {
          triggerToast('Conectado ao banco de dados Supabase com sucesso!', 'success');
        } else if (showToast) {
          triggerToast('Sincronização 100% concluída: Dados atualizados.', 'success');
        }
      } else if (isManualSync && showToast) {
        triggerToast('Sincronização local efetuada!', 'info');
      }
    } catch (err) {
      console.warn('Erro ou indisponibilidade ao carregar dados remotos:', err);
      if (showToast) triggerToast('Dados carregados no modo de armazenamento local.', 'info');
    } finally {
      setIsDataLoaded(true);
    }
  };

  // Initial Load from Supabase (with LocalStorage fallback) or Seeds
  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time synchronization with Supabase
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    // Subscribe to all changes in the public schema
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          // Softly reload data without displaying toast notification to prevent spamming
          loadAllData(true, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Toast system
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Full database sync function
  const handleSyncAll = async () => {
    triggerToast('Baixando dados mais recentes da nuvem...', 'info');
    await loadAllData(true);
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
    localStorage.setItem('tr_instructors', JSON.stringify(updated));

    const isSavedOnSupabase = await dbSaveInstructor(instructorToSave);
    if (isSavedOnSupabase) {
      triggerToast(`Instrutor "${data.name}" salvo no Supabase com sucesso!`, 'success');
    } else {
      triggerToast(`Instrutor "${data.name}" salvo apenas localmente. O Supabase está offline ou indisponível.`, 'info');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    const updated = instructors.filter((i) => i.id !== id);
    setInstructors(updated);
    localStorage.setItem('tr_instructors', JSON.stringify(updated));
    
    const updatedTrainings = trainings.map((t) => t.instructorId === id ? { ...t, instructorId: '' } : t);
    setTrainings(updatedTrainings);
    localStorage.setItem('tr_trainings', JSON.stringify(updatedTrainings));

    // 1. Desvincular treinamentos primeiro no banco para evitar erro de FK (Foreign Key)
    const affectedTrainings = trainings.filter((t) => t.instructorId === id);
    for (const t of affectedTrainings) {
      await dbSaveTraining({ ...t, instructorId: '' });
    }
    // 2. Só então excluir o instrutor
    const isDeletedOnSupabase = await dbDeleteInstructor(id);
    if (isDeletedOnSupabase) {
      triggerToast('Instrutor removido e treinamentos desvinculados no Supabase.', 'success');
    } else {
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
    localStorage.setItem('tr_locations', JSON.stringify(updated));

    const isSavedOnSupabase = await dbSaveLocation(locationToSave);
    if (isSavedOnSupabase) {
      triggerToast(`Local "${data.name}" salvo no Supabase com sucesso!`, 'success');
    } else {
      triggerToast(`Local "${data.name}" salvo apenas localmente. O Supabase está offline ou indisponível.`, 'info');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const updated = locations.filter((l) => l.id !== id);
    setLocations(updated);
    localStorage.setItem('tr_locations', JSON.stringify(updated));

    const updatedTrainings = trainings.map((t) => t.locationId === id ? { ...t, locationId: '' } : t);
    setTrainings(updatedTrainings);
    localStorage.setItem('tr_trainings', JSON.stringify(updatedTrainings));

    // 1. Desvincular treinamentos primeiro no banco para evitar erro de FK (Foreign Key)
    const affectedTrainings = trainings.filter((t) => t.locationId === id);
    for (const t of affectedTrainings) {
      await dbSaveTraining({ ...t, locationId: '' });
    }
    // 2. Só então excluir o local
    const isDeletedOnSupabase = await dbDeleteLocation(id);
    if (isDeletedOnSupabase) {
      triggerToast('Local removido e treinamentos desvinculados no Supabase.', 'success');
    } else {
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
    localStorage.setItem('tr_trainings', JSON.stringify(updated));

    const isSavedOnSupabase = await dbSaveTraining(trainingToSave);
    if (isSavedOnSupabase) {
      triggerToast(`Treinamento "${data.title}" salvo no Supabase com sucesso!`, 'success');
    } else {
      triggerToast(`Treinamento "${data.title}" salvo apenas localmente. O Supabase está offline ou indisponível.`, 'info');
    }
  };

  const handleDeleteTraining = async (id: string) => {
    const updated = trainings.filter((t) => t.id !== id);
    setTrainings(updated);
    localStorage.setItem('tr_trainings', JSON.stringify(updated));

    const isDeletedOnSupabase = await dbDeleteTraining(id);
    if (isDeletedOnSupabase) {
      triggerToast('Treinamento excluído no Supabase com sucesso.', 'success');
    } else {
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

  const handleBulkDeleteTrainings = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmDelete({
      type: 'bulk_trainings',
      id: ids.join(','),
      title: 'Excluir Treinamentos Selecionados',
      message: `Tem certeza de que deseja excluir permanentemente os ${ids.length} treinamentos selecionados do cronograma? Esta ação não poderá ser desfeita.`,
    });
  };

  const handleBulkUpdateStatusTrainings = async (ids: string[], newStatus: TrainingStatus) => {
    if (ids.length === 0) return;
    const idsSet = new Set(ids);
    const updated = trainings.map((t) => (idsSet.has(t.id) ? { ...t, status: newStatus } : t));
    setTrainings(updated);
    localStorage.setItem('tr_trainings', JSON.stringify(updated));

    let allSaved = true;
    for (const tId of ids) {
      const target = updated.find((t) => t.id === tId);
      if (target) {
        const ok = await dbSaveTraining(target);
        if (!ok) allSaved = false;
      }
    }
    
    if (allSaved) {
      triggerToast(`Status de ${ids.length} treinamentos alterado com sucesso no Supabase!`, 'success');
    } else {
      triggerToast('Status alterado apenas localmente. Ocorreram erros na nuvem.', 'info');
    }
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
    } else if (type === 'bulk_trainings') {
      const ids = id.split(',');
      const idsSet = new Set(ids);
      const updated = trainings.filter((t) => !idsSet.has(t.id));
      setTrainings(updated);
      localStorage.setItem('tr_trainings', JSON.stringify(updated));

      let allDeleted = true;
      for (const tId of ids) {
        const ok = await dbDeleteTraining(tId);
        if (!ok) allDeleted = false;
      }
      
      if (allDeleted) {
        triggerToast(`${ids.length} treinamentos excluídos no Supabase com sucesso.`, 'success');
      } else {
        triggerToast('Sincronizado localmente. Ocorreram erros ao excluir na nuvem.', 'info');
      }
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

    const isSavedOnSupabase = await dbSaveTraining(duplicated);
    if (isSavedOnSupabase) {
      triggerToast(`Treinamento "${training.title}" duplicado no Supabase com sucesso!`, 'success');
    } else {
      triggerToast(`Treinamento "${training.title}" duplicado apenas localmente.`, 'info');
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

    const isSavedOnSupabase = await dbSaveTraining(updatedTraining);
    const [y, m, d] = newDateStr.split('-');
    if (isSavedOnSupabase) {
      triggerToast(`Treinamento "${training.title}" reagendado para ${d}/${m}/${y} no Supabase!`, 'success');
    } else {
      triggerToast(`Treinamento "${training.title}" reagendado apenas localmente.`, 'info');
    }
  };

  // ----------------------------------------------------
  // CALENDAR NAVIGATION HELPERS
  // ----------------------------------------------------
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const offset = direction === 'next' ? 1 : -1;
    const newDate = new Date(currentDate);

    if (calendarView === 'month') {
      newDate.setDate(1); // Set to 1st to prevent month skipping
      newDate.setMonth(currentDate.getMonth() + offset);
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + offset * 7);
    } else {
      newDate.setDate(currentDate.getDate() + offset);
    }
    React.startTransition(() => { setCurrentDate(newDate); });
  };

  // ----------------------------------------------------
  // FILTER TRIGGERS
  // ----------------------------------------------------
  const handleToggleStatus = (status: TrainingStatus) => {
    React.startTransition(() => {
      setSelectedStatuses((prev) =>
        prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
      );
    });
  };

  const handleToggleInstructor = (id: string) => {
    React.startTransition(() => {
      setSelectedInstructorIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    });
  };

  const handleToggleLocation = (id: string) => {
    React.startTransition(() => {
      setSelectedLocationIds((prev) =>
        prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
      );
    });
  };

  // ----------------------------------------------------
  // COMPUTE FILTERED EVENTS FOR THE CALENDAR VIEWS
  // ----------------------------------------------------
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const filteredEventsForCalendar = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    return trainings.filter((t) => {
      // 1. Filter by search query
      const matchesSearch = !query || t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
      
      // 2. Filter by statuses selected (My Calendars)
      const matchesStatus = selectedStatuses.includes(t.status);

      // 3. Filter by instructors if any selected
      const matchesInstructor = selectedInstructorIds.length === 0 || selectedInstructorIds.includes(t.instructorId);

      // 4. Filter by locations if any selected
      const matchesLocation = selectedLocationIds.length === 0 || selectedLocationIds.includes(t.locationId);

      return matchesSearch && matchesStatus && matchesInstructor && matchesLocation;
    });
  }, [trainings, deferredSearchQuery, selectedStatuses, selectedInstructorIds, selectedLocationIds]);

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-blue-100">
      
      {/* 🚀 Main Left Sidebar Navigation */}
      <MainSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSupabaseConfigured={isSupabaseConfigured}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onSyncRequested={handleSyncAll}
      />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        
        {/* Mobile Top Header with Hamburger Menu Toggle */}
        <header className="md:hidden sticky top-0 z-30 bg-[#001130] text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Abrir Menu Lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1">
              <span className="text-xl font-black italic tracking-tighter text-white">
                PRO<span className="text-red-600">ENG</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-black uppercase text-red-500 tracking-wider">
              {activeTab === 'interativo' && 'Calendário Interativo'}
              {activeTab === 'treinamentos' && 'Lista de Treinamentos'}
              {activeTab === 'instrutores' && 'Instrutores'}
              {activeTab === 'locais' && 'Locais'}
            </p>
          </div>
        </header>

        {/* 🚀 Tab View Routing */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'interativo' && (
            <InteractiveCalendarView
              currentDate={currentDate}
              onNavigate={handleNavigate}
              trainings={trainings}
              instructors={instructors}
              locations={locations}
              onSyncRequested={handleSyncAll}
              viewMode={calendarView === 'week' ? 'week' : 'month'}
              onViewModeChange={(mode) => setCalendarView(mode)}
              onOpenAddModal={(date) => {
                setEditingTraining(null);
                setModalDefaultDate(date);
                setActiveModal('training');
              }}
              onOpenEditModal={(training) => {
                setEditingTraining(training);
                setActiveModal('training');
              }}
            />
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
            onBulkDeleteTrainings={handleBulkDeleteTrainings}
            onBulkUpdateStatusTrainings={handleBulkUpdateStatusTrainings}
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            trainings={trainings}
            instructors={instructors}
            locations={locations}
          />
        )}

        {activeTab === 'relatorios' && (
          <Reports
            trainings={trainings}
            instructors={instructors}
            locations={locations}
          />
        )}
      </main>
    </div>

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
        onDelete={(id) => handleDeleteTrainingTrigger(id)}
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
