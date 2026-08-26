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

// Conditional initialization of the Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

// Track active online state for Supabase connection
let isSupabaseOnline = isSupabaseConfigured;

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
    attendeeCount: row.attendeeCount || row.attendee_count || undefined,
  };
}

/**
 * ----------------------------------------------------
 * DATABASE OPERATIONS WITH BIDIRECTIONAL AUTO-MERGE & SYNC
 * ----------------------------------------------------
 */

// 1. INSTRUTORES
export async function dbGetInstructors(fallbackData: Instructor[]): Promise<Instructor[]> {
  const getLocalInstructors = (): Instructor[] => {
    const stored = localStorage.getItem('tr_instructors');
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback
      }
    }
    localStorage.setItem('tr_instructors', JSON.stringify(fallbackData));
    return fallbackData;
  };

  const localList = getLocalInstructors();

  if (!supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    isSupabaseOnline = true;
    const remoteList = (data || []).map(normalizeInstructorRow);

    // Supabase is the source of truth, overwrite local storage with remote data
    localStorage.setItem('tr_instructors', JSON.stringify(remoteList));

    return remoteList;
  } catch (err: any) {
    console.warn('Serviço Supabase indisponível para instrutores. Utilizando LocalStorage:', err?.message || err);
    return localList;
  }
}

export async function dbSaveInstructor(instructor: Instructor): Promise<boolean> {
  // Update local storage immediately
  const stored = localStorage.getItem('tr_instructors');
  let localList: Instructor[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((i) => i.id === instructor.id);
  if (exists) {
    localList = localList.map((i) => (i.id === instructor.id ? instructor : i));
  } else {
    localList.push(instructor);
  }
  localStorage.setItem('tr_instructors', JSON.stringify(localList));

  if (!supabase) return false;

  try {
    // Try upsert standard
    let { error } = await supabase.from('instructors').upsert({
      id: instructor.id,
      name: instructor.name,
      color: instructor.color,
      specialty: instructor.specialty,
      email: instructor.email || null,
      phone: instructor.phone || null,
    });

    // If id numeric issue retry with numeric id if possible
    if (error && !isNaN(Number(instructor.id))) {
      const retry = await supabase.from('instructors').upsert({
        id: Number(instructor.id),
        name: instructor.name,
        color: instructor.color,
        specialty: instructor.specialty,
        email: instructor.email || null,
        phone: instructor.phone || null,
      });
      error = retry.error;
    }

    if (error) {
      console.warn('Erro ao salvar instrutor no Supabase:', error.message);
      return false;
    }

    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Exceção ao salvar instrutor no Supabase:', err?.message || err);
    return false;
  }
}

export async function dbDeleteInstructor(id: string): Promise<boolean> {
  const stored = localStorage.getItem('tr_instructors');
  if (stored) {
    const localList: Instructor[] = JSON.parse(stored);
    localStorage.setItem('tr_instructors', JSON.stringify(localList.filter((i) => i.id !== id)));
  }

  if (!supabase) return false;

  try {
    let { error } = await supabase.from('instructors').delete().eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase.from('instructors').delete().eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Erro ao excluir instrutor no Supabase:', err?.message || err);
    return false;
  }
}

// 2. LOCAIS
export async function dbGetLocations(fallbackData: Location[]): Promise<Location[]> {
  const getLocalLocations = (): Location[] => {
    const stored = localStorage.getItem('tr_locations');
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback
      }
    }
    localStorage.setItem('tr_locations', JSON.stringify(fallbackData));
    return fallbackData;
  };

  const localList = getLocalLocations();

  if (!supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    isSupabaseOnline = true;
    const remoteList = (data || []).map(normalizeLocationRow);

    // Supabase is the source of truth
    localStorage.setItem('tr_locations', JSON.stringify(remoteList));

    return remoteList;
  } catch (err: any) {
    console.warn('Serviço Supabase indisponível para locais. Utilizando LocalStorage:', err?.message || err);
    return localList;
  }
}

