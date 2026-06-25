/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateMonthGrid, formatDateString, WEEKDAYS_PT, formatTimeString } from '../utils/dateUtils';
import { Training, Instructor, Location } from '../types';
import { MapPin, User, AlertCircle } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onEventClick: (training: Training) => void;
  onEventDrop: (trainingId: string, newDateStr: string) => void;
  onCellClick: (dateStr: string) => void;
}

export default function MonthView({
  currentDate,
  trainings,
  instructors,
  locations,
  onEventClick,
  onEventDrop,
  onCellClick,
}: MonthViewProps) {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const grid = generateMonthGrid(year, month);

  // Map instructors and locations by ID for quick O(1) lookups
  const instructorsMap = new Map(instructors.map((i) => [i.id, i]));
  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEventId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Add visual styling for ghost image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedEventId(null);
    setDragOverDate(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain') || draggedEventId;
    if (eventId) {
      onEventDrop(eventId, dateStr);
    }
    setDraggedEventId(null);
    setDragOverDate(null);
  };

  const todayStr = formatDateString(new Date());

  return (
    <div className="flex flex-1 flex-col bg-slate-50 min-h-[500px]">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center text-xs font-semibold text-slate-500 py-2 shadow-sm">
        {WEEKDAYS_PT.map((day) => (
          <div key={day} className="truncate px-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 border-r border-b border-slate-200 divide-x divide-y divide-slate-200 bg-white">
        {grid.map((item, idx) => {
          const dateStr = formatDateString(item.date);
          const isToday = dateStr === todayStr;
          const isCurrentMonth = item.date.getMonth() === month;
          const isDragOver = dragOverDate === dateStr;

          // Filter trainings on this date
          const dayTrainings = trainings.filter((t) => {
            return t.startDate.startsWith(dateStr);
          });

          // Sort trainings by start time
          dayTrainings.sort((a, b) => a.startDate.localeCompare(b.startDate));

          return (
            <div
              key={`${item.key}-${idx}`}
              id={`month-grid-cell-${dateStr}`}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateStr)}
              onClick={(e) => {
                // Only click empty area to trigger quick add
                if (e.target === e.currentTarget) {
                  onCellClick(dateStr);
                }
              }}
              className={`min-h-[110px] flex flex-col p-1.5 transition-all relative group ${
                isCurrentMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
              } ${isDragOver ? 'bg-blue-50/60 ring-2 ring-blue-400 ring-inset z-10' : ''}`}
            >
              {/* Day Number Header */}
              <div className="flex justify-between items-center mb-1 select-none pointer-events-none">
                <span
                  id={`day-num-${dateStr}`}
                  className={`flex h-6 w-6 items-center justify-center text-xs font-semibold rounded-full ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {item.date.getDate()}
                </span>
                
                {/* Indicator for hovered cell to add */}
                <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium hidden sm:inline">
                  + Adicionar
                </span>
              </div>

              {/* Trainings List in this Day */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-thin pr-0.5">
                {dayTrainings.map((training) => {
                  const instructor = instructorsMap.get(training.instructorId);
                  const location = locationsMap.get(training.locationId);
                  
                  const instColor = instructor?.color || '#3b82f6';
                  const time = formatTimeString(training.startDate);
                  const isCanceled = training.status === 'cancelado';
                  const isWaiting = training.status === 'aguardando';

                  // Generate custom background color using hex opacity
                  const cardBg = isCanceled
                    ? '#f1f5f9'
                    : `${instColor}15`; // ~8% opacity
                  
                  const borderStyle = isCanceled
                    ? 'border-l-4 border-slate-300 border-dashed'
                    : `border-l-4`;

                  return (
                    <div
                      key={training.id}
                      id={`event-card-${training.id}`}
                      draggable={training.status !== 'cancelado'} // Can disable dragging for canceled
                      onDragStart={(e) => handleDragStart(e, training.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(training);
                      }}
                      style={{ 
                        backgroundColor: cardBg,
                        color: isCanceled ? '#64748b' : instructor?.color,
                        borderLeftColor: isCanceled ? undefined : instColor
                      }}
                      className={`group/card rounded-r px-2 py-1 text-2xs font-medium ${borderStyle} border-y border-r border-slate-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow transition-all hover:translate-x-0.5`}
                    >
                      {/* Time + Title */}
                      <div className="flex items-center gap-1 select-none truncate">
                        <span className="font-bold opacity-80">{time}</span>
                        <span className={`truncate font-semibold ${isCanceled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {training.title}
                        </span>
                      </div>

                      {/* Location details */}
                      {location && (
                        <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-slate-500 truncate select-none">
                          <MapPin className="h-2 w-2 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{location.name}</span>
                        </div>
                      )}

                      {/* Wait/Orange Badge */}
                      {isWaiting && (
                        <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm" title="Aguardando confirmação" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
