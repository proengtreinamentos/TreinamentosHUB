/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Instructor, Location, Training } from '../types';

// Read environment variables (Vite-style)
const rawSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Clean up Supabase URL if it contains /rest/v1 suffix to avoid double pathing issues
const getCleanSupabaseUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  let cleaned = url.trim();
  if (!cleaned || cleaned === 'undefined' || cleaned === 'null') return undefined;
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.slice(0, -9);
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -8);
  }
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return cleaned;
  } catch {
    return undefined;
  }
};

const supabaseUrl = getCleanSupabaseUrl(rawSupabaseUrl);

// Check if Supabase credentials are provided and non-empty
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && String(supabaseAnonKey).trim().length > 10);

// Lazy/Conditional initialization of the Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey)
  : null;

// Track active online state for Supabase connection
let isSupabaseOnline = isSupabaseConfigured;

// Helper to check if we are using the live Supabase database or LocalStorage fallback
export function getStorageMode(): 'supabase' | 'local' {
  return isSupabaseConfigured && isSupabaseOnline ? 'supabase' : 'local';
}

/**
 * Normalization helpers to handle both camelCase and snake_case database columns
 */
function normalizeInstructorRow(row: any): Instructor {
  return {
    id: String(row.id),
    name: row.name || '',
    color: row.color || '#0b41cd',
    specialty: row.specialty || '',
    email: row.email || undefined,
    phone: row.phone || undefined,
  };
}

function normalizeLocationRow(row: any): Location {
  return {
    id: String(row.id),
    name: row.name || '',
    type: row.type || 'sala',
    capacity: row.capacity ? Number(row.capacity) : undefined,
    details: row.details || undefined,
  };
}

function normalizeTrainingRow(row: any): Training {
  return {
    id: String(row.id),
    title: row.title || '',
    instructorId: row.instructorId || row.instructor_id || '',
    locationId: row.locationId || row.location_id || '',
    startDate: row.startDate || row.start_date || '',
    endDate: row.endDate || row.end_date || '',
    status: row.status || 'confirmado',
    description: row.description || undefined,
    customColor: row.customColor || row.custom_color || undefined,
  };
}

/**
 * ----------------------------------------------------
 * DATABASE OPERATIONS WITH AUTO-FALLBACK TO LOCAL STORAGE
 * ----------------------------------------------------
 */

// 1. INSTRUTORES
export async function dbGetInstructors(fallbackData: Instructor[]): Promise<Instructor[]> {
  const loadFromLocalStorage = (): Instructor[] => {
    const stored = localStorage.getItem('tr_instructors');
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback if corrupted
      }
    }
    localStorage.setItem('tr_instructors', JSON.stringify(fallbackData));
    localStorage.setItem('tr_initialized', 'true');
    return fallbackData;
  };

  if (!supabase || !isSupabaseOnline) {
    return loadFromLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const normalizedData = (data || []).map(normalizeInstructorRow);

    const isInitialized = localStorage.getItem('tr_initialized') === 'true';
    if (normalizedData.length === 0 && !isInitialized) {
      console.log('Tabela de instrutores no Supabase está vazia. Sincronizando dados iniciais...');
      for (const inst of fallbackData) {
        await dbSaveInstructor(inst);
      }
      localStorage.setItem('tr_initialized', 'true');
      return fallbackData;
    }

    localStorage.setItem('tr_instructors', JSON.stringify(normalizedData));
    localStorage.setItem('tr_initialized', 'true');
    return normalizedData;
  } catch (err: any) {
    console.warn('Serviço Supabase offline ou indisponível. Utilizando LocalStorage:', err?.message || err);
    isSupabaseOnline = false;
    return loadFromLocalStorage();
  }
}

