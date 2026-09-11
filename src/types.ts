export type AppleColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'green'
  | 'orange'
  | 'yellow'
  | 'indigo'
  | 'teal'
  | 'red';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: AppleColor;
  category: 'Salud' | 'Productividad' | 'Mente' | 'Estilo de vida';
  monthKey: string; // "YYYY-MM" (e.g. "2026-09")
  createdAt: string;
  targetDaysPerWeek?: number;
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6] where 0=Sunday, 1=Monday, ..., 6=Saturday. If undefined/empty, defaults to all days.
  specificDayOfMonth?: number; // 1 to 31 (optional: for habits scheduled on a specific day of the month)
}

export interface DayCompletion {
  // Key format: "YYYY-MM-DD"
  [dateStr: string]: {
    [habitId: string]: boolean;
  };
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface NotificationConfig {
  enabled: boolean;
  time: string; // e.g., "21:00"
  hasPermission: boolean;
  soundEnabled: boolean;
}

export interface MonthData {
  year: number;
  month: number; // 0-indexed (0 = Enero, 8 = Septiembre)
  key: string; // "YYYY-MM"
  name: string;
}
