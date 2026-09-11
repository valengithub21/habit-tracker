import { Habit, DayCompletion, NotificationConfig, ThemeMode } from '../types';
import { getMonthKey } from './date';

const STORAGE_KEYS = {
  HABITS: 'apple_habit_tracker_habits_v2',
  COMPLETIONS: 'apple_habit_tracker_completions_v2',
  THEME: 'apple_habit_tracker_theme_v2',
  NOTIFICATIONS: 'apple_habit_tracker_notifications_v2',
};

export function getDefaultHabits(currentMonthKey: string): Habit[] {
  return [
    {
      id: 'habit-1',
      name: 'Meditar 10 minutos',
      icon: '🧘',
      color: 'purple',
      category: 'Mente',
      monthKey: currentMonthKey,
      createdAt: '2026-09-01',
      targetDaysPerWeek: 7,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    },
    {
      id: 'habit-2',
      name: 'Tomar 2L de agua',
      icon: '💧',
      color: 'blue',
      category: 'Salud',
      monthKey: currentMonthKey,
      createdAt: '2026-09-01',
      targetDaysPerWeek: 7,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    },
    {
      id: 'habit-3',
      name: 'Entrenamiento físico',
      icon: '⚡',
      color: 'green',
      category: 'Salud',
      monthKey: currentMonthKey,
      createdAt: '2026-09-01',
      targetDaysPerWeek: 5,
      daysOfWeek: [1, 2, 3, 4, 5], // Lun a Vie
    },
    {
      id: 'habit-4',
      name: 'Leer 20 páginas',
      icon: '📚',
      color: 'orange',
      category: 'Productividad',
      monthKey: currentMonthKey,
      createdAt: '2026-09-01',
      targetDaysPerWeek: 6,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 'habit-5',
      name: 'Dormir antes de las 23:30',
      icon: '🌙',
      color: 'indigo',
      category: 'Estilo de vida',
      monthKey: currentMonthKey,
      createdAt: '2026-09-01',
      targetDaysPerWeek: 7,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    },
  ];
}

export function getDefaultCompletions(habits: Habit[], currentMonthKey: string): DayCompletion {
  const result: DayCompletion = {};
  const today = new Date();
  const currentDay = today.getDate(); // e.g. 10

  // Pre-fill realistic past days for current month up to today
  for (let day = 1; day <= Math.min(currentDay, 30); day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${currentMonthKey}-${dayStr}`;
    result[dateKey] = {};

    habits.forEach((h, idx) => {
      // Create an authentic realistic pattern (high consistency with occasional rest)
      if (day === currentDay) {
        // Today: first 2 completed, rest pending for user interaction
        result[dateKey][h.id] = idx < 2;
      } else {
        const pseudorandom = (day * 13 + idx * 7) % 10;
        // ~80% completion rate for past days
        result[dateKey][h.id] = pseudorandom > 1;
      }
    });
  }

  return result;
}

export function loadHabits(currentMonthKey: string): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading habits', e);
  }
  const defaults = getDefaultHabits(currentMonthKey);
  saveHabits(defaults);
  return defaults;
}

export function saveHabits(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits', e);
  }
}

export function loadCompletions(habits: Habit[], currentMonthKey: string): DayCompletion {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading completions', e);
  }
  const defaults = getDefaultCompletions(habits, currentMonthKey);
  saveCompletions(defaults);
  return defaults;
}

export function saveCompletions(completions: DayCompletion) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (e) {
    console.error('Error saving completions', e);
  }
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {}
  return 'dark'; // Apple luxury dark mode as default or system
}

export function saveTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

export function loadNotificationConfig(): NotificationConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        soundEnabled: false,
      };
    }
  } catch {}
  return {
    enabled: false,
    time: '21:00',
    hasPermission: typeof Notification !== 'undefined' && Notification.permission === 'granted',
    soundEnabled: false,
  };
}

export function saveNotificationConfig(cfg: NotificationConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cfg));
  } catch {}
}
