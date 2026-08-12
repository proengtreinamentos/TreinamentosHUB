/**
 * Brazilian National Holidays and Municipal Holidays Utility
 */

export interface Holiday {
  dateStr: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'municipal';
}

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const holidaysCache = new Map<number, Map<string, Holiday>>();

export function getHolidaysForYear(year: number): Map<string, Holiday> {
  if (holidaysCache.has(year)) {
    return holidaysCache.get(year)!;
  }

  const holidays = new Map<string, Holiday>();

  const add = (month: number, day: number, name: string, type: 'national' | 'municipal' = 'national') => {
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const key = `${year}-${mStr}-${dStr}`;
    holidays.set(key, { dateStr: key, name, type });
  };

  // Fixed National Holidays
  add(1, 1, 'Ano Novo (Confraternização Universal)');
  add(4, 21, 'Tiradentes');
  add(5, 1, 'Dia do Trabalhador');
  add(9, 7, 'Independência do Brasil');
  add(10, 12, 'Nossa Senhora Aparecida');
  add(11, 2, 'Finados');
  add(11, 15, 'Proclamação da República');
  add(11, 20, 'Dia Nacional da Consciência Negra');
  add(12, 25, 'Natal');

  // Municipal Holiday: São Bernardo do Campo (20 de Agosto)
  add(8, 20, 'Aniversário de São Bernardo do Campo (Feriado Municipal)', 'municipal');

  // Movable Holidays based on Easter
  const easter = getEasterDate(year);
  
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const carnavalSegunda = new Date(easter);
  carnavalSegunda.setDate(easter.getDate() - 48);
  const carnavalTerca = new Date(easter);
  carnavalTerca.setDate(easter.getDate() - 47);

  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  holidays.set(formatDate(carnavalSegunda), { dateStr: formatDate(carnavalSegunda), name: 'Carnaval (Segunda-feira)', type: 'national' });
  holidays.set(formatDate(carnavalTerca), { dateStr: formatDate(carnavalTerca), name: 'Terça-feira de Carnaval', type: 'national' });
  holidays.set(formatDate(sextaSanta), { dateStr: formatDate(sextaSanta), name: 'Sexta-feira Santa (Paixão de Cristo)', type: 'national' });
  holidays.set(formatDate(easter), { dateStr: formatDate(easter), name: 'Páscoa', type: 'national' });
  holidays.set(formatDate(corpusChristi), { dateStr: formatDate(corpusChristi), name: 'Corpus Christi', type: 'national' });

  holidaysCache.set(year, holidays);
  return holidays;
}

export function getHolidayForDate(date: Date): Holiday | null {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  return holidays.get(key) || null;
}
