import React from 'react';
import { Sun, CheckSquare, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export type NavTab = 'brief' | 'tasks' | 'ask' | 'intelligence' | 'privacy';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openTasksCount: number;
  openQuestionsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  openTasksCount,
  openQuestionsCount,
}) => {
  const tabs = [
    {
      id: 'brief' as NavTab,
      label: 'Morning Brief',
      icon: Sun,
      badge: null,
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: openTasksCount > 0 ? openTasksCount : null,
    },
    {
      id: 'ask' as NavTab,
      label: 'Ask Chat',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'intelligence' as NavTab,
      label: 'Intel',
      icon: Compass,
      badge: openQuestionsCount > 0 ? openQuestionsCount : null,
    },
    {
      id: 'privacy' as NavTab,
      label: 'Privacy',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#070a12]/92 backdrop-blur-xl border-t border-slate-800/80 px-2 pb-safe"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-5 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all relative select-none ${
                isActive
                  ? 'text-violet-300'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 text-violet-400 stroke-[2.3]' : 'stroke-[1.7]'
                  }`}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-violet-600 text-white text-[9px] font-bold font-mono px-1 rounded-full min-w-[15px] h-[15px] flex items-center justify-center ring-2 ring-[#070a12] tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate font-medium transition-colors ${
                  isActive ? 'text-violet-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
