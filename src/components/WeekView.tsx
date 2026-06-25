/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getDaysInWeek, formatDateString, WEEKDAYS_SHORT_PT, formatTimeString } from '../utils/dateUtils';
import { Training, Instructor, Location } from '../types';
import { MapPin, Clock } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  trainings: Training[];
  instructors: Instructor[];
  locations: Location[];
  onEventClick: (training: Training) => void;
  onEventDrop: (trainingId: string, newDateStr: string) => void;
  onCellClick: (dateStr: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 to 19:00
const ROW_HEIGHT = 64; // pixels per hour

export default function WeekView({
  currentDate,
  trainings,
  instructors,
  locations,
  onEventClick,
  onEventDrop,
  onCellClick,
}: WeekViewProps) {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const days = getDaysInWeek(currentDate);
  const todayStr = formatDateString(new Date());

  const instructorsMap = new Map(instructors.map((i) => [i.id, i]));
  const locationsMap = new Map(locations.map((l) => [l.id, l]));

  // Calculate top offset and height for an event in the hourly grid
  const getEventPosition = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const top = Math.max(0, (startHour - 7) * ROW_HEIGHT);
    const height = Math.max(30, (endHour - startHour) * ROW_HEIGHT);

    return { top, height };
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEventId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dragOverDay !== dateStr) {
      setDragOverDay(dateStr);
    }
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain') || draggedEventId;
    if (eventId) {
      onEventDrop(eventId, dateStr);
    }
    setDraggedEventId(null);
    setDragOverDay(null);
  };

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden min-h-[500px]">
      {/* Week Header Row */}
      <div className="grid grid-cols-8 border-b border-slate-200 text-center text-xs font-semibold text-slate-500 py-3 shadow-sm select-none">
        {/* Empty left corner for hour axis */}
        <div className="border-r border-slate-100 flex items-center justify-center text-[10px] text-slate-400">
          GMT-3
        </div>

        {/* 7 Days of the Week */}
        {days.map((day, idx) => {
          const dayStr = formatDateString(day);
          const isToday = dayStr === todayStr;
          return (
            <div 
              key={dayStr} 
              className={`flex flex-col items-center justify-center gap-1 border-r border-slate-100 last:border-0 ${
                isToday ? 'bg-blue-50/20' : ''
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {WEEKDAYS_SHORT_PT[day.getDay()]}
              </span>
              <span 
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isToday 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-800'
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Scroll Area */}
      <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin relative flex">
        
        {/* Left Hour Axis */}
        <div className="w-[12.5%] flex-shrink-0 border-r border-slate-200 bg-slate-50 select-none">
          {HOURS.map((hour) => (
            <div 
              key={hour} 
              style={{ height: ROW_HEIGHT }}
              className="pr-2 text-right text-xs font-medium text-slate-400 flex items-start pt-1 justify-end"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 7 Days lanes with horizontal grid lines */}
        <div className="flex-1 grid grid-cols-7 relative divide-x divide-slate-100">
          
          {/* Hour grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                style={{ height: ROW_HEIGHT }}
                className="border-b border-slate-100 w-full"
              />
            ))}
          </div>

          {/* Individual Day lanes */}
          {days.map((day) => {
            const dateStr = formatDateString(day);
            const isToday = dateStr === todayStr;
            const isDragOver = dragOverDay === dateStr;

            // Filter events on this day that fall into the hour grid range
            const dayTrainings = trainings.filter((t) => t.startDate.startsWith(dateStr));

            return (
              <div
                key={dateStr}
                id={`week-lane-${dateStr}`}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onCellClick(dateStr);
                  }
                }}
                style={{ height: HOURS.length * ROW_HEIGHT }}
                className={`relative flex flex-col group/lane transition-colors ${
                  isToday ? 'bg-blue-50/10' : ''
                } ${isDragOver ? 'bg-blue-50/50' : ''}`}
              >
                {/* Visual quick add indicator */}
                <div className="absolute inset-x-0 bottom-0 top-0 opacity-0 group-hover/lane:opacity-100 bg-blue-500/0 hover:bg-blue-500/[0.01] cursor-pointer transition-opacity pointer-events-none" />

                {/* Event Card Overlay */}
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
                      id={`week-event-card-${training.id}`}
                      draggable={training.status !== 'cancelado'}
                      onDragStart={(e) => handleDragStart(e, training.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(training);
                      }}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: isCanceled ? '#f1f5f9' : `${instColor}15`,
                        borderLeftColor: isCanceled ? undefined : instColor,
                        color: isCanceled ? '#64748b' : instructor?.color,
                      }}
                      className={`absolute left-1 right-1 rounded px-2 py-1.5 text-3xs font-medium border-l-4 ${
                        isCanceled 
                          ? 'border-slate-300 border-dashed' 
                          : 'border-solid border-y border-r border-slate-100'
                      } shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] transition-all overflow-hidden`}
                    >
                      {/* Time */}
                      <div className="flex items-center gap-1 text-[9px] opacity-75 font-semibold select-none mb-0.5">
                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                        <span>
                          {formatTimeString(training.startDate)} - {formatTimeString(training.endDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <div className={`font-bold leading-snug truncate ${isCanceled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {training.title}
                      </div>

                      {/* Instructor name */}
                      {instructor && (
                        <div className="text-[9px] font-semibold text-slate-600 mt-1 truncate">
                          {instructor.name}
                        </div>
                      )}

                      {/* Location */}
                      {location && (
                        <div className="flex items-center gap-0.5 text-[8.5px] text-slate-500 mt-0.5 truncate">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{location.name}</span>
                        </div>
                      )}

                      {/* Pending Badge */}
                      {isWaiting && (
                        <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
