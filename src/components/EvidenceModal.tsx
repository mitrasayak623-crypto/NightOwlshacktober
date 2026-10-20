import React from 'react';
import { X, MessageSquare, Clock, User, Quote, ShieldCheck } from 'lucide-react';
import { Message } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceIds: string[];
  allMessages: Message[];
  title?: string;
  sourceContext?: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  evidenceIds,
  allMessages,
  title = 'Source Evidence & Provenance',
  sourceContext,
}) => {
  if (!isOpen) return null;

  // Find target messages
  const targetMessages = allMessages.filter((m) => evidenceIds.includes(m.id));

  // Determine surrounding messages for context
  const targetIndices = targetMessages.map((m) => allMessages.findIndex((item) => item.id === m.id)).filter((i) => i !== -1);
  const minIdx = Math.max(0, Math.min(...targetIndices) - 1);
  const maxIdx = Math.min(allMessages.length - 1, Math.max(...targetIndices) + 1);

  const contextualMessages = allMessages.slice(minIdx, maxIdx + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Mobile handle drag affordance */}
        <div className="sm:hidden w-10 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <h3 id="evidence-modal-title" className="text-sm font-semibold text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                {targetMessages.length} supporting {targetMessages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors min-w-[32px] min-h-[32px]"
            aria-label="Close evidence viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Claim Context callout */}
        {sourceContext && (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <span className="font-semibold text-violet-400 shrink-0 font-mono text-[11px]">CLAIM:</span>
            <span className="italic leading-relaxed">"{sourceContext}"</span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {targetMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">Unverified Claim</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No matching source message references were found in the current imported conversation window.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 font-mono">
                <span>Transcript Context</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% On-Device Audit
                </span>
              </div>

              {contextualMessages.map((msg) => {
                const isTarget = evidenceIds.includes(msg.id);
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isTarget
                        ? 'bg-violet-950/30 border-violet-500/40 shadow-sm shadow-violet-950/30 ring-1 ring-violet-500/20'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-65'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{msg.sender}</span>
                        {isTarget && (
                          <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded font-medium">
                            Direct Evidence
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Line #{msg.sourceLineReference} · Message ID: {msg.id}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span className="font-mono text-[10px]">Processed strictly on this device</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors min-h-[32px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
