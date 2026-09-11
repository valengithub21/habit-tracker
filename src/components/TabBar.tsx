import React from 'react';
import { CheckCircle2, TrendingUp, Settings } from 'lucide-react';
import { playHapticClick } from '../utils/audio';

export type TabType = 'today' | 'progress' | 'settings';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  soundEnabled: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onChangeTab, soundEnabled }) => {
  const tabs = [
    { id: 'today' as TabType, label: 'Hoy', icon: CheckCircle2 },
    { id: 'progress' as TabType, label: 'Progreso', icon: TrendingUp },
    { id: 'settings' as TabType, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 ios-blur bg-white/80 dark:bg-black/80 border-t border-black/5 dark:border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => {
                playHapticClick(soundEnabled);
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-[#007AFF] dark:text-[#0A84FF]'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
