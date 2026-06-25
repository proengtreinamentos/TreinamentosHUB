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
  if (cleaned.endsWith('/rest/v1/')) {
    cleaned = cleaned.slice(0, -9);
  } else if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -8);
  }
  // Strip trailing slashes too just to be extra clean
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

const supabaseUrl = getCleanSupabaseUrl(rawSupabaseUrl);

// Check if Supabase credentials are provided
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Lazy/Conditional initialization of the Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey)
  : null;

// Helper to check if we are using the live Supabase database or LocalStorage fallback
export function getStorageMode(): 'supabase' | 'local' {
  return isSupabaseConfigured ? 'supabase' : 'local';
}

/**
 * ----------------------------------------------------
 * DATABASE OPERATIONS WITH AUTO-FALLBACK TO LOCAL STORAGE
 * ----------------------------------------------------
 */

// 1. INSTRUTORES
export async function dbGetInstructors(fallbackData: Instructor[]): Promise<Instructor[]> {
  if (!supabase) {
    const stored = localStorage.getItem('tr_instructors');
    return stored ? JSON.parse(stored) : fallbackData;
  }

  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Instructor[];
  } catch (err) {
    console.error('Erro ao buscar instrutores no Supabase, usando LocalStorage:', err);
    const stored = localStorage.getItem('tr_instructors');
    return stored ? JSON.parse(stored) : fallbackData;
  }
}

export async function dbSaveInstructor(instructor: Instructor): Promise<void> {
  // Sync to localstorage first for safety
  const stored = localStorage.getItem('tr_instructors');
  let localList: Instructor[] = stored ? JSON.parse(stored) : [];
  const exists = localList.some((i) => i.id === instructor.id);
  if (exists) {
    localList = localList.map((i) => (i.id === instructor.id ? instructor : i));
  } else {
    localList.push(instructor);
  }
  localStorage.setItem('tr_instructors', JSON.stringify(localList));

  if (!supabase) return;

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
  } catch (err) {
    console.error('Erro ao salvar instrutor no Supabase:', err);
    throw err;
  }
}

export async function dbDeleteInstructor(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_instructors');
  if (stored) {
    const localList: Instructor[] = JSON.parse(stored);
    localStorage.setItem('tr_instructors', JSON.stringify(localList.filter((i) => i.id !== id)));
  }

  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('instructors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Erro ao excluir instrutor no Supabase:', err);
    throw err;
  }
}

// 2. LOCAIS
export async function dbGetLocations(fallbackData: Location[]): Promise<Location[]> {
  if (!supabase) {
    const stored = localStorage.getItem('tr_locations');
    return stored ? JSON.parse(stored) : fallbackData;
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Location[];
  } catch (err) {
    console.error('Erro ao buscar locais no Supabase, usando LocalStorage:', err);
    const stored = localStorage.getItem('tr_locations');
    return stored ? JSON.parse(stored) : fallbackData;
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

  if (!supabase) return;

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
  } catch (err) {
    console.error('Erro ao salvar local no Supabase:', err);
    throw err;
  }
}

export async function dbDeleteLocation(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_locations');
  if (stored) {
    const localList: Location[] = JSON.parse(stored);
    localStorage.setItem('tr_locations', JSON.stringify(localList.filter((l) => l.id !== id)));
  }

  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Erro ao excluir local no Supabase:', err);
    throw err;
  }
}

// 3. TREINAMENTOS
export async function dbGetTrainings(fallbackData: Training[]): Promise<Training[]> {
  if (!supabase) {
    const stored = localStorage.getItem('tr_trainings');
    return stored ? JSON.parse(stored) : fallbackData;
  }

  try {
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .order('startDate', { ascending: true });

    if (error) throw error;
    
    // Map column names if they are different, but we'll create columns matching React object properties
    return data as Training[];
  } catch (err) {
    console.error('Erro ao buscar treinamentos no Supabase, usando LocalStorage:', err);
    const stored = localStorage.getItem('tr_trainings');
    return stored ? JSON.parse(stored) : fallbackData;
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

  if (!supabase) return;

  try {
    const { error } = await supabase
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
      });

    if (error) throw error;
  } catch (err) {
    console.error('Erro ao salvar treinamento no Supabase:', err);
    throw err;
  }
}

export async function dbDeleteTraining(id: string): Promise<void> {
  const stored = localStorage.getItem('tr_trainings');
  if (stored) {
    const localList: Training[] = JSON.parse(stored);
    localStorage.setItem('tr_trainings', JSON.stringify(localList.filter((t) => t.id !== id)));
  }

  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Erro ao excluir treinamento no Supabase:', err);
    throw err;
  }
}
