import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  CheckCircle,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Coffee,
} from 'lucide-react';

import { Habit, DayCompletion, NotificationConfig } from './types';
import {
  loadHabits,
  saveHabits,
  loadCompletions,
  saveCompletions,
  loadNotificationConfig,
  saveNotificationConfig,
  getDefaultHabits,
} from './utils/storage';
import {
  getMonthKey,
  getDateKey,
  getDaysInMonth,
  isSameDay,
  isToday,
  formatHeaderDate,
  SPANISH_WEEKDAYS_FULL,
} from './utils/date';
import { isHabitScheduledForDate, getHabitScheduleBadge } from './utils/habitSchedule';
import { playAllCompleteFanfare, playHapticClick } from './utils/audio';
import { showHabitNotification } from './utils/notifications';

import { AppleHeader } from './components/AppleHeader';
import { DayPickerStrip } from './components/DayPickerStrip';
import { HabitItem } from './components/HabitItem';
import { AddHabitModal } from './components/AddHabitModal';
import { MonthlyCharts } from './components/MonthlyCharts';
import { SettingsView } from './components/SettingsView';
import { NotificationModal } from './components/NotificationModal';
import { TabBar, TabType } from './components/TabBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  // Current date anchor
  const today = useMemo(() => new Date(), []);

  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // Month Key (e.g. "2026-09")
  const currentMonthKey = useMemo(
    () => getMonthKey(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  const selectedDateKey = useMemo(() => getDateKey(selectedDate), [selectedDate]);

  // Persisted state
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits(currentMonthKey));
  const [completions, setCompletions] = useState<DayCompletion>(() =>
    loadCompletions(habits, currentMonthKey)
  );
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(() =>
    loadNotificationConfig()
  );

  // Modals & configuration
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showOtherHabits, setShowOtherHabits] = useState(false);

  // Sound preference disabled per user request
  const soundEnabled = false;

  // Enforce dark mode permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Save changes
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveCompletions(completions);
  }, [completions]);

  useEffect(() => {
    saveNotificationConfig(notificationConfig);
  }, [notificationConfig]);

  // Background check for daily notification reminder
  useEffect(() => {
    if (!notificationConfig.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (currentTimeStr === notificationConfig.time) {
        const todayKey = getDateKey(now);
        const todayComp = completions[todayKey] || {};
        const activeHabitsForMonth = habits.filter(
          (h) => !h.monthKey || h.monthKey === currentMonthKey
        );
        const scheduledToday = activeHabitsForMonth.filter((h) => isHabitScheduledForDate(h, now));
        const completedCount = scheduledToday.filter((h) => todayComp[h.id]).length;

        if (scheduledToday.length > 0 && completedCount < scheduledToday.length) {
          showHabitNotification(
            '🌟 Hora de tus Hábitos',
            `Tienes ${scheduledToday.length - completedCount} hábitos pendientes hoy. ¡Mantén tu progreso!`
          );
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [notificationConfig, completions, habits, currentMonthKey]);

  // Days in selected month
  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  // Active habits for the selected month (or all habits if monthKey not restricted)
  const monthHabits = useMemo(() => {
    const filtered = habits.filter((h) => !h.monthKey || h.monthKey === currentMonthKey);
    return filtered.length > 0 ? filtered : habits;
  }, [habits, currentMonthKey]);

  // Habits scheduled to appear on the currently selected date
  const scheduledHabitsForDay = useMemo(() => {
    return monthHabits.filter((h) => isHabitScheduledForDate(h, selectedDate));
  }, [monthHabits, selectedDate]);

  // Habits of this month that are not scheduled for the selected date
  const otherHabitsForMonth = useMemo(() => {
    return monthHabits.filter((h) => !isHabitScheduledForDate(h, selectedDate));
  }, [monthHabits, selectedDate]);

  // Day stats calculation for the strip indicators (tailored to each day's scheduled habits)
  const dayStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percentage: number }> = {};

    daysInMonth.forEach((day) => {
      const dKey = getDateKey(day);
      const dayComp = completions[dKey] || {};
      const scheduled = monthHabits.filter((h) => isHabitScheduledForDate(h, day));
      let completedCount = 0;
      scheduled.forEach((h) => {
        if (dayComp[h.id]) completedCount++;
      });

      const total = scheduled.length;
      stats[dKey] = {
        total,
        completed: completedCount,
        percentage: total > 0 ? Math.round((completedCount / total) * 100) : 100,
      };
    });

    return stats;
  }, [daysInMonth, monthHabits, completions]);

  // Calculate current streak for a given habit
  const getHabitStreak = (habitId: string): number => {
    let streak = 0;
    const checkDate = new Date(selectedDate);

    // If today is completed, start from today, else start from yesterday
    const currentKey = getDateKey(checkDate);
    const todayDone = completions[currentKey] && completions[currentKey][habitId];

    if (!todayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 60; i++) {
      const key = getDateKey(checkDate);
      if (completions[key] && completions[key][habitId]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Toggle habit completion on selected date
  const handleToggleHabit = (habitId: string) => {
    setCompletions((prev) => {
      const dayRecord = { ...(prev[selectedDateKey] || {}) };
      const currentVal = !!dayRecord[habitId];
      dayRecord[habitId] = !currentVal;

      // Check if all scheduled habits on this day are now completed
      const willBeAllDone =
        !currentVal &&
        scheduledHabitsForDay.every((h) => (h.id === habitId ? true : !!dayRecord[h.id]));

      if (willBeAllDone) {
        try {
          playAllCompleteFanfare(soundEnabled);
        } catch {
          // Audio fallback
        }
      }

      return {
        ...prev,
        [selectedDateKey]: dayRecord,
      };
    });
  };

  // Add new habit
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      createdAt: selectedDateKey,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  // Edit/configure existing habit
  const handleEditHabit = (habitId: string, updated: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, ...updated } : h))
    );
  };

  // Open configure modal for a habit
  const handleOpenEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsAddHabitOpen(true);
  };

  // Open add habit modal
  const handleOpenAddHabit = () => {
    setHabitToEdit(null);
    setIsAddHabitOpen(true);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(11);
      setSelectedDate(new Date(selectedYear - 1, 11, 1));
    } else {
      setSelectedMonth((m) => m - 1);
      setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(0);
      setSelectedDate(new Date(selectedYear + 1, 0, 1));
    } else {
      setSelectedMonth((m) => m + 1);
      setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));
    }
  };

  const handleResetToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setSelectedDate(today);
  };

  // Current day summary calculations
  const isSelectedDateToday = isToday(selectedDate);
  const currentDayScheduledCount = scheduledHabitsForDay.length;
  const currentDayCompletedCount = scheduledHabitsForDay.filter(
    (h) => completions[selectedDateKey] && completions[selectedDateKey][h.id]
  ).length;
  const currentDayPercentage =
    currentDayScheduledCount > 0
      ? Math.round((currentDayCompletedCount / currentDayScheduledCount) * 100)
      : 100;

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 font-sans pb-28 select-none">
      {/* Container constrained to mobile-friendly Apple UI width */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Apple iOS Top Header */}
        <AppleHeader
          currentYear={selectedYear}
          currentMonth={selectedMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onJumpToToday={handleResetToToday}
          onTodayClick={handleResetToToday}
          isCurrentMonth={
            selectedYear === today.getFullYear() && selectedMonth === today.getMonth()
          }
          onOpenAddHabit={handleOpenAddHabit}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          hasNotificationsEnabled={notificationConfig.enabled}
          soundEnabled={soundEnabled}
          activeTab={activeTab}
          onOpenSettings={() => setActiveTab('settings')}
        />

        {/* Dynamic Views based on Tab */}
        <main className="mt-4">
          {/* PWA Offline / Install Banner */}
          <PWAInstallBanner soundEnabled={soundEnabled} />

          {/* TAB 1: HOY (Daily Habits & Checklist) */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {/* Horizontal Date Picker Strip */}
              <DayPickerStrip
                days={daysInMonth}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                dayStats={dayStats}
                soundEnabled={soundEnabled}
              />

              {/* Day Summary Card (Apple Health / Fitness Inset style) */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatHeaderDate(selectedDate)}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
                      {isSelectedDateToday ? 'Hábitos de Hoy' : 'Registro del Día'}
                    </h2>
                  </div>

                  {/* Completion percentage pill */}
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#007AFF] dark:text-[#0A84FF]">
                      {currentDayPercentage}%
                    </span>
                    <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {currentDayCompletedCount} de {currentDayScheduledCount}
                    </p>
                  </div>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentDayPercentage}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`h-full rounded-full ${
                      currentDayPercentage === 100
                        ? 'bg-[#34C759]'
                        : 'bg-gradient-to-r from-[#007AFF] to-[#5856D6]'
                    }`}
                  />
                </div>
              </div>

              {/* Habits List Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span>Hábitos para este día</span>
                    {currentDayScheduledCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {currentDayScheduledCount}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => {
                      playHapticClick(soundEnabled);
                      handleOpenAddHabit();
                    }}
                    className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Hábito</span>
                  </button>
                </div>

                {/* Case 1: No habits at all in this month */}
                {monthHabits.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-[#007AFF] flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Sin hábitos registrados
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4 max-w-sm mx-auto">
                      Crea tu primer hábito, configúralo para los días que quieras (o todos los días) y comienza tu progreso.
                    </p>
                    <button
                      onClick={() => {
                        playHapticClick(soundEnabled);
                        handleOpenAddHabit();
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
                    >
                      Añadir Hábito
                    </button>
                  </div>
                ) : scheduledHabitsForDay.length === 0 ? (
                  /* Case 2: Habits exist, but none scheduled for this specific day */
                  <div className="text-center py-8 px-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Día libre de hábitos programados
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4 max-w-xs mx-auto">
                      No tienes hábitos configurados para los {SPANISH_WEEKDAYS_FULL[selectedDate.getDay()]}. ¡Disfruta tu descanso o agrega uno!
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          playHapticClick(soundEnabled);
                          handleOpenAddHabit();
                        }}
                        className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
                      >
                        + Nuevo Hábito
                      </button>
                      {otherHabitsForMonth.length > 0 && (
                        <button
                          onClick={() => {
                            playHapticClick(soundEnabled);
                            setShowOtherHabits((v) => !v);
                          }}
                          className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-[#2C2C2E] text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 transition"
                        >
                          {showOtherHabits ? 'Ocultar otros hábitos' : `Otros hábitos (${otherHabitsForMonth.length})`}
                        </button>
                      )}
                    </div>

                    {showOtherHabits && otherHabitsForMonth.length > 0 && (
                      <div className="space-y-2 mt-4 text-left">
                        {otherHabitsForMonth.map((habit) => {
                          const isDone = !!(
                            completions[selectedDateKey] && completions[selectedDateKey][habit.id]
                          );
                          const streak = getHabitStreak(habit.id);

                          return (
                            <HabitItem
                              key={habit.id}
                              habit={habit}
                              isCompleted={isDone}
                              streakCount={streak}
                              onToggle={handleToggleHabit}
                              onDelete={handleDeleteHabit}
                              onConfigure={handleOpenEditHabit}
                              soundEnabled={soundEnabled}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Case 3: Habits scheduled for today */
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {scheduledHabitsForDay.map((habit) => {
                        const isDone = !!(
                          completions[selectedDateKey] && completions[selectedDateKey][habit.id]
                        );
                        const streak = getHabitStreak(habit.id);

                        return (
                          <HabitItem
                            key={habit.id}
                            habit={habit}
                            isCompleted={isDone}
                            streakCount={streak}
                            onToggle={handleToggleHabit}
                            onDelete={handleDeleteHabit}
                            onConfigure={handleOpenEditHabit}
                            soundEnabled={soundEnabled}
                            isAllComplete={
                              currentDayCompletedCount + 1 === currentDayScheduledCount && !isDone
                            }
                          />
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* Collapsible Accordion: Habits not scheduled for today */}
                {otherHabitsForMonth.length > 0 && scheduledHabitsForDay.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playHapticClick(soundEnabled);
                        setShowOtherHabits((prev) => !prev);
                      }}
                      className="w-full py-2.5 px-4 rounded-2xl bg-white/70 dark:bg-[#1C1C1E]/70 hover:bg-white dark:hover:bg-[#1C1C1E] border border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Otros hábitos ({otherHabitsForMonth.length})</span>
                      </div>
                      <div className="flex items-center space-x-1 text-neutral-400">
                        <span className="text-[11px]">{showOtherHabits ? 'Ocultar' : 'Ver'}</span>
                        {showOtherHabits ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {showOtherHabits && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-2 pt-2"
                        >
                          {otherHabitsForMonth.map((habit) => {
                            const isDone = !!(
                              completions[selectedDateKey] && completions[selectedDateKey][habit.id]
                            );
                            const streak = getHabitStreak(habit.id);

                            return (
                              <HabitItem
                                key={habit.id}
                                habit={habit}
                                isCompleted={isDone}
                                streakCount={streak}
                                onToggle={handleToggleHabit}
                                onDelete={handleDeleteHabit}
                                onConfigure={handleOpenEditHabit}
                                soundEnabled={soundEnabled}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Encouragement footer badge */}
              {currentDayPercentage === 100 && currentDayScheduledCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Excelente! Has completado todos los hábitos programados para hoy.</span>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRESO (Interactive Monthly Charts & Heatmap) */}
          {activeTab === 'progress' && (
            <MonthlyCharts
              currentYear={selectedYear}
              currentMonth={selectedMonth}
              habits={monthHabits}
              completions={completions}
              soundEnabled={soundEnabled}
              onSelectDay={(date) => {
                setSelectedDate(date);
                setActiveTab('today');
              }}
            />
          )}

          {/* TAB 3: AJUSTES (Settings, Export, Reset) */}
          {activeTab === 'settings' && (
            <SettingsView
              notificationConfig={notificationConfig}
              onUpdateNotifications={setNotificationConfig}
              soundEnabled={soundEnabled}
              onToggleSound={() => {}}
              onResetDemoData={() => {
                const defaults = getDefaultHabits(currentMonthKey);
                setHabits(defaults);
                saveHabits(defaults);
              }}
              onClearAllData={() => {
                setHabits([]);
                setCompletions({});
                localStorage.clear();
              }}
            />
          )}
        </main>

        {/* Clean Apple Tab Bar (Only 3 tabs: Hoy, Progreso, Ajustes) */}
        <TabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          soundEnabled={soundEnabled}
        />

        {/* Add / Edit Habit Sheet Modal */}
        <AddHabitModal
          isOpen={isAddHabitOpen}
          onClose={() => {
            setIsAddHabitOpen(false);
            setHabitToEdit(null);
          }}
          onAddHabit={handleAddHabit}
          onEditHabit={handleEditHabit}
          habitToEdit={habitToEdit}
          currentYear={selectedYear}
          currentMonth={selectedMonth}
          soundEnabled={soundEnabled}
        />

        {/* Notification Settings Modal */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          config={notificationConfig}
          onUpdateConfig={setNotificationConfig}
          soundEnabled={soundEnabled}
        />
      </div>
    </div>
  );
}
