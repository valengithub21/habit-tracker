import React, { useState } from 'react';
import { Bell, Volume2, RefreshCw, Trash2, Info, Check, ShieldCheck } from 'lucide-react';
import { NotificationConfig } from '../types';
import { playHapticClick, playHabitCompleteSound } from '../utils/audio';
import { requestNotificationPermission, showHabitNotification } from '../utils/notifications';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  notificationConfig: NotificationConfig;
  onUpdateNotifications?: (cfg: NotificationConfig) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onResetDemoData?: () => void;
  onClearAllData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  notificationConfig,
  onUpdateNotifications,
  soundEnabled = false,
  onToggleSound,
  onResetDemoData,
  onClearAllData,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [testSent, setTestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleTestNotification = () => {
    playHapticClick(soundEnabled);
    playHabitCompleteSound(soundEnabled);
    showHabitNotification(
      '✨ Recordatorio Habit Tracker',
      '¡Hola! Recuerda registrar tus hábitos completados del día para mantener tu racha.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const handleNotificationToggle = async () => {
    playHapticClick(soundEnabled);
    if (!notificationConfig.enabled) {
      const granted = await requestNotificationPermission();
      onUpdateNotifications?.({
        ...notificationConfig,
        enabled: granted,
        hasPermission: granted,
      });
      if (granted) {
        showHabitNotification(
          '🔔 Notificaciones activadas',
          `Te avisaremos diariamente a las ${notificationConfig.time}.`
        );
      }
    } else {
      onUpdateNotifications?.({
        ...notificationConfig,
        enabled: false,
      });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Recordatorios Diarios */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1">
          Notificaciones y Recordatorios
        </h3>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Recordatorio Diario
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Aviso para completar hábitos
              </p>
            </div>
          </div>

          <button
            id="settings-notification-toggle"
            type="button"
            onClick={handleNotificationToggle}
            className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
              notificationConfig.enabled ? 'bg-[#34C759]' : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                notificationConfig.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Time setting */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Hora del aviso
          </span>
          <input
            id="settings-time-picker"
            type="time"
            value={notificationConfig.time}
            onChange={(e) => {
              playHapticClick(soundEnabled);
              onUpdateNotifications?.({ ...notificationConfig, time: e.target.value });
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          />
        </div>

        {/* Test Notification Button */}
        <div className="pt-2">
          <button
            id="settings-test-notification-btn"
            onClick={handleTestNotification}
            className="w-full py-2.5 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3C3C3E] text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] transition active:scale-95 flex items-center justify-center space-x-1.5"
          >
            {testSent ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Notificación enviada</span>
              </>
            ) : (
              <span>Probar notificación ahora</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Estado PWA */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-[#007AFF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Modo Offline (PWA)
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isInstalled
                  ? 'Aplicación instalada en pantalla de inicio'
                  : 'Listo para instalarse en tu dispositivo'}
              </p>
            </div>
          </div>

          {isInstallable && (
            <button
              onClick={() => {
                playHapticClick(soundEnabled);
                install();
              }}
              className="px-3 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold shadow-sm active:scale-95 transition"
            >
              Instalar
            </button>
          )}
        </div>
      </div>

      {/* 5. Gestión de Datos */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 border border-black/5 dark:border-white/10 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1">
          Datos de la Aplicación
        </h3>

        <button
          id="reset-demo-habits-btn"
          onClick={() => {
            playHapticClick(soundEnabled);
            onResetDemoData?.();
            setResetSuccess(true);
            setTimeout(() => setResetSuccess(false), 2000);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3C3C3E] text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between transition active:scale-95"
        >
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-neutral-500" />
            <span>Restablecer hábitos de demostración</span>
          </div>
          {resetSuccess && <Check className="w-4 h-4 text-emerald-500" />}
        </button>

        <button
          id="clear-all-data-btn"
          onClick={() => {
            if (confirm('¿Deseas borrar todos los hábitos y registros guardados?')) {
              playHapticClick(soundEnabled);
              onClearAllData?.();
            }
          }}
          className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-2.5 transition active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          <span>Borrar todos los registros</span>
        </button>
      </div>

      {/* 6. Apple Specs Footer */}
      <div className="text-center py-2 text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center space-x-1">
        <Info className="w-3.5 h-3.5" />
        <span>Habit Tracker • Estilo Apple San Francisco • PWA Offline</span>
      </div>
    </div>
  );
};