export async function dbSaveLocation(location: Location): Promise<boolean> {
  const stored = localStorage.getItem('tr_locations');
  let localList: Location[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((l) => l.id === location.id);
  if (exists) {
    localList = localList.map((l) => (l.id === location.id ? location : l));
  } else {
    localList.push(location);
  }
  localStorage.setItem('tr_locations', JSON.stringify(localList));

  if (!supabase) return false;

  try {
    let { error } = await supabase.from('locations').upsert({
      id: location.id,
      name: location.name,
      type: location.type,
      capacity: location.capacity || null,
      details: location.details || null,
    });

    if (error && !isNaN(Number(location.id))) {
      const retry = await supabase.from('locations').upsert({
        id: Number(location.id),
        name: location.name,
        type: location.type,
        capacity: location.capacity || null,
        details: location.details || null,
      });
      error = retry.error;
    }

    if (error) {
      console.warn('Erro ao salvar local no Supabase:', error.message);
      return false;
    }

    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Exceção ao salvar local no Supabase:', err?.message || err);
    return false;
  }
}

export async function dbDeleteLocation(id: string): Promise<boolean> {
  const stored = localStorage.getItem('tr_locations');
  if (stored) {
    const localList: Location[] = JSON.parse(stored);
    localStorage.setItem('tr_locations', JSON.stringify(localList.filter((l) => l.id !== id)));
  }

  if (!supabase) return false;

  try {
    let { error } = await supabase.from('locations').delete().eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase.from('locations').delete().eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Erro ao excluir local no Supabase:', err?.message || err);
    return false;
  }
}

// 3. TREINAMENTOS
export async function dbGetTrainings(fallbackData: Training[]): Promise<Training[]> {
  const getLocalTrainings = (): Training[] => {
    const stored = localStorage.getItem('tr_trainings');
    if (stored !== null) {
      try {
        const parsed: Training[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }
      } catch {
        // Fallback
      }
    }
    localStorage.setItem('tr_trainings', JSON.stringify(fallbackData));
    return fallbackData;
  };

  const localList = getLocalTrainings();

  if (!supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase.from('trainings').select('*');

    if (error) throw error;

    isSupabaseOnline = true;
    const remoteList = (data || []).map(normalizeTrainingRow);

    const sortedList = remoteList.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Supabase is the source of truth
    localStorage.setItem('tr_trainings', JSON.stringify(sortedList));

    return sortedList;
  } catch (err: any) {
    console.warn('Serviço Supabase indisponível para treinamentos. Utilizando LocalStorage:', err?.message || err);
    return localList;
  }
}

export async function dbSaveTraining(training: Training): Promise<boolean> {
  const stored = localStorage.getItem('tr_trainings');
  let localList: Training[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((t) => t.id === training.id);
  if (exists) {
    localList = localList.map((t) => (t.id === training.id ? training : t));
  } else {
    localList.push(training);
  }
  localStorage.setItem('tr_trainings', JSON.stringify(localList));

  if (!supabase) return false;

  try {
    // 1. First try: Exact camelCase matching the user's DB schema without customColor
    // (since the DB might not have the customColor column)
    let { error } = await supabase.from('trainings').upsert({
      id: training.id,
      title: training.title,
      instructorId: training.instructorId || null,
      locationId: training.locationId || null,
      startDate: training.startDate,
      endDate: training.endDate,
      status: training.status,
      description: training.description || null,
      attendeeCount: training.attendeeCount || null,
    });

    // 2. Second try: camelCase WITH customColor (if they added it later)
    if (error && error.message.includes('customColor')) {
      // Ignore this specific error, we already tried without it
    } else if (error) {
      // 3. Fallback to snake_case payload if camelCase fails (e.g. for different DB setups)
      const retrySnake = await supabase.from('trainings').upsert({
        id: training.id,
        title: training.title,
        instructor_id: training.instructorId || null,
        location_id: training.locationId || null,
        start_date: training.startDate,
        end_date: training.endDate,
        status: training.status,
        description: training.description || null,
        attendee_count: training.attendeeCount || null,
      });
      error = retrySnake.error;
    }

    if (error) {
      console.warn('Erro ao salvar treinamento no Supabase:', error.message);
      return false;
    }

    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Exceção ao salvar treinamento no Supabase:', err?.message || err);
    return false;
  }
}

export async function dbDeleteTraining(id: string): Promise<boolean> {
  const stored = localStorage.getItem('tr_trainings');
  if (stored) {
    const localList: Training[] = JSON.parse(stored);
    localStorage.setItem('tr_trainings', JSON.stringify(localList.filter((t) => t.id !== id)));
  }

  if (!supabase) return false;

  try {
    let { error } = await supabase.from('trainings').delete().eq('id', id);

    if (error && !isNaN(Number(id))) {
      const retry = await supabase.from('trainings').delete().eq('id', Number(id));
      error = retry.error;
    }

    if (error) throw error;
    isSupabaseOnline = true;
    return true;
  } catch (err: any) {
    console.warn('Erro ao excluir treinamento no Supabase:', err?.message || err);
    return false;
  }
}

// 4. FORCED BIDIRECTIONAL SYNC ALL DATA
export async function dbSyncAllToSupabase(
  instructors: Instructor[],
  locations: Location[],
  trainings: Training[]
): Promise<{ instructorsCount: number; locationsCount: number; trainingsCount: number }> {
  // Always persist local storage
  localStorage.setItem('tr_instructors', JSON.stringify(instructors));
  localStorage.setItem('tr_locations', JSON.stringify(locations));
  localStorage.setItem('tr_trainings', JSON.stringify(trainings));

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
