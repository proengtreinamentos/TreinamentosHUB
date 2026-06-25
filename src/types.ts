/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LocationType = 'interno' | 'externo' | 'sala';
export type TrainingStatus = 'confirmado' | 'aguardando' | 'cancelado';

export interface Instructor {
  id: string;
  name: string;
  color: string; // Hex color code
  specialty: string;
  email?: string;
  phone?: string;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  capacity?: number;
  details?: string; // Room number, link, or physical address
}

export interface Training {
  id: string;
  title: string;
  instructorId: string;
  locationId: string;
  startDate: string; // ISO format: YYYY-MM-DDTHH:MM
  endDate: string;   // ISO format: YYYY-MM-DDTHH:MM
  status: TrainingStatus;
  description?: string;
}
