export const SPANISH_MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const SPANISH_WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const SPANISH_WEEKDAYS_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function getMonthKey(year: number, monthIndex: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${m}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [yearStr, monthStr] = key.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10) - 1,
  };
}

export function getDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysInMonth(year: number, monthIndex: number): Date[] {
  const days: Date[] = [];
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, monthIndex, d));
  }
  return days;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return `${SPANISH_MONTHS[monthIndex]} ${year}`;
}

export function formatHeaderDate(d: Date): string {
  const dayName = SPANISH_WEEKDAYS_FULL[d.getDay()];
  const dayNum = d.getDate();
  const monthName = SPANISH_MONTHS[d.getMonth()];
  return `${dayName}, ${dayNum} de ${monthName}`;
}
