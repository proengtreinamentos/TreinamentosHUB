/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export const WEEKDAYS_SHORT_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/**
 * Returns a 35 or 42-day calendar grid for a given year and month.
 * month is 0-indexed (0 = Jan, 5 = Jun, etc.)
 */
export function generateMonthGrid(year: number, month: number) {
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const grid: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    grid.push({
      date: new Date(prevYear, prevMonth, d),
      isCurrentMonth: false,
      key: `${prevYear}-${prevMonth + 1}-${d}`,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    grid.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
      key: `${year}-${month + 1}-${d}`,
    });
  }

  // Next month padding to fill complete weeks (multiples of 7, usually 35 or 42)
  const remaining = grid.length % 7;
  if (remaining > 0) {
    const nextDaysNeeded = 7 - remaining;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      grid.push({
        date: new Date(nextYear, nextMonth, d),
        isCurrentMonth: false,
        key: `${nextYear}-${nextMonth + 1}-${d}`,
      });
    }
  }

  // Ensure at least 5 rows (35 items) or 6 rows (42 items)
  while (grid.length < 35) {
    const lastItem = grid[grid.length - 1];
    const nextDate = new Date(lastItem.date);
    nextDate.setDate(nextDate.getDate() + 1);
    grid.push({
      date: nextDate,
      isCurrentMonth: false,
      key: `${nextDate.getFullYear()}-${nextDate.getMonth() + 1}-${nextDate.getDate()}`,
    });
  }

  return grid;
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extracts the time string (HH:MM) from an ISO datetime string
 */
export function formatTimeString(isoString: string): string {
  if (!isoString) return '';
  const timePart = isoString.split('T')[1];
  if (!timePart) return '00:00';
  return timePart.substring(0, 5);
}

/**
 * Parses YYYY-MM-DDTHH:MM into a Date object safely
 */
export function parseIsoString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Formats a date to full display string e.g., "Wednesday, 17 de Junho"
 */
export function formatFullDay(date: Date): string {
  const dayName = WEEKDAYS_PT[date.getDay()];
  const day = date.getDate();
  const monthName = MONTHS_PT[date.getMonth()];
  return `${dayName}, ${day} de ${monthName}`;
}

/**
 * Formats a week range e.g. "15 a 21 de Junho de 2026"
 */
export function formatWeekRange(startOfWeek: Date, endOfWeek: Date): string {
  const startDay = startOfWeek.getDate();
  const startMonth = MONTHS_PT[startOfWeek.getMonth()];
  const endDay = endOfWeek.getDate();
  const endMonth = MONTHS_PT[endOfWeek.getMonth()];
  const year = endOfWeek.getFullYear();

  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${startDay} a ${endDay} de ${endMonth} de ${year}`;
  } else {
    return `${startDay} de ${startMonth} a ${endDay} de ${endMonth} de ${year}`;
  }
}

/**
 * Returns the start of the week (Sunday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

/**
 * Returns an array of 7 days representing the week for a given date
 */
export function getDaysInWeek(date: Date): Date[] {
  const start = getStartOfWeek(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}
