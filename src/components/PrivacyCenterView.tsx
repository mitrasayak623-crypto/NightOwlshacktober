import React, { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Lock,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Cpu,
  Layers,
  Terminal,
  Smartphone,
  Apple,
  Globe,
  Info,
} from 'lucide-react';
import { Chat } from '../types';
import { StorageService } from '../services/storage';
import { ON_DEVICE_INTEGRATION_SPEC, aiEngineManager } from '../services/aiEngine';

interface PrivacyCenterViewProps {
  currentChat: Chat | null;
  allChats: Chat[];
  onDeleteCurrentChat: () => void;
  onClearDemoData: () => void;
  onResetDemoData: () => void;
  onNuclearWipe: () => void;
  onOpenImport: () => void;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  currentChat,
  allChats,
  onDeleteCurrentChat,
  onClearDemoData,
  onResetDemoData,
  onNuclearWipe,
}) => {
  const [confirmWipeModal, setConfirmWipeModal] = useState(false);
  const [confirmDeleteChatModal, setConfirmDeleteChatModal] = useState(false);
  const [specTab, setSpecTab] = useState<'android' | 'ios' | 'web' | 'unimplemented'>('android');

  const footprint = StorageService.getStorageFootprint();
  const activeEngineInfo = aiEngineManager.getEngine(currentChat?.isSampleData).getRuntimeInfo();

  return (
    <div className="space-y-5 pb-6">
      {/* Top Header */}
      <div className="pt-1">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Cloud Privacy & Architecture</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1 tracking-tight">
          Privacy Center & AI Engine Runtime
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Audit on-device processing guarantees, native runtime integration boundaries, and local data storage.
        </p>
      </div>

      {/* Active Processing Runtime Card */}
      <section className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Active Engine: {activeEngineInfo.displayName}
            </span>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
              activeEngineInfo.isDemo
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Lock className="w-3 h-3" />
            {activeEngineInfo.isDemo ? 'Demo Mode (Offline Fictional)' : 'Local On-Device AI Engine'}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero Cloud Ingestion:</strong> Your messages, sender names, contacts, and timestamps never leave your device. Parsing and extraction occur strictly in local browser memory.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">No External LLM Telemetry:</strong> NightOwl does not transmit personal chats to OpenAI, Anthropic, or external cloud inference APIs.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Typed Model Boundary:</strong> The application interface is decoupled from any single model runtime through the <code className="text-violet-300">IAIEngineService</code> abstraction.
            </div>
          </div>
        </div>
      </section>

      {/* On-Device Mobile Runtime Integration Blueprint */}
      <section className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-display text-white">
              On-Device Android & iOS Runtime Specification
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            LiteRT-LM / MediaPipe Bridge Spec
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          NightOwl AI’s architecture is engineered to run models locally on mobile hardware without network dependency. Below is the exact integration blueprint and dependency requirements for deploying to native Android and iOS apps.
        </p>

        {/* Spec Platform Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSpecTab('android')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              specTab === 'android'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (LiteRT-LM)</span>
          </button>

          <button
            onClick={() => setSpecTab('ios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              specTab === 'ios'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS (MediaPipe GenAI)</span>
          </button>

          <button
            onClick={() => setSpecTab('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              specTab === 'web'
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web (WebGPU / MLC)</span>
          </button>

          <button
            onClick={() => setSpecTab('unimplemented')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              specTab === 'unimplemented'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Unimplemented Scope</span>
          </button>
        </div>

        {/* Tab Detail Panels */}
        {specTab === 'android' && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-violet-300 font-mono text-[11px] uppercase">
              Android Native Integration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <strong className="text-slate-400 block text-[11px]">Recommended SDK:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.android.recommendedSdk}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Gradle Dependency:</strong>
                <code className="text-violet-300 font-mono text-[11px] block truncate">
                  {ON_DEVICE_INTEGRATION_SPEC.android.packageDependency}
                </code>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Recommended Models:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.android.recommendedModels}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Hardware Acceleration:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.android.accelerationDelegate}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Minimum Hardware:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.android.minRam}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">IPC Bridge Point:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.android.integrationPoint}</span>
              </div>
            </div>
          </div>
        )}

        {specTab === 'ios' && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-violet-300 font-mono text-[11px] uppercase">
              iOS Native Integration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <strong className="text-slate-400 block text-[11px]">Recommended SDK:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.ios.recommendedSdk}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">CocoaPods / Swift Package:</strong>
                <code className="text-violet-300 font-mono text-[11px] block">
                  {ON_DEVICE_INTEGRATION_SPEC.ios.podDependency}
                </code>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Recommended Models:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.ios.recommendedModels}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Hardware Acceleration:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.ios.accelerationDelegate}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Minimum Hardware:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.ios.minRam}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">IPC Bridge Point:</strong>
                <code className="text-cyan-300 font-mono text-[10px] block break-all">
                  {ON_DEVICE_INTEGRATION_SPEC.ios.integrationPoint}
                </code>
              </div>
            </div>
          </div>
        )}

        {specTab === 'web' && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-violet-300 font-mono text-[11px] uppercase">
              Web Browser Runtime (WebGPU)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <strong className="text-slate-400 block text-[11px]">Library:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.web.recommendedSdk}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">NPM Package:</strong>
                <code className="text-violet-300 font-mono text-[11px] block">
                  {ON_DEVICE_INTEGRATION_SPEC.web.packageDependency}
                </code>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Quantized Models:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.web.recommendedModels}</span>
              </div>
              <div>
                <strong className="text-slate-400 block text-[11px]">Hardware Prerequisite:</strong>
                <span>{ON_DEVICE_INTEGRATION_SPEC.web.hardwareRequirement}</span>
              </div>
            </div>
          </div>
        )}

        {specTab === 'unimplemented' && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 text-xs text-amber-200">
            <div className="font-semibold text-amber-300 font-mono text-[11px] uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Unimplemented In This Prototype Environment</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              To avoid misrepresenting capabilities, the following platform layers are intentionally not bundled inside this web preview container:
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-amber-100">
              {ON_DEVICE_INTEGRATION_SPEC.unimplementedInThisEnvironment.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Storage Audit Telemetry */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Local Storage</div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">{footprint.formatted}</div>
          <div className="text-[10px] text-slate-400">Sandbox memory</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Stored Chats</div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">{allChats.length}</div>
          <div className="text-[10px] text-slate-400">In local index</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Total Messages</div>
          <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">{footprint.messageCount}</div>
          <div className="text-[10px] text-slate-400">Indexed locally</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Cloud Leaks</div>
          <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono tabular-nums">0 bytes</div>
          <div className="text-[10px] text-slate-400">Zero telemetry</div>
        </div>
      </section>

      {/* Selected Chat Information */}
      <section className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Selected Chat: {currentChat ? currentChat.displayName : 'None Active'}
        </h2>

        {currentChat ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px]">Source Format:</span>
                <div className="font-mono text-slate-200 uppercase">{currentChat.sourceFormat}</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px]">Import Date:</span>
                <div className="font-mono text-slate-200">
                  {new Date(currentChat.importedAt).toLocaleDateString()} at{' '}
                  {new Date(currentChat.importedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setConfirmDeleteChatModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete This Chat From Device</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-500 italic">
            No conversation is currently loaded.
          </div>
        )}
      </section>

      {/* Data Governance & Vault Controls */}
      <section className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Data Governance & Vault Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Demo Controls */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-slate-200 text-xs">Sample Data Controls</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Toggle the fictional Hackathon Team demo dataset on or off.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onClearDemoData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                Hide Demo
              </button>
              <button
                onClick={onResetDemoData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-violet-300 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Nuclear Wipe */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-rose-300 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Nuclear Wipe (Clear Everything)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Permanently purge all imported chats, parsed transcripts, tasks, summaries, and settings from browser storage.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setConfirmWipeModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/50 transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Local Data</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal for Delete Single Chat */}
      {confirmDeleteChatModal && currentChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white font-display">
              Delete "{currentChat.displayName}"?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will erase all {currentChat.messageCount} messages, extracted tasks, and generated briefs for this chat from local browser storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteChatModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDeleteChatModal(false);
                  onDeleteCurrentChat();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Nuclear Wipe */}
      {confirmWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Nuclear Wipe Warning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently clear all imported files, tasks, summaries, and demo data from this device?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmWipeModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmWipeModal(false);
                  onNuclearWipe();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
