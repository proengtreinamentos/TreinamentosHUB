/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatDateString, formatTimeString, formatFullDay } from '../utils/dateUtils';
import { Training, Instructor, Location } from '../types';
import { MapPin, Clock, User, AlignLeft, Info } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onEventClick: (training: Training) => void;
  onEventDrop: (trainingId: string, newDateStr: string) => void;
  onCellClick: (dateStr: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 to 19:00
const ROW_HEIGHT = 80; // slightly taller for single day details

export default function DayView({
  currentDate,
  trainings,
  instructors,
  locations,
  onEventClick,
  onEventDrop,
  onCellClick,
}: DayViewProps) {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const dateStr = formatDateString(currentDate);
  const todayStr = formatDateString(new Date());
  const isToday = dateStr === todayStr;

  const instructorsMap = new Map(instructors.map((i) => [i.id, i]));
  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  // Filter events for this day
  const dayTrainings = trainings.filter((t) => t.startDate.startsWith(dateStr));

  // Calculate top offset and height
  const getEventPosition = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const top = Math.max(0, (startHour - 7) * ROW_HEIGHT);
    const height = Math.max(45, (endHour - startHour) * ROW_HEIGHT);

    return { top, height };
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEventId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain') || draggedEventId;
    if (eventId) {
      onEventDrop(eventId, dateStr);
    }
    setDraggedEventId(null);
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden min-h-[500px]">
      {/* Day Header */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between select-none shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">
            {formatFullDay(currentDate)}
          </h3>
        </div>
        {isToday && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Hoje
          </span>
        )}
      </div>

      {/* Grid container with hours and lanes */}
      <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin flex relative">
        
        {/* Hour Axis on Left */}
        <div className="w-[15%] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 select-none">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: ROW_HEIGHT }}
              className="pr-4 text-right text-xs font-semibold text-slate-400 flex items-start pt-2 justify-end"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 1 Day Lane */}
        <div
          id="day-lane-container"
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCellClick(dateStr);
            }
          }}
          style={{ height: HOURS.length * ROW_HEIGHT }}
          className={`flex-1 relative divide-y divide-slate-100 transition-colors ${
            isDragOver ? 'bg-blue-50/30' : 'bg-white'
          }`}
        >
          {/* Grid lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: ROW_HEIGHT }}
              className="border-b border-slate-100 w-full pointer-events-none"
            />
          ))}

          {/* Events Overlay */}
          {dayTrainings.map((training) => {
            const instructor = instructorsMap.get(training.instructorId);
            const location = locationsMap.get(training.locationId);
            const instColor = instructor?.color || '#3b82f6';
            const isCanceled = training.status === 'cancelado';
            const isWaiting = training.status === 'aguardando';

            const { top, height } = getEventPosition(training.startDate, training.endDate);

            return (
              <div
                key={training.id}
                id={`day-event-card-${training.id}`}
                draggable={training.status !== 'cancelado'}
                onDragStart={(e) => handleDragStart(e, training.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(training);
                }}
                style={{
                  top: `${top + 2}px`,
                  height: `${height - 4}px`,
                  backgroundColor: isCanceled ? '#f8fafc' : `${instColor}12`,
                  borderLeftColor: isCanceled ? undefined : instColor,
                  color: isCanceled ? '#64748b' : instructor?.color,
                }}
                className={`absolute left-3 right-3 rounded-lg border-l-4 px-4 py-3 shadow-sm hover:shadow-md hover:translate-x-0.5 cursor-grab active:cursor-grabbing transition-all overflow-hidden flex flex-col justify-between ${
                  isCanceled
                    ? 'border-slate-300 border-dashed border-y border-r'
                    : 'border-solid border-y border-r border-slate-100'
                }`}
              >
                <div>
                  {/* Time badge + status */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatTimeString(training.startDate)} - {formatTimeString(training.endDate)}
                    </span>
                    
                    {/* Status indicator */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${
                      isCanceled
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : isWaiting
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        isCanceled ? 'bg-rose-500' : isWaiting ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {training.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={`text-sm font-extrabold tracking-tight ${
                    isCanceled ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {training.title}
                  </h4>

                  {/* Description if fit */}
                  {training.description && height > 100 && (
                    <p className="text-2xs text-slate-500 mt-1.5 line-clamp-2 max-w-xl select-none flex items-start gap-1">
                      <AlignLeft className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{training.description}</span>
                    </p>
                  )}
                </div>

                {/* Footer details: Instructor and Location info side-by-side */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100/60 pt-1.5 mt-1.5 text-2xs">
                  {instructor && (
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Instrutor: {instructor.name}</span>
                      <span className="text-3xs text-slate-400 font-medium font-mono">({instructor.specialty})</span>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-center gap-1 font-semibold text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Local: {location.name}</span>
                      {location.details && (
                        <span className="text-3xs text-slate-400 font-medium">({location.details})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple fallback icon wrapper
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
