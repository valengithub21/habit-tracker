import React from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Trash2, Calendar, SlidersHorizontal } from 'lucide-react';
import { Habit } from '../types';
import { APPLE_COLORS } from '../utils/colors';
import { playHabitCompleteSound, playHapticClick } from '../utils/audio';
import { getHabitScheduleBadge } from '../utils/habitSchedule';

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  streakCount: number;
  onToggle: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  onConfigure?: (habit: Habit) => void;
  soundEnabled: boolean;
  isAllComplete?: boolean;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  isCompleted,
  streakCount,
  onToggle,
  onDelete,
  onConfigure,
  soundEnabled,
}) => {
  const colorDef = APPLE_COLORS[habit.color] || APPLE_COLORS.blue;
  const scheduleBadge = getHabitScheduleBadge(habit);

  const handleCheckmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (!isCompleted) {
        playHabitCompleteSound(soundEnabled);
      } else {
        playHapticClick(soundEnabled);
      }
    } catch {
      // Fallback
    }

    onToggle(habit.id);
  };

  const handleRowClick = () => {
    if (onConfigure) {
      playHapticClick(soundEnabled);
      onConfigure(habit);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-200 ${
        isCompleted
          ? 'bg-neutral-100/90 dark:bg-[#1C1C1E]/90 border border-black/[0.04] dark:border-white/[0.05]'
          : 'bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-sm hover:border-[#007AFF]/30'
      }`}
    >
      {/* Left side: Icon + Name + Category + Schedule + Streak */}
      <div
        className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer"
        onClick={handleRowClick}
        title="Toca para configurar este hábito"
      >
        {/* Habit Squircle Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: colorDef.bgLight,
            borderColor: colorDef.borderLight,
          }}
        >
          <span>{habit.icon || '✨'}</span>
        </div>

        {/* Text info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`text-base font-semibold tracking-tight truncate transition-colors duration-200 ${
                isCompleted
                  ? 'text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-600'
                  : 'text-neutral-900 dark:text-white'
              }`}
            >
              {habit.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {/* Category tag */}
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: colorDef.bgLight,
                color: colorDef.textLight,
              }}
            >
              {habit.category}
            </span>

            {/* Schedule badge */}
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                scheduleBadge.isEveryday
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] dark:text-[#0A84FF] font-semibold'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{scheduleBadge.label}</span>
            </span>

            {/* Streak */}
            {streakCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500 dark:text-amber-400 ml-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>
                  {streakCount} {streakCount === 1 ? 'día' : 'días'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Configure button + Delete button & Checkbox */}
      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
        {onConfigure && (
          <button
            id={`config-habit-${habit.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playHapticClick(soundEnabled);
              onConfigure(habit);
            }}
            className="opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-neutral-400 hover:text-[#007AFF] dark:hover:text-[#0A84FF] rounded-full hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] transition-all duration-150"
            aria-label="Configurar hábito"
            title="Configurar hábito"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            id={`delete-habit-${habit.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playHapticClick(soundEnabled);
              onDelete(habit.id);
            }}
            className="opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-neutral-100 dark:hover:bg-[#2C2C2E] transition-all duration-150"
            aria-label="Eliminar hábito"
            title="Eliminar hábito"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Fluid Apple Checkbox Button */}
        <motion.button
          id={`toggle-habit-${habit.id}`}
          type="button"
          onClick={handleCheckmarkClick}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isCompleted
              ? 'shadow-sm'
              : 'border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
          }`}
          style={{
            backgroundColor: isCompleted ? colorDef.light : 'transparent',
            boxShadow: isCompleted ? `0 0 0 2px ${colorDef.light}` : undefined,
          }}
          aria-label={isCompleted ? 'Desmarcar hábito' : 'Completar hábito'}
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-5 h-5 text-white stroke-[3]" />
            </motion.div>
          ) : (
            <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
