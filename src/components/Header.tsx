import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Shield, Settings as SettingsIcon, Check, Sparkles } from 'lucide-react';
import { NightOwlLogo } from './NightOwlLogo';
import { Chat } from '../types';

interface HeaderProps {
  currentChat: Chat | null;
  allChats: Chat[];
  onSelectChat: (chatId: string) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChat,
  allChats,
  onSelectChat,
  onOpenImport,
  onOpenSettings,
  onOpenPrivacy,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070a12]/85 backdrop-blur-xl border-b border-slate-800/80 px-3.5 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <NightOwlLogo size={30} />
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white leading-none whitespace-nowrap">
              NightOwl<span className="text-violet-400">.ai</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
              Decoded by morning
            </span>
          </div>
        </div>

        {/* Zone 2: Chat Selector & Mode Status */}
        <div className="flex items-center gap-2 relative min-w-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm max-w-[150px] sm:max-w-xs min-h-[36px]"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                currentChat ? (currentChat.isSampleData ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-600'
              }`}
            />
            <span className="truncate">{currentChat ? currentChat.displayName : 'No Active Chat'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Chat Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Conversations
              </div>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {allChats.length === 0 ? (
                  <div className="px-2.5 py-3 text-xs text-slate-500 italic text-center">
                    No chats in storage
                  </div>
                ) : (
                  allChats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectChat(c.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-xl transition-colors text-left ${
                        currentChat && c.id === currentChat.id
                          ? 'bg-violet-600/20 text-violet-200 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate font-medium">{c.displayName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {c.messageCount} msgs · {c.isSampleData ? 'Demo' : 'Imported'}
                        </div>
                      </div>
                      {currentChat && c.id === currentChat.id && (
                        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="mt-1 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenImport();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-violet-300 hover:text-violet-200 hover:bg-violet-950/40 rounded-xl transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import New Chat...</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode Tag (Text on Desktop, minimal icon on tablet) */}
          {currentChat && (
            currentChat.isSampleData ? (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-300/90 font-mono">
                <Sparkles className="w-3 h-3 text-amber-400" /> Demo Mode
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-300/90 font-mono">
                <Shield className="w-3 h-3 text-emerald-400" /> 100% Local
              </span>
            )
          )}
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-sm active:scale-95 min-h-[36px]"
            title="Import exported chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Privacy Center"
            aria-label="Privacy Center"
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