export async function dbSaveInstructor(instructor: Instructor): Promise<void> {
  const stored = localStorage.getItem('tr_instructors');
  let localList: Instructor[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((i) => i.id === instructor.id);
  if (exists) {
    localList = localList.map((i) => (i.id === instructor.id ? instructor : i));
  } else {
    localList.push(instructor);
  }
  localStorage.setItem('tr_instructors', JSON.stringify(localList));

  if (!supabase || !isSupabaseOnline) return;

  try {
    const { error } = await supabase
      .from('instructors')
      .upsert({
        id: instructor.id,
        name: instructor.name,
        color: instructor.color,
        specialty: instructor.specialty,
        email: instructor.email || null,
        phone: instructor.phone || null,
      });

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao salvar instrutor no Supabase, mantido em LocalStorage:', err?.message || err);
  }
}

export async function dbDeleteInstructor(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_instructors');
  if (stored) {
    const localList: Instructor[] = JSON.parse(stored);
    localStorage.setItem('tr_instructors', JSON.stringify(localList.filter((i) => i.id !== id)));
  }

  if (!supabase || !isSupabaseOnline) return;

  try {
    let { error } = await supabase
      .from('instructors')
      .delete()
      .eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase
        .from('instructors')
        .delete()
        .eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao excluir instrutor no Supabase:', err?.message || err);
  }
}

// 2. LOCAIS
export async function dbGetLocations(fallbackData: Location[]): Promise<Location[]> {
  const loadFromLocalStorage = (): Location[] => {
    const stored = localStorage.getItem('tr_locations');
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback if corrupted
      }
    }
    localStorage.setItem('tr_locations', JSON.stringify(fallbackData));
    localStorage.setItem('tr_initialized', 'true');
    return fallbackData;
  };

  if (!supabase || !isSupabaseOnline) {
    return loadFromLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const normalizedData = (data || []).map(normalizeLocationRow);

    const isInitialized = localStorage.getItem('tr_initialized') === 'true';
    if (normalizedData.length === 0 && !isInitialized) {
      console.log('Tabela de locais no Supabase está vazia. Sincronizando dados iniciais...');
      for (const loc of fallbackData) {
        await dbSaveLocation(loc);
      }
      localStorage.setItem('tr_initialized', 'true');
      return fallbackData;
    }

    localStorage.setItem('tr_locations', JSON.stringify(normalizedData));
    localStorage.setItem('tr_initialized', 'true');
    return normalizedData;
  } catch (err: any) {
    console.warn('Serviço Supabase offline ou indisponível. Utilizando LocalStorage:', err?.message || err);
    isSupabaseOnline = false;
    return loadFromLocalStorage();
  }
}

