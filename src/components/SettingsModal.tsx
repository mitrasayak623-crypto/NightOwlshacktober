import React from 'react';
import { X, Settings as SettingsIcon, Sliders, Globe, Clock, ShieldCheck, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearDemoData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearDemoData,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSaveSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Application Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure local preferences and data retention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary Length Preference */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Summary Length Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['concise', 'balanced', 'detailed'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => handleChange('summaryLength', len)}
                  className={`p-2.5 rounded-xl text-xs font-medium border transition-colors capitalize ${
                    settings.summaryLength === len
                      ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>Interface & Extraction Language</span>
            </label>
            <select
              value={settings.preferredLanguage}
              onChange={(e) => handleChange('preferredLanguage', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          {/* Default Analysis Window */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span>Default Analysis Scope</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Messages' },
                { id: 'last_24h', label: 'Last 24 Hours' },
                { id: 'last_week', label: 'Last 7 Days' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleChange('defaultDateRange', opt.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    settings.defaultDateRange === opt.id
                      ? 'bg-violet-600 text-white border-violet-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* App Limitations & Disclosure */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="text-slate-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Platform Limitations & Disclosures</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              NightOwl AI operates strictly client-side without remote servers. Large files over 50,000 lines may require extra memory on low-power mobile devices. System notifications and background push alerts require native platform wrappers not present in browser environments.
            </p>
          </div>

          {/* Quick Clear Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs font-medium text-slate-400">Quick Reset Actions</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onClearDemoData();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                Clear Demo Data
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset All Local Storage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
