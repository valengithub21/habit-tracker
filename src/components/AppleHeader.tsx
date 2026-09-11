import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { formatMonthTitle } from '../utils/date';
import { playHapticClick } from '../utils/audio';

interface AppleHeaderProps {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday?: () => void;
  onTodayClick?: () => void;
  isCurrentMonth: boolean;
  onOpenAddHabit?: () => void;
  onOpenNotifications?: () => void;
  hasNotificationsEnabled?: boolean;
  soundEnabled?: boolean;
  activeTab?: string;
  onOpenSettings?: () => void;
}

export const AppleHeader: React.FC<AppleHeaderProps> = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onJumpToToday,
  onTodayClick,
  isCurrentMonth,
  onOpenAddHabit,
  onOpenNotifications,
  hasNotificationsEnabled = false,
  soundEnabled = false,
  activeTab = 'today',
  onOpenSettings,
}) => {
  const monthTitle = formatMonthTitle(currentYear, currentMonth);

  return (
    <header className="sticky top-0 z-30 w-full ios-blur bg-white/80 dark:bg-black/80 border-b border-black/5 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 pt-safe pb-2">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between py-1">
          {/* Month Selector Buttons */}
          <div className="flex items-center space-x-1">
            <button
              id="header-prev-month-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                onPrevMonth();
              }}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-white px-1">
              {monthTitle}
            </span>

            <button
              id="header-next-month-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                onNextMonth();
              }}
              className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isCurrentMonth && (
              <button
                id="header-today-shortcut-btn"
                onClick={() => {
                  playHapticClick(soundEnabled);
                  if (onJumpToToday) onJumpToToday();
                  else if (onTodayClick) onTodayClick();
                }}
                className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition active:scale-95"
              >
                Hoy
              </button>
            )}
          </div>

          {/* Quick Actions (Theme, Notification, Add) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="header-notification-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                onOpenNotifications?.();
              }}
              className="relative p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition"
              title="Ajustes de Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {hasNotificationsEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
              )}
            </button>

            <button
              id="header-add-habit-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                onOpenAddHabit?.();
              }}
              className="flex items-center gap-1.5 bg-[#007AFF] hover:bg-[#0071EB] active:scale-95 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm transition"
              aria-label="Añadir hábito"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden xs:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Apple Large Title Style Header */}
        <div className="flex items-baseline justify-between mt-1 mb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {activeTab === 'today'
                ? 'Mis Hábitos'
                : activeTab === 'progress'
                ? 'Progreso Mensual'
                : activeTab === 'habits'
                ? 'Gestión de Hábitos'
                : 'Ajustes'}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
