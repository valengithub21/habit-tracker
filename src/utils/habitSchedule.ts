import { Habit } from '../types';
import { SPANISH_WEEKDAYS_SHORT, SPANISH_WEEKDAYS_FULL } from './date';

export interface DayOfWeekOption {
  id: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  short: string;
  full: string;
  initial: string;
}

// Ordered Monday to Sunday for natural calendar UX
export const DAYS_OF_WEEK_ORDERED: DayOfWeekOption[] = [
  { id: 1, short: 'Lun', full: 'Lunes', initial: 'L' },
  { id: 2, short: 'Mar', full: 'Martes', initial: 'M' },
  { id: 3, short: 'Mié', full: 'Miércoles', initial: 'X' },
  { id: 4, short: 'Jue', full: 'Jueves', initial: 'J' },
  { id: 5, short: 'Vie', full: 'Viernes', initial: 'V' },
  { id: 6, short: 'Sáb', full: 'Sábado', initial: 'S' },
  { id: 0, short: 'Dom', full: 'Domingo', initial: 'D' },
];

export const ALL_DAYS_ARRAY = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAYS_ARRAY = [1, 2, 3, 4, 5];
export const WEEKENDS_ARRAY = [6, 0];

/**
 * Determines whether a habit is scheduled to appear on a specific calendar Date.
 */
export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  // If habit is tied to a specific calendar day of the month (e.g., day 15)
  if (habit.specificDayOfMonth && habit.specificDayOfMonth > 0) {
    return date.getDate() === habit.specificDayOfMonth;
  }

  // If daysOfWeek is configured
  if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    return habit.daysOfWeek.includes(dayOfWeek);
  }

  // Default: appears every day
  return true;
}

/**
 * Returns a human-friendly label and metadata for a habit's schedule.
 */
export function getHabitScheduleBadge(habit: Habit): {
  label: string;
  isEveryday: boolean;
  isSingleDay: boolean;
  daysCount: number;
} {
  if (habit.specificDayOfMonth && habit.specificDayOfMonth > 0) {
    return {
      label: `Día ${habit.specificDayOfMonth} del mes`,
      isEveryday: false,
      isSingleDay: true,
      daysCount: 1,
    };
  }

  const days = habit.daysOfWeek;
  if (!days || days.length === 0 || days.length === 7) {
    return {
      label: 'Todos los días',
      isEveryday: true,
      isSingleDay: false,
      daysCount: 7,
    };
  }

  if (days.length === 1) {
    const dayName = SPANISH_WEEKDAYS_FULL[days[0]];
    return {
      label: `Solo los ${dayName}`,
      isEveryday: false,
      isSingleDay: true,
      daysCount: 1,
    };
  }

  const hasAllWeekdays = days.length === 5 && WEEKDAYS_ARRAY.every((d) => days.includes(d));
  if (hasAllWeekdays) {
    return {
      label: 'Entre semana (Lun-Vie)',
      isEveryday: false,
      isSingleDay: false,
      daysCount: 5,
    };
  }

  const hasAllWeekends = days.length === 2 && WEEKENDS_ARRAY.every((d) => days.includes(d));
  if (hasAllWeekends) {
    return {
      label: 'Fines de semana (Sáb-Dom)',
      isEveryday: false,
      isSingleDay: false,
      daysCount: 2,
    };
  }

  // Sorted list of short days
  const sortedDays = [...days].sort((a, b) => {
    const orderA = a === 0 ? 7 : a;
    const orderB = b === 0 ? 7 : b;
    return orderA - orderB;
  });

  return {
    label: sortedDays.map((d) => SPANISH_WEEKDAYS_SHORT[d]).join(', '),
    isEveryday: false,
    isSingleDay: false,
    daysCount: days.length,
  };
}

/**
 * Counts how many days in a given month this habit is active/scheduled.
 */
export function countScheduledDaysInMonth(habit: Habit, daysInMonth: Date[]): number {
  return daysInMonth.filter((day) => isHabitScheduledForDate(habit, day)).length;
}
