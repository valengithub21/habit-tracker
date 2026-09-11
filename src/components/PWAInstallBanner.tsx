import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playHapticClick } from '../utils/audio';

interface PWAInstallBannerProps {
  soundEnabled: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ soundEnabled }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide
  if (isInstalled || dismissed) return null;

  return (
    <>
      {/* Subtle Inset Card Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20 border border-blue-500/20 rounded-3xl p-4 mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight truncate">
              Instalar Habit Tracker (PWA)
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
              Úsalo a pantalla completa como una app nativa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {isInstallable && (
            <button
              id="pwa-install-app-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                install();
              }}
              className="px-3 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0071EB] text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              Instalar
            </button>
          )}

          {isIOS && (
            <button
              id="pwa-ios-guide-btn"
              onClick={() => {
                playHapticClick(soundEnabled);
                setShowIOSGuide(true);
              }}
              className="px-3 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-sm transition active:scale-95"
            >
              Cómo en iOS
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSGuide(false)}
              className="fixed inset-0 bg-black/60 ios-blur"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C1C1E] p-6 shadow-2xl border border-black/10 dark:border-white/10 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-[#007AFF] flex items-center justify-center mx-auto mb-4">
                <Share className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-center text-neutral-900 dark:text-white">
                Instalar en iPhone o iPad
              </h3>

              <div className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/60">
                  <span className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <p>
                    Toca el botón <strong>Compartir</strong> <Share className="w-4 h-4 inline mx-1" /> en la barra inferior de Safari.
                  </p>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#2C2C2E]/60">
                  <span className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <p>
                    Baja en las opciones y selecciona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="w-4 h-4 inline mx-1" />.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-[#007AFF] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0071EB] active:scale-95 transition"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
