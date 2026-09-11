import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Calendar, Repeat, SlidersHorizontal, Info } from 'lucide-react';
import { Habit, AppleColor } from '../types';
import { APPLE_COLORS } from '../utils/colors';
import { formatMonthTitle, SPANISH_WEEKDAYS_FULL } from '../utils/date';
import { playHapticClick } from '../utils/audio';
import {
  DAYS_OF_WEEK_ORDERED,
  ALL_DAYS_ARRAY,
  WEEKDAYS_ARRAY,
  WEEKENDS_ARRAY,
  getHabitScheduleBadge,
} from '../utils/habitSchedule';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onEditHabit?: (habitId: string, updated: Partial<Habit>) => void;
  habitToEdit?: Habit | null;
  currentYear: number;
  currentMonth: number;
  soundEnabled: boolean;
}

const COMMON_ICONS = ['🧘', '💧', '🏃', '📚', '🌙', '⚡', '🍎', '🎯', '💻', '🌿', '🎨', '🚴', '🎸', '✍️', '☕', '🧠'];
const CATEGORIES = ['Salud', 'Productividad', 'Mente', 'Estilo de vida'] as const;
const COLOR_KEYS: AppleColor[] = ['blue', 'green', 'orange', 'pink', 'purple', 'indigo', 'teal', 'yellow', 'red'];

