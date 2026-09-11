import React, { useRef, useEffect } from 'react';
import { SPANISH_WEEKDAYS_SHORT, isSameDay, isToday } from '../utils/date';
import { playHapticClick } from '../utils/audio';

interface DayPickerStripProps {
  days: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  dayStats: Record<string, { total: number; completed: number; percentage: number }>;
  soundEnabled: boolean;
}

export const DayPickerStrip: React.FC<DayPickerStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  dayStats,
  soundEnabled,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll selected day into center view smoothly
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = selectedRef.current;
      const containerWidth = container.offsetWidth;
      const elementOffset = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      container.scrollTo({
        left: elementOffset - containerWidth / 2 + elementWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedDate]);

  return (
    <div className="w-full py-2">
      <div
        ref={scrollRef}
        className="flex items-center space-x-2 overflow-x-auto no-scrollbar px-4 py-1.5 scroll-smooth"
      >
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);
          const dayNumber = day.getDate();
          const dayName = SPANISH_WEEKDAYS_SHORT[day.getDay()];

          // Date key for stats
          const y = day.getFullYear();
          const m = String(day.getMonth() + 1).padStart(2, '0');
          const d = String(day.getDate()).padStart(2, '0');
          const dateKey = `${y}-${m}-${d}`;
          const stat = dayStats[dateKey] || { total: 0, completed: 0, percentage: 0 };

          return (
            <button
              key={dateKey}
              ref={isSelected ? selectedRef : null}
              id={`day-strip-${dateKey}`}
              onClick={() => {
                playHapticClick(soundEnabled);
                onSelectDate(day);
              }}
              className={`flex flex-col items-center justify-between min-w-[50px] py-2 px-1.5 rounded-2xl transition-all duration-200 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2C2C2E]'
              }`}
            >
              {/* Day Name */}
              <span
                className={`text-[11px] font-medium tracking-tight ${
                  isSelected
                    ? 'text-white/80'
                    : isCurrentToday
                    ? 'text-[#007AFF] dark:text-[#0A84FF] font-semibold'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {dayName}
              </span>

              {/* Day Number */}
              <span className="text-base font-bold my-0.5 tracking-tight">{dayNumber}</span>

              {/* Activity indicator: dot or mini ring */}
              <div className="h-2 flex items-center justify-center">
                {stat.total > 0 ? (
                  stat.completed === stat.total ? (
                    // All completed star/ring
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-500'
                      }`}
                    />
                  ) : stat.completed > 0 ? (
                    // Partially completed
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white/80' : 'bg-amber-500'
                      }`}
                    />
                  ) : (
                    // None completed
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white/40' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                  )
                ) : (
                  <span className="w-1 h-1 rounded-full opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
