import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Award, Flame, CheckCircle2, Calendar, Target } from 'lucide-react';
import { Habit, DayCompletion } from '../types';
import { getDaysInMonth, formatMonthTitle, SPANISH_WEEKDAYS_SHORT, SPANISH_MONTHS } from '../utils/date';
import { APPLE_COLORS } from '../utils/colors';
import { playHapticClick } from '../utils/audio';
import {
  isHabitScheduledForDate,
  countScheduledDaysInMonth,
  getHabitScheduleBadge,
} from '../utils/habitSchedule';

interface MonthlyChartsProps {
  currentYear: number;
  currentMonth: number;
  habits: Habit[];
  completions: DayCompletion;
  soundEnabled: boolean;
  onSelectDay?: (date: Date) => void;
}

export const MonthlyCharts: React.FC<MonthlyChartsProps> = ({
  currentYear,
  currentMonth,
  habits,
  completions,
  soundEnabled,
  onSelectDay,
}) => {
  const days = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTitle = formatMonthTitle(currentYear, currentMonth);

  // Filter habits belonging to this month or general active habits
  const activeHabits = habits;

  // Compute stats per day of the month
  const dailyData = useMemo(() => {
    return days.map((day) => {
      const dayNum = day.getDate();
      const dateKey = `${monthKey}-${String(dayNum).padStart(2, '0')}`;
      const dayComp = completions[dateKey] || {};

      const scheduledForDay = activeHabits.filter((h) => isHabitScheduledForDate(h, day));
      let completedCount = 0;
      scheduledForDay.forEach((h) => {
        if (dayComp[h.id]) completedCount++;
      });

      const totalHabits = scheduledForDay.length;
      // If 0 habits are scheduled for this day, it's considered 100% complete (rest day)
      const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 100;

      return {
        date: day,
        dayNum,
        dateKey,
        completedCount,
        totalHabits,
        percentage,
        dayNameShort: SPANISH_WEEKDAYS_SHORT[day.getDay()],
      };
    });
  }, [days, activeHabits, completions, monthKey]);

  // Overall Monthly Stats
  const monthlyStats = useMemo(() => {
    const today = new Date();
    const isCurrent = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
    const daysToEvaluate = isCurrent
      ? dailyData.filter((d) => d.dayNum <= today.getDate())
      : dailyData;

    let totalPossible = 0;
    let totalCompleted = 0;
    let perfectDays = 0;

    daysToEvaluate.forEach((d) => {
      totalPossible += d.totalHabits;
      totalCompleted += d.completedCount;
      if (d.totalHabits > 0 && d.completedCount === d.totalHabits) {
        perfectDays++;
      }
    });

    const averageRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Calculate longest consecutive streak in this month
    let maxStreak = 0;
    let currentRun = 0;
    daysToEvaluate.forEach((d) => {
      if (d.percentage >= 50) {
        currentRun++;
        if (currentRun > maxStreak) maxStreak = currentRun;
      } else {
        currentRun = 0;
      }
    });

    return {
      averageRate,
      perfectDays,
      totalCompleted,
      maxStreak,
      daysEvaluatedCount: daysToEvaluate.length,
    };
  }, [dailyData, currentYear, currentMonth]);

  // Scrubber interactive point state (defaulting to latest evaluated day or today)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // SVG Chart Geometry calculations
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;

  const points = useMemo(() => {
    if (dailyData.length === 0) return [];
    const stepX = chartInnerWidth / (dailyData.length - 1);

    return dailyData.map((d, index) => {
      const x = paddingX + index * stepX;
      const y = paddingTop + chartInnerHeight - (d.percentage / 100) * chartInnerHeight;
      return { x, y, ...d };
    });
  }, [dailyData, chartInnerWidth, chartInnerHeight]);

  // Generate smooth SVG curve path (Catmull-Rom or Cubic Bezier)
  const { pathD, areaD } = useMemo(() => {
    if (points.length < 2) return { pathD: '', areaD: '' };

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Smooth cubic bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const groundY = paddingTop + chartInnerHeight;
    const area = `${d} L ${lastPt.x} ${groundY} L ${firstPt.x} ${groundY} Z`;

    return { pathD: d, areaD: area };
  }, [points, chartInnerHeight]);

  // Scrubber touch/mouse handler
  const handleChartInteraction = (clientX: number) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, relativeX / rect.width));
    const targetIndex = Math.round(percent * (dailyData.length - 1));
    if (targetIndex >= 0 && targetIndex < dailyData.length) {
      setHoveredIndex(targetIndex);
    }
  };

  const selectedPoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Apple Fitness Style Top Stats Overview Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/20 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Consistencia en {monthTitle}
              </h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  {monthlyStats.averageRate}%
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  promedio mensual
                </span>
              </div>
            </div>
          </div>

          {/* Mini Ring Graphic */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="19"
                className="text-neutral-100 dark:text-neutral-800"
                strokeWidth="4.5"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                className="text-[#007AFF] transition-all duration-1000 ease-out"
                strokeWidth="4.5"
                strokeDasharray="119.38"
                strokeDashoffset={119.38 - (119.38 * monthlyStats.averageRate) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-neutral-800 dark:text-white">
              {monthlyStats.averageRate}%
            </span>
          </div>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/5 dark:border-white/5 text-center">
          <div className="p-2 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/50">
            <div className="flex items-center justify-center space-x-1 text-emerald-500 mb-0.5">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Días 100%</span>
            </div>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {monthlyStats.perfectDays}
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/50">
            <div className="flex items-center justify-center space-x-1 text-amber-500 mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-[11px] font-semibold">Mejor Racha</span>
            </div>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {monthlyStats.maxStreak} d
            </p>
          </div>

          <div className="p-2 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/50">
            <div className="flex items-center justify-center space-x-1 text-[#007AFF] mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Completados</span>
            </div>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {monthlyStats.totalCompleted}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Monthly SVG Area Chart */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white tracking-tight">
              Evolución Diaria
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Desliza sobre la gráfica para inspeccionar cada día
            </p>
          </div>

          {selectedPoint && (
            <div className="text-right">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Día {selectedPoint.dayNum} ({selectedPoint.dayNameShort})
              </span>
              <p className="text-base font-bold text-[#007AFF] dark:text-[#0A84FF]">
                {selectedPoint.percentage}% ({selectedPoint.completedCount}/{selectedPoint.totalHabits})
              </p>
            </div>
          )}
        </div>

        {/* SVG Curve Container */}
        <div
          ref={chartContainerRef}
          onMouseMove={(e) => handleChartInteraction(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) handleChartInteraction(e.touches[0].clientX);
          }}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative w-full cursor-crosshair select-none touch-none pt-2"
        >
          <svg
            className="w-full h-44 overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="appleChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007AFF" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#007AFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 50, 100].map((val) => {
              const y = paddingTop + chartInnerHeight - (val / 100) * chartInnerHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-neutral-200 dark:text-neutral-800"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-neutral-400 dark:fill-neutral-600 font-medium"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#appleChartGrad)" />}

            {/* Main Smooth Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#007AFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Individual Day Dot Markers */}
            {points.map((p, idx) => {
              const isHovered = selectedPoint && selectedPoint.dayNum === p.dayNum;
              return (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 2.5}
                  fill={isHovered ? '#FFFFFF' : '#007AFF'}
                  stroke={isHovered ? '#007AFF' : 'none'}
                  strokeWidth={isHovered ? 3 : 0}
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Interactive Vertical Scrubber line */}
            {selectedPoint && (
              <line
                x1={selectedPoint.x}
                y1={paddingTop}
                x2={selectedPoint.x}
                y2={paddingTop + chartInnerHeight}
                stroke="#007AFF"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-70"
              />
            )}

            {/* X-axis Day labels (sample intervals: 1, 5, 10, 15, 20, 25, end) */}
            {points.map((p) => {
              const isSignificant =
                p.dayNum === 1 ||
                p.dayNum === 5 ||
                p.dayNum === 10 ||
                p.dayNum === 15 ||
                p.dayNum === 20 ||
                p.dayNum === 25 ||
                p.dayNum === dailyData.length;

              if (!isSignificant) return null;

              return (
                <text
                  key={p.dayNum}
                  x={p.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-neutral-400 dark:fill-neutral-500"
                >
                  {p.dayNum}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 3. Apple Health Activity Heatmap Calendar Grid */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white tracking-tight">
              Matriz del Mes
            </h3>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Toca un día para revisarlo
          </span>
        </div>

        {/* Day name headers: Dom Lun Mar Mié Jue Vie Sáb */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {SPANISH_WEEKDAYS_SHORT.map((wd) => (
            <span
              key={wd}
              className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Day cells with leading empty slots for month alignment */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty offset days */}
          {Array.from({ length: days[0].getDay() }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-9 sm:h-10 rounded-xl opacity-0" />
          ))}

          {dailyData.map((d) => {
            const isPerfect = d.totalHabits > 0 && d.completedCount === d.totalHabits;
            const isPartial = d.completedCount > 0;

            // Heatmap color logic
            let bgClass = 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400';
            if (isPerfect) {
              bgClass = 'bg-[#34C759] text-white font-bold shadow-sm shadow-emerald-500/20';
            } else if (d.percentage >= 75) {
              bgClass = 'bg-[#007AFF] text-white font-bold';
            } else if (d.percentage >= 40) {
              bgClass = 'bg-blue-400/80 dark:bg-blue-600/70 text-white font-medium';
            } else if (isPartial) {
              bgClass = 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';
            }

            return (
              <button
                key={d.dateKey}
                id={`heatmap-day-${d.dayNum}`}
                onClick={() => {
                  playHapticClick(soundEnabled);
                  if (onSelectDay) onSelectDay(d.date);
                }}
                className={`h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:scale-90 hover:ring-2 hover:ring-blue-500/50 ${bgClass}`}
                title={`Día ${d.dayNum}: ${d.completedCount} de ${d.totalHabits} completados (${d.percentage}%)`}
              >
                <span className="text-xs leading-none">{d.dayNum}</span>
                {d.totalHabits > 0 && (
                  <span className="text-[9px] opacity-80 leading-none mt-0.5">
                    {d.completedCount}/{d.totalHabits}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
            <span>0%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-900" />
            <span>50%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#007AFF]" />
            <span>75%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#34C759]" />
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 4. Per-Habit Breakdown */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white tracking-tight mb-4">
          Rendimiento por Hábito
        </h3>

        <div className="space-y-4">
          {activeHabits.map((habit) => {
            const colorDef = APPLE_COLORS[habit.color] || APPLE_COLORS.blue;
            const scheduleBadge = getHabitScheduleBadge(habit);
            const scheduledDaysCount = countScheduledDaysInMonth(habit, days);

            // Count completions in this month on scheduled days
            let doneDays = 0;
            dailyData.forEach((d) => {
              if (isHabitScheduledForDate(habit, d.date)) {
                const comp = completions[d.dateKey];
                if (comp && comp[habit.id]) doneDays++;
              }
            });

            const percent =
              scheduledDaysCount > 0 ? Math.round((doneDays / scheduledDaysCount) * 100) : 0;

            return (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-base shrink-0">{habit.icon}</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {habit.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0 font-medium">
                      {scheduleBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 font-medium shrink-0 ml-2">
                    <span>
                      {doneDays} de {scheduledDaysCount} {scheduledDaysCount === 1 ? 'día' : 'días'}
                    </span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Apple Rounded Progress Bar */}
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: colorDef.light }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
