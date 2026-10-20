import React, { useState } from 'react';
import { ShieldCheck, Moon, ArrowRight, ArrowLeft, Upload, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { NightOwlLogo } from './NightOwlLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (action: 'demo' | 'import') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Progress step dots */}
        <div className="flex items-center justify-between mb-5">
          <NightOwlLogo size={32} showText />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'w-6 bg-violet-400' : s < step ? 'w-2 bg-violet-700' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                Sleep through the noise. <br />
                <span className="text-violet-400">Wake up knowing what matters.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Group chats overflow with hundreds of late-night messages, conflicting plans, and buried action items.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Concise 2-line morning brief for immediate situational awareness</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Extracted commitments, deadlines, and unanswered questions</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Every claim backed by clickable direct source message evidence</span>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Privacy Model */}
        {step === 2 && (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                Privacy-First Architecture. <br />
                <span className="text-emerald-400">Zero Cloud Uploads.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Your conversations stay on your device. We built NightOwl AI under strict zero-cloud privacy constraints.
              </p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>100% Local In-Browser Processing:</strong> Messages are parsed and analyzed purely within your local device memory.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No Remote AI or Cloud Sync:</strong> No files, prompts, names, or messages are ever transmitted to third-party AI APIs.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Instant Nuclear Purge:</strong> One-tap complete deletion wipes all imported data from browser storage instantly.</span>
              </div>
            </div>
          </div>
        )}

        {/* Screen 3: Choose Starting Point */}
        {step === 3 && (
          <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                How would you like to begin?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Explore our rich fictional sample dataset or import your own exported group chat file right away.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onComplete('demo')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-500/30 hover:border-violet-400 text-left transition-all active:scale-98 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-violet-400 uppercase font-mono font-medium">Recommended</span>
                </div>
                <div className="font-semibold text-white text-xs sm:text-sm">Explore Hackathon Demo</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  16 simulated messages with meeting confirmations, deadline assignments, and plan changes.
                </div>
              </button>

              <button
                onClick={() => setStep(4)}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-98 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Upload className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-semibold text-white text-xs sm:text-sm">Import My Own Chat</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports exported WhatsApp text (.txt) and structured JSON chat files.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Supported Formats & File Guide */}
        {step === 4 && (
          <div className="flex-1 space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                Supported File Types
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
                NightOwl parses your files directly in the browser with full line auditing.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-1">
                <div className="font-semibold text-cyan-300">1. WhatsApp Plain Text (.txt)</div>
                <p className="text-slate-400 text-[11px]">
                  Standard export format with bracketed or hyphenated timestamps:
                </p>
                <code className="block p-2 bg-slate-900 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto">
                  [10/19/26, 8:30:12 PM] Alex: Hey team!<br />
                  10/19/2026, 8:30 PM - Elena: Let us meet at 10 AM.
                </code>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-1">
                <div className="font-semibold text-cyan-300">2. Structured JSON (.json)</div>
                <p className="text-slate-400 text-[11px]">
                  JSON document with an array of message objects containing <code className="text-slate-300">timestamp</code>, <code className="text-slate-300">sender</code>, and <code className="text-slate-300">text</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-5 mt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => onComplete('demo')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip to Demo
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-950/50 transition-all active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={() => onComplete('demo')}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-950/50 transition-all active:scale-95"
            >
              <span>Start Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onComplete('import')}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-950/50 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Open File Import</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
