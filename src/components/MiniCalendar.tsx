/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MONTHS_PT, WEEKDAYS_SHORT_PT, generateMonthGrid, formatDateString } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  // Local month/year for navigation in the mini calendar, distinct from main calendar's date
  const [navMonth, setNavMonth] = useState(selectedDate.getMonth());
  const [navYear, setNavYear] = useState(selectedDate.getFullYear());

  const grid = generateMonthGrid(navYear, navMonth);

  const prevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(navYear - 1);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const nextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(navYear + 1);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  const today = new Date();
  const todayStr = formatDateString(today);
  const selectedStr = formatDateString(selectedDate);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">
          {MONTHS_PT[navMonth]} {navYear}
        </h4>
        <div className="flex items-center gap-1.5">
          <button
            id="mini-prev-month-btn"
            onClick={prevMonth}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            id="mini-next-month-btn"
            onClick={nextMonth}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-y-1 mb-1.5 text-center text-2xs font-semibold text-slate-400">
        {WEEKDAYS_SHORT_PT.map((day, idx) => (
          <div key={`${day}-${idx}`} className="w-7 h-5 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-xs">
        {grid.map((item, idx) => {
          const itemStr = formatDateString(item.date);
          const isToday = itemStr === todayStr;
          const isSelected = itemStr === selectedStr;
          const isCurrentMonth = item.date.getMonth() === navMonth;

          return (
            <button
              key={`${item.key}-${idx}`}
              id={`mini-day-${itemStr}`}
              onClick={() => {
                onDateSelect(item.date);
                // Align navigation if selected month changes
                setNavMonth(item.date.getMonth());
                setNavYear(item.date.getFullYear());
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold'
                  : isToday
                  ? 'border border-blue-500 font-semibold text-blue-600 hover:bg-blue-50'
                  : isCurrentMonth
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
