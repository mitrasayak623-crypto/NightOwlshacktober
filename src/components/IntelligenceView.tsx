import React, { useState } from 'react';
import {
  GitCommit,
  HelpCircle,
  Layers,
  Repeat,
  Quote,
  AlertCircle,
  Users,
  Compass,
} from 'lucide-react';
import {
  Decision,
  OpenQuestion,
  PlanChange,
  TopicCluster,
  RepeatedQuestion,
  Message,
  Chat,
} from '../types';

interface IntelligenceViewProps {
  chat: Chat;
  decisions: Decision[];
  openQuestions: OpenQuestion[];
  planChanges: PlanChange[];
  topicClusters: TopicCluster[];
  repeatedQuestions: RepeatedQuestion[];
  allMessages: Message[];
  onOpenEvidence: (evidenceIds: string[], title: string, context?: string) => void;
}

type IntelTab = 'decisions' | 'unresolved' | 'changes' | 'topics' | 'repeated' | 'timeline';

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  chat,
  decisions,
  openQuestions,
  planChanges,
  topicClusters,
  repeatedQuestions,
  allMessages,
  onOpenEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<IntelTab>('decisions');

  const tabs = [
    { id: 'decisions' as IntelTab, label: 'Decisions Timeline', count: decisions.length },
    { id: 'unresolved' as IntelTab, label: 'Unresolved Inquiries', count: openQuestions.length },
    { id: 'changes' as IntelTab, label: 'Plan Revisions', count: planChanges.length },
    { id: 'topics' as IntelTab, label: 'Topic Clusters', count: topicClusters.length },
    { id: 'repeated' as IntelTab, label: 'Repeated Inquiries', count: repeatedQuestions.length },
    { id: 'timeline' as IntelTab, label: 'Event Stream', count: allMessages.length },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Top Header */}
      <div className="pt-1">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Compass className="w-3.5 h-3.5" />
          <span>Deep Conversation Intelligence</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1 tracking-tight">
          Chat Intelligence & Synthesis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-grounded audit of decisions, unresolved inquiries, and plan revisions.
        </p>
      </div>

      {/* Sub-Tabs Nav */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[36px] ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-violet-800 text-violet-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab A: Decisions Timeline */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chronological decision progression</span>
            <span className="font-mono text-slate-500 text-[11px]">Superseding links verified</span>
          </div>

          {decisions.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
              No decisions or agreements detected in this conversation window.
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {decisions.map((dec) => {
              const isSuperseded = dec.status === 'superseded';
              const supersedesOther = decisions.find((d) => d.id === dec.supersedesDecisionId);

              return (
                <div key={dec.id} className="relative pl-8">
                  {/* Timeline indicator node */}
                  <div
                    className={`absolute left-2 top-4 w-3.5 h-3.5 rounded-full border-2 -translate-x-1/2 ${
                      isSuperseded
                        ? 'bg-slate-950 border-rose-500'
                        : dec.status === 'confirmed'
                        ? 'bg-slate-950 border-emerald-400'
                        : 'bg-slate-950 border-amber-400'
                    }`}
                  />

                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isSuperseded
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            dec.status === 'confirmed'
                              ? 'text-emerald-400'
                              : isSuperseded
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {dec.status.toUpperCase()}
                        </span>
                        {dec.decidedBy && (
                          <span className="text-slate-400">· By {dec.decidedBy}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{dec.timestamp}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {dec.title}
                    </h3>

                    {dec.rationale && (
                      <p className="mt-1 text-xs text-slate-400 italic">
                        Context: {dec.rationale}
                      </p>
                    )}

                    {supersedesOther && (
                      <div className="mt-2.5 p-2 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">Supersedes prior proposal: "{supersedesOther.title}"</span>
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] font-mono">
                        {dec.evidenceMessageIds.length} source {dec.evidenceMessageIds.length === 1 ? 'msg' : 'msgs'}
                      </span>
                      <button
                        onClick={() => onOpenEvidence(dec.evidenceMessageIds, dec.title, dec.rationale)}
                        className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 hover:underline text-xs"
                      >
                        <Quote className="w-3 h-3" />
                        <span>Inspect Evidence</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

      {/* Tab B: Unresolved Inquiries */}
      {activeTab === 'unresolved' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Caveat:</strong> These inquiries had no direct answers in the imported conversation history. They may have been addressed out-of-band or in voice calls.
            </p>
          </div>

          <div className="space-y-3">
            {openQuestions.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
                No unresolved questions detected.
              </div>
            ) : (
              openQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-amber-400 font-mono text-[10px] font-semibold">
                      UNRESOLVED INQUIRY
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">{q.timestamp}</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-100">
                    "{q.question}"
                  </p>

                  <div className="text-xs text-slate-400">
                    Asked by <strong className="text-slate-200">{q.askedBy}</strong>
                  </div>

                  {q.apparentContext && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      Observation: {q.apparentContext}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Confidence: {Math.round(q.confidence * 100)}%
                    </span>
                    <button
                      onClick={() => onOpenEvidence(q.evidenceMessageIds, 'Question Evidence', q.question)}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Quote className="w-3 h-3" />
                      <span>View Message</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab C: Plan Revisions */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Detected plan revisions and contradictory commitments over time.
          </div>

          <div className="space-y-3">
            {planChanges.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
                No plan revisions detected in this message window.
              </div>
            ) : (
              planChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{change.topic}</span>
                    <button
                      onClick={() => onOpenEvidence(change.evidenceMessageIds, change.topic)}
                      className="text-violet-400 hover:text-violet-300 text-xs font-medium flex items-center gap-1 hover:underline"
                    >
                      <Quote className="w-3 h-3" />
                      <span>Compare Evidence</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-amber-400/90 font-medium">Initial Position</span>
                        <span className="font-mono text-slate-500 text-[10px]">{change.earlierTimestamp}</span>
                      </div>
                      <p className="text-slate-300 italic leading-relaxed">"{change.earlierStatement}"</p>
                      <span className="text-[10px] text-slate-400 block">— {change.earlierSender}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/25 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-medium">Revised Agreement</span>
                        <span className="font-mono text-slate-500 text-[10px]">{change.laterTimestamp}</span>
                      </div>
                      <p className="text-slate-200 font-medium leading-relaxed">"{change.laterStatement}"</p>
                      <span className="text-[10px] text-slate-400 block">— {change.laterSender}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab D: Topic Clusters */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Semantic conversation clustering by theme and active participants.
          </div>

          {topicClusters.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
              No distinct topic clusters identified in this message window.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topicClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-violet-400" />
                        <span>{cluster.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {cluster.messageCount} msgs
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cluster.summary}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Users className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">Active: {cluster.keyParticipants.join(', ')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 mt-3 flex items-center justify-end">
                    <button
                      onClick={() => onOpenEvidence(cluster.messageIds, cluster.title, cluster.summary)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Quote className="w-3 h-3" />
                      <span>View Thread</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab E: Repeated Inquiries */}
      {activeTab === 'repeated' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Inquiries posed multiple times, signaling uncertainty or communication gaps.
          </div>

          <div className="space-y-3">
            {repeatedQuestions.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-500 text-xs">
                No repeated inquiries detected.
              </div>
            ) : (
              repeatedQuestions.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                    <Repeat className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Repeated Inquiry: "{rep.normalizedQuestion}"</span>
                  </div>

                  <div className="space-y-2">
                    {rep.occurrences.map((occ, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[10px]">#{idx + 1}</span>
                          <span className="text-slate-300 font-medium">{occ.askedBy}</span>
                          <span className="text-slate-500 font-mono text-[10px]">at {occ.timestamp}</span>
                        </div>
                        <button
                          onClick={() => onOpenEvidence([occ.messageId], `Question occurrence by ${occ.askedBy}`)}
                          className="text-violet-400 hover:text-violet-300 text-xs font-medium hover:underline"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab F: Event Stream */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Chronological message stream with line indicators ({allMessages.length} messages)
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {allMessages.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{m.sender}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                    <span className="text-[10px] text-slate-600 font-mono">Line #{m.sourceLineReference}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
                <button
                  onClick={() => onOpenEvidence([m.id], `Message from ${m.sender}`)}
                  className="text-slate-500 hover:text-violet-300 p-1 rounded shrink-0"
                  title="Open message in context"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