export async function dbSaveLocation(location: Location): Promise<void> {
  const stored = localStorage.getItem('tr_locations');
  let localList: Location[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((l) => l.id === location.id);
  if (exists) {
    localList = localList.map((l) => (l.id === location.id ? location : l));
  } else {
    localList.push(location);
  }
  localStorage.setItem('tr_locations', JSON.stringify(localList));

  if (!supabase || !isSupabaseOnline) return;

  try {
    const { error } = await supabase
      .from('locations')
      .upsert({
        id: location.id,
        name: location.name,
        type: location.type,
        capacity: location.capacity || null,
        details: location.details || null,
      });

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao salvar local no Supabase, mantido em LocalStorage:', err?.message || err);
  }
}

export async function dbDeleteLocation(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_locations');
  if (stored) {
    const localList: Location[] = JSON.parse(stored);
    localStorage.setItem('tr_locations', JSON.stringify(localList.filter((l) => l.id !== id)));
  }

  if (!supabase || !isSupabaseOnline) return;

  try {
    let { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase
        .from('locations')
        .delete()
        .eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao excluir local no Supabase:', err?.message || err);
  }
}

// 3. TREINAMENTOS
export async function dbGetTrainings(fallbackData: Training[]): Promise<Training[]> {
  const loadFromLocalStorage = (): Training[] => {
    const stored = localStorage.getItem('tr_trainings');
    if (stored !== null) {
      try {
        const parsed: Training[] = JSON.parse(stored);
        return parsed.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      } catch {
        // Fallback if corrupted
      }
    }
    localStorage.setItem('tr_trainings', JSON.stringify(fallbackData));
    localStorage.setItem('tr_initialized', 'true');
    return fallbackData;
  };

  if (!supabase || !isSupabaseOnline) {
    return loadFromLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from('trainings')
      .select('*');

    if (error) throw error;

    const normalizedData = (data || []).map(normalizeTrainingRow);

    const isInitialized = localStorage.getItem('tr_initialized') === 'true';
    if (normalizedData.length === 0 && !isInitialized) {
      console.log('Tabela de treinamentos no Supabase está vazia. Sincronizando dados iniciais...');
      for (const tr of fallbackData) {
        await dbSaveTraining(tr);
      }
      localStorage.setItem('tr_initialized', 'true');
      return fallbackData;
    }

    const sortedData = normalizedData.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    localStorage.setItem('tr_trainings', JSON.stringify(sortedData));
    localStorage.setItem('tr_initialized', 'true');
    return sortedData;
  } catch (err: any) {
    console.warn('Serviço Supabase offline ou indisponível. Utilizando LocalStorage:', err?.message || err);
    isSupabaseOnline = false;
    return loadFromLocalStorage();
  }
}

export async function dbSaveTraining(training: Training): Promise<void> {
  const stored = localStorage.getItem('tr_trainings');
  let localList: Training[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((t) => t.id === training.id);
  if (exists) {
    localList = localList.map((t) => (t.id === training.id ? training : t));
  } else {
    localList.push(training);
  }
  localStorage.setItem('tr_trainings', JSON.stringify(localList));

  if (!supabase || !isSupabaseOnline) return;

  try {
    let { error } = await supabase
      .from('trainings')
      .upsert({
        id: training.id,
        title: training.title,
        instructorId: training.instructorId || null,
        locationId: training.locationId || null,
        startDate: training.startDate,
        endDate: training.endDate,
        status: training.status,
        description: training.description || null,
        customColor: training.customColor || null,
      });

    if (error && error.message?.toLowerCase().includes('column')) {
      const retry = await supabase
        .from('trainings')
        .upsert({
          id: training.id,
          title: training.title,
          instructor_id: training.instructorId || null,
          location_id: training.locationId || null,
          start_date: training.startDate,
          end_date: training.endDate,
          status: training.status,
          description: training.description || null,
          custom_color: training.customColor || null,
        });
      error = retry.error;
    }

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao salvar treinamento no Supabase, mantido em LocalStorage:', err?.message || err);
  }
}

export async function dbDeleteTraining(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_trainings');
  if (stored) {
    const localList: Training[] = JSON.parse(stored);
    localStorage.setItem('tr_trainings', JSON.stringify(localList.filter((t) => t.id !== id)));
  }

  if (!supabase || !isSupabaseOnline) return;

  try {
    let { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase
        .from('trainings')
        .delete()
        .eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
  } catch (err: any) {
    console.warn('Erro ao excluir treinamento no Supabase:', err?.message || err);
  }
}

// 4. FORCED BIDIRECTIONAL SYNC FUNCTION
export async function dbSyncAllToSupabase(
  instructors: Instructor[],
  locations: Location[],
  trainings: Training[]
): Promise<{ instructorsCount: number; locationsCount: number; trainingsCount: number }> {
  // 1. Sync localstorage
  localStorage.setItem('tr_instructors', JSON.stringify(instructors));
  localStorage.setItem('tr_locations', JSON.stringify(locations));
  localStorage.setItem('tr_trainings', JSON.stringify(trainings));
  localStorage.setItem('tr_initialized', 'true');

  if (!supabase) {
    return {
      instructorsCount: instructors.length,
      locationsCount: locations.length,
      trainingsCount: trainings.length,
    };
  }

  try {
    for (const inst of instructors) {
      await dbSaveInstructor(inst);
    }
    for (const loc of locations) {
      await dbSaveLocation(loc);
    }
    for (const tr of trainings) {
      await dbSaveTraining(tr);
    }

    // Clean up remote orphan records not present in current frontend state
    const { data: remoteTrainings } = await supabase.from('trainings').select('id');
    if (remoteTrainings) {
      const currentIds = new Set(trainings.map((t) => t.id));
      for (const r of remoteTrainings) {
        if (!currentIds.has(String(r.id))) {
          await supabase.from('trainings').delete().eq('id', r.id);
        }
      }
    }

    const { data: remoteInstructors } = await supabase.from('instructors').select('id');
    if (remoteInstructors) {
      const currentIds = new Set(instructors.map((i) => i.id));
      for (const r of remoteInstructors) {
        if (!currentIds.has(String(r.id))) {
          await supabase.from('instructors').delete().eq('id', r.id);
        }
      }
    }

    const { data: remoteLocations } = await supabase.from('locations').select('id');
    if (remoteLocations) {
      const currentIds = new Set(locations.map((l) => l.id));
      for (const r of remoteLocations) {
        if (!currentIds.has(String(r.id))) {
          await supabase.from('locations').delete().eq('id', r.id);
        }
      }
    }

    isSupabaseOnline = true;
  } catch (err: any) {
    console.warn('Sincronização com Supabase:', err?.message || err);
  }

  return {
    instructorsCount: instructors.length,
    locationsCount: locations.length,
    trainingsCount: trainings.length,
  };
}