type FrequencyMode = 'all' | 'custom_weekdays' | 'specific_month_day';

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
  onEditHabit,
  habitToEdit,
  currentYear,
  currentMonth,
  soundEnabled,
}) => {
  const isEditing = !!habitToEdit;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✨');
  const [color, setColor] = useState<AppleColor>('blue');
  const [category, setCategory] = useState<'Salud' | 'Productividad' | 'Mente' | 'Estilo de vida'>('Salud');
  const [customIconInput, setCustomIconInput] = useState('');

  // Scheduling state
  const [frequencyMode, setFrequencyMode] = useState<FrequencyMode>('all');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>(ALL_DAYS_ARRAY);
  const [specificMonthDay, setSpecificMonthDay] = useState<number>(1);

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTitle = formatMonthTitle(currentYear, currentMonth);

  // Sync state whenever modal opens or habitToEdit changes
  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setIcon(habitToEdit.icon || '✨');
      setColor(habitToEdit.color || 'blue');
      setCategory(habitToEdit.category || 'Salud');
      setCustomIconInput('');

      if (habitToEdit.specificDayOfMonth && habitToEdit.specificDayOfMonth > 0) {
        setFrequencyMode('specific_month_day');
        setSpecificMonthDay(habitToEdit.specificDayOfMonth);
        setSelectedDaysOfWeek(ALL_DAYS_ARRAY);
      } else if (
        habitToEdit.daysOfWeek &&
        habitToEdit.daysOfWeek.length > 0 &&
        habitToEdit.daysOfWeek.length < 7
      ) {
        setFrequencyMode('custom_weekdays');
        setSelectedDaysOfWeek(habitToEdit.daysOfWeek);
        setSpecificMonthDay(1);
      } else {
        setFrequencyMode('all');
        setSelectedDaysOfWeek(ALL_DAYS_ARRAY);
        setSpecificMonthDay(1);
      }
    } else {
      // Defaults for a new habit: by default appears EVERY day
      setName('');
      setIcon('✨');
      setColor('blue');
      setCategory('Salud');
      setCustomIconInput('');
      setFrequencyMode('all');
      setSelectedDaysOfWeek(ALL_DAYS_ARRAY);
      setSpecificMonthDay(1);
    }
  }, [habitToEdit, isOpen]);

  const handleToggleDay = (dayId: number) => {
    playHapticClick(soundEnabled);
    setSelectedDaysOfWeek((prev) => {
      if (prev.includes(dayId)) {
        // Prevent deselecting everything: keep at least 1 day
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const handleSelectSingleDay = (dayId: number) => {
    playHapticClick(soundEnabled);
    setFrequencyMode('custom_weekdays');
    setSelectedDaysOfWeek([dayId]);
  };

  const handleSelectPreset = (preset: 'all' | 'weekdays' | 'weekends') => {
    playHapticClick(soundEnabled);
    if (preset === 'all') {
      setFrequencyMode('all');
      setSelectedDaysOfWeek(ALL_DAYS_ARRAY);
    } else if (preset === 'weekdays') {
      setFrequencyMode('custom_weekdays');
      setSelectedDaysOfWeek(WEEKDAYS_ARRAY);
    } else {
      setFrequencyMode('custom_weekdays');
      setSelectedDaysOfWeek(WEEKENDS_ARRAY);
    }
  };

  // Preview badge calculation for user clarity
  const previewHabit: Habit = {
    id: 'preview',
    name: name || 'Hábito',
    icon,
    color,
    category,
    monthKey,
    createdAt: '',
    daysOfWeek: frequencyMode === 'all' ? ALL_DAYS_ARRAY : frequencyMode === 'custom_weekdays' ? selectedDaysOfWeek : undefined,
    specificDayOfMonth: frequencyMode === 'specific_month_day' ? specificMonthDay : undefined,
  };
  const scheduleBadge = getHabitScheduleBadge(previewHabit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playHapticClick(soundEnabled);

    const habitPayload = {
      name: name.trim(),
      icon: customIconInput.trim() || icon,
      color,
      category,
      monthKey,
      targetDaysPerWeek:
        frequencyMode === 'all'
          ? 7
          : frequencyMode === 'custom_weekdays'
          ? selectedDaysOfWeek.length
          : 1,
      daysOfWeek:
        frequencyMode === 'all'
          ? ALL_DAYS_ARRAY
          : frequencyMode === 'custom_weekdays'
          ? selectedDaysOfWeek
          : undefined,
      specificDayOfMonth:
        frequencyMode === 'specific_month_day' ? specificMonthDay : undefined,
    };

    if (isEditing && habitToEdit && onEditHabit) {
      onEditHabit(habitToEdit.id, habitPayload);
    } else {
      onAddHabit(habitPayload);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 ios-blur"
          />

          {/* iOS Bottom Sheet / Centered Card */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-black/5 dark:border-white/10 z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* iOS Grabber */}
            <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mb-5 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <SlidersHorizontal className="w-5 h-5 text-[#007AFF]" />
                      <span>Configurar Hábito</span>
                    </>
                  ) : (
                    <span>Nuevo Hábito</span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isEditing ? 'Personaliza los días y detalles de este hábito' : `Para el mes de ${monthTitle}`}
                </p>
              </div>
              <button
                id="close-add-habit-modal-btn"
                type="button"
                onClick={() => {
                  playHapticClick(soundEnabled);
                  onClose();
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Habit Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Nombre del Hábito
                </label>
                <div className="relative">
                  <input
                    id="habit-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Salir a correr, Leer, Limpieza general..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-base font-medium transition"
                    autoFocus={!isEditing}
                  />
                </div>
              </div>

              {/* 2. FRECUENCIA / CONFIGURACIÓN DE DÍAS (Core feature requested) */}
              <div className="bg-neutral-50 dark:bg-[#2C2C2E]/60 p-4 rounded-3xl border border-black/5 dark:border-white/5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span>Frecuencia y Días Activos</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#007AFF] bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                    {scheduleBadge.label}
                  </span>
                </div>

                {/* Mode Selector: Todos los días vs Días específicos vs Día del mes */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-neutral-200/70 dark:bg-[#1C1C1E]">
                  <button
                    type="button"
                    onClick={() => {
                      setFrequencyMode('all');
                      setSelectedDaysOfWeek(ALL_DAYS_ARRAY);
                      playHapticClick(soundEnabled);
                    }}
                    className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
                      frequencyMode === 'all'
                        ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFrequencyMode('custom_weekdays');
                      playHapticClick(soundEnabled);
                    }}
                    className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
                      frequencyMode === 'custom_weekdays'
                        ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Días específicos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFrequencyMode('specific_month_day');
                      playHapticClick(soundEnabled);
                    }}
                    className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-xl transition-all ${
                      frequencyMode === 'specific_month_day'
                        ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Día del mes
                  </button>
                </div>

                {/* Sub-UI depending on Mode */}
                {frequencyMode === 'all' && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-1">
                    ✓ Este hábito aparecerá en tu lista todos los días de lunes a domingo de forma continua.
                  </p>
                )}

                {frequencyMode === 'custom_weekdays' && (
                  <div className="space-y-3 pt-1">
                    {/* Quick presets row */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                      <span className="text-[11px] font-medium text-neutral-400 shrink-0">Atajos:</span>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset('weekdays')}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium hover:text-[#007AFF] transition active:scale-95 shrink-0"
                      >
                        Entre semana (L-V)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset('weekends')}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium hover:text-[#007AFF] transition active:scale-95 shrink-0"
                      >
                        Fin de semana (S-D)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPreset('all')}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-medium hover:text-[#007AFF] transition active:scale-95 shrink-0"
                      >
                        Todos
                      </button>
                    </div>

                    {/* Interactive Apple-style Day Circle Selector */}
                    <div>
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {DAYS_OF_WEEK_ORDERED.map((day) => {
                          const isSelected = selectedDaysOfWeek.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => handleToggleDay(day.id)}
                              className={`flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-150 active:scale-90 ${
                                isSelected
                                  ? 'bg-[#007AFF] text-white shadow-sm shadow-blue-500/30'
                                  : 'bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-400 border border-black/5 dark:border-white/10 hover:border-[#007AFF]/40'
                              }`}
                            >
                              <span className="text-xs font-bold">{day.short}</span>
                              <span className="text-[10px] opacity-75">{day.initial}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick "Aparecer solo 1 día" selector */}
                      <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                          O elegir que aparezca solo 1 día:
                        </span>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                          {DAYS_OF_WEEK_ORDERED.map((day) => (
                            <button
                              key={`single-${day.id}`}
                              type="button"
                              onClick={() => handleSelectSingleDay(day.id)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                                selectedDaysOfWeek.length === 1 && selectedDaysOfWeek[0] === day.id
                                  ? 'bg-[#007AFF] text-white'
                                  : 'bg-neutral-200/80 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300'
                              }`}
                              title={`Solo los ${day.full}`}
                            >
                              {day.short}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {frequencyMode === 'specific_month_day' && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Selecciona qué día del mes debe aparecer este hábito (ej. el día 1 o día 15 de cada mes):
                    </p>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={specificMonthDay}
                        onChange={(e) => setSpecificMonthDay(Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1)))}
                        className="w-24 px-3 py-2 text-center rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-[#007AFF] focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        El día {specificMonthDay} de cada mes
                      </span>
                    </div>
                  </div>
                )}

                {/* Visual reminder footer */}
                <div className="flex items-center space-x-2 text-[11px] text-[#007AFF] dark:text-[#0A84FF] pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {scheduleBadge.isSingleDay
                      ? `Aparecerá en tu lista de Hoy únicamente cuando sea ese día.`
                      : scheduleBadge.isEveryday
                      ? `Aparecerá todos los días en tu pantalla de Hoy.`
                      : `Aparecerá en Hoy durante los ${scheduleBadge.daysCount} días seleccionados.`}
                  </span>
                </div>
              </div>

              {/* 3. Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Categoría
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E]">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playHapticClick(soundEnabled);
                        setCategory(cat);
                      }}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
                        category === cat
                          ? 'bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Icon Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Ícono o Emoji
                </label>
                <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/60 max-h-28 overflow-y-auto no-scrollbar">
                  {COMMON_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        playHapticClick(soundEnabled);
                        setIcon(emoji);
                        setCustomIconInput('');
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform active:scale-90 ${
                        icon === emoji && !customIconInput
                          ? 'bg-[#007AFF]/15 ring-2 ring-[#007AFF] scale-110'
                          : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Apple Color Palette */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Color Característico
                </label>
                <div className="flex items-center justify-between p-2 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/60 overflow-x-auto no-scrollbar gap-2">
                  {COLOR_KEYS.map((cKey) => {
                    const cDef = APPLE_COLORS[cKey];
                    const isSelected = color === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => {
                          playHapticClick(soundEnabled);
                          setColor(cKey);
                        }}
                        className="relative w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0"
                        style={{ backgroundColor: cDef.light }}
                        title={cDef.name}
                        aria-label={cDef.name}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Cancelar
                </button>
                <button
                  id="submit-add-habit-btn"
                  type="submit"
                  className="w-1/2 py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071EB] active:scale-95 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Hábito'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
