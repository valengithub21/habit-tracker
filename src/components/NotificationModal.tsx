import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Clock, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { NotificationConfig } from '../types';
import { requestNotificationPermission, showHabitNotification } from '../utils/notifications';
import { playHabitCompleteSound, playHapticClick } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotificationConfig;
  onUpdateConfig: (cfg: NotificationConfig) => void;
  soundEnabled: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  soundEnabled,
}) => {
  const [testSent, setTestSent] = useState(false);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleToggleEnable = async () => {
    playHapticClick(soundEnabled);
    if (!config.enabled) {
      const granted = await requestNotificationPermission();
      setPermissionState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
      onUpdateConfig({
        ...config,
        enabled: granted,
        hasPermission: granted,
      });
      if (granted) {
        showHabitNotification(
          '🔔 Notificaciones activadas',
          `Te recordaremos cada día a las ${config.time} completar tus hábitos.`
        );
      }
    } else {
      onUpdateConfig({
        ...config,
        enabled: false,
      });
    }
  };

  const handleTestNotification = () => {
    playHapticClick(soundEnabled);
    playHabitCompleteSound(soundEnabled);
    const sent = showHabitNotification(
      '✨ Recordatorio de Hábitos',
      '¡Es momento de marcar los hábitos completados de hoy! Tu racha te espera.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
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

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-black/5 dark:border-white/10 z-10"
          >
            {/* Grabber */}
            <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mb-5 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    Recordatorios Diarios
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Avisos para registrar tus hábitos cada día
                  </p>
                </div>
              </div>

              <button
                id="close-notifications-modal-btn"
                onClick={() => {
                  playHapticClick(soundEnabled);
                  onClose();
                }}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
              {/* Permission Banner if denied */}
              {permissionState === 'denied' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Permisos bloqueados en el navegador:</span>
                    <p className="mt-0.5 opacity-90">
                      Debes habilitar las notificaciones en los ajustes de tu navegador o sitio para recibir alertas diarias.
                    </p>
                  </div>
                </div>
              )}

              {/* Toggle Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/70">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Activar Notificaciones
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Recibe un aviso a tu hora preferida
                  </p>
                </div>

                {/* Cupertino Switch */}
                <button
                  id="toggle-notifications-switch"
                  type="button"
                  onClick={handleToggleEnable}
                  className={`relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                    config.enabled ? 'bg-[#34C759]' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: config.enabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              {/* Time Selector Row */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/70">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Hora del Recordatorio
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Momento ideal para repasar el día
                    </p>
                  </div>
                </div>

                <input
                  id="notification-time-input"
                  type="time"
                  value={config.time}
                  onChange={(e) => {
                    playHapticClick(soundEnabled);
                    onUpdateConfig({ ...config, time: e.target.value });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              {/* Test Button */}
              <button
                id="test-notification-btn"
                type="button"
                onClick={handleTestNotification}
                className="w-full py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#2C2C2E] hover:bg-neutral-200 dark:hover:bg-[#3C3C3E] active:scale-95 text-[#007AFF] dark:text-[#0A84FF] font-semibold text-sm transition flex items-center justify-center space-x-2"
              >
                {testSent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">¡Notificación enviada!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enviar Notificación de Prueba</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer button */}
            <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071EB] text-white font-semibold text-sm transition active:scale-95 shadow-md shadow-blue-500/20"
              >
                Listo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
