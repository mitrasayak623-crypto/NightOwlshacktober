import React, { useState } from 'react';
import {
  Sun,
  Sparkles,
  Quote,
  CheckCircle2,
  HelpCircle,
  GitCommit,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Chat, Summary, Task, Decision, OpenQuestion, PlanChange, Message } from '../types';

interface MorningBriefViewProps {
  chat: Chat;
  summary: Summary;
  tasks: Task[];
  decisions: Decision[];
  openQuestions: OpenQuestion[];
  planChanges: PlanChange[];
  allMessages: Message[];
  onOpenEvidence: (evidenceIds: string[], title: string, context?: string) => void;
  onNavigateToTab: (tab: 'tasks' | 'ask' | 'intelligence' | 'privacy') => void;
  onOpenImport: () => void;
  onReprocess: () => void;
}

export const MorningBriefView: React.FC<MorningBriefViewProps> = ({
  chat,
  summary,
  tasks,
  decisions,
  openQuestions,
  planChanges,
  onOpenEvidence,
  onNavigateToTab,
  onOpenImport,
  onReprocess,
}) => {
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleReprocessClick = () => {
    setIsReprocessing(true);
    setTimeout(() => {
      onReprocess();
      setIsReprocessing(false);
    }, 600);
  };

  const openTasks = tasks.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const unansweredQuestions = openQuestions.filter((q) => q.status === 'unanswered');

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner / Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{todayFormatted}</span>
            <span>·</span>
            <span className="text-violet-400 font-mono text-[11px] truncate max-w-[200px] sm:max-w-none">
              {summary.dateRange.start} → {summary.dateRange.end}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-white mt-1 tracking-tight">
            Good morning. Here is your brief.
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReprocessClick}
            disabled={isReprocessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 min-h-[36px]"
            title="Re-run local semantic analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin text-violet-400' : ''}`} />
            <span>{isReprocessing ? 'Analyzing...' : 'Reprocess'}</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all min-h-[36px]"
            title="Switch or import another chat"
          >
            <FolderOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {chat.isSampleData && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">[Demo Mode Active]</span> Displaying prewritten responses for the fictional Hackathon Team dataset. These are not real AI inference outputs.
          </div>
          <button
            onClick={onOpenImport}
            className="underline hover:text-white font-medium shrink-0 ml-1"
          >
            Import real chat
          </button>
        </div>
      )}

      {/* Prominent Two-Line Morning Summary Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-violet-500/25 p-5 sm:p-7 shadow-lg shadow-violet-950/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-violet-400 font-mono text-[10px]">
              Morning Synthesis
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">
              {chat.displayName}
            </span>
            {chat.isSampleData && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                DEMO PREWRITTEN
              </span>
            )}
          </div>

          <button
            onClick={() => onOpenEvidence(summary.evidenceMessageIds, 'Morning Briefing Evidence', summary.twoLineSummary)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-violet-300 hover:text-white bg-violet-500/15 hover:bg-violet-500/25 rounded-lg transition-colors shrink-0"
          >
            <Quote className="w-3 h-3" />
            <span>Verify Evidence</span>
          </button>
        </div>

        <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed tracking-normal">
          {summary.twoLineSummary}
        </p>

        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="tabular-nums">{chat.messageCount} messages</span>
            <span>·</span>
            <span className="tabular-nums">{openTasks.length} pending tasks</span>
            <span>·</span>
            <span className="tabular-nums">{unansweredQuestions.length} open questions</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>{chat.isSampleData ? 'Demo Mock Engine' : '100% Local Inference'}</span>
          </div>
        </div>
      </section>

      {/* Priority Updates Grid (3 Items) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h2 className="font-semibold uppercase tracking-wider text-slate-400 font-mono text-[11px]">
            Priority Updates
          </h2>
          <span className="text-slate-500 font-mono text-[11px]">
            {chat.isSampleData ? 'Demo Dataset Examples' : '3 Key Highlights'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summary.keyUpdates.map((update, idx) => (
            <div
              key={update.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-400 font-medium text-[11px]">
                      0{idx + 1}. {update.category === 'critical' ? 'Schedule' : update.category === 'action' ? 'Technical' : 'Deliverable'}
                    </span>
                    {chat.isSampleData && (
                      <span className="text-[9px] font-mono text-amber-400/90 font-medium">
                        (Demo)
                      </span>
                    )}
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      update.category === 'critical'
                        ? 'bg-cyan-400'
                        : update.category === 'action'
                        ? 'bg-violet-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <p className="text-sm text-slate-200 font-medium leading-snug">
                  {update.text}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {update.evidenceMessageIds.length} source {update.evidenceMessageIds.length === 1 ? 'msg' : 'msgs'}
                </span>
                <button
                  onClick={() => onOpenEvidence(update.evidenceMessageIds, `Update #0${idx + 1} Evidence`, update.text)}
                  className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 hover:underline text-xs"
                >
                  <Quote className="w-3 h-3" />
                  <span>Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* "What changed?" Contradictions & Plan Revisions Section */}
      {planChanges.length > 0 && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <GitCommit className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-display text-white">
                  What Changed? (Plan Revisions)
                </h2>
                {chat.isSampleData && (
                  <span className="text-[9px] font-mono font-medium text-amber-400/90">
                    [Demo Scenario]
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('intelligence')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium shrink-0"
            >
              <span>Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {planChanges.map((change) => (
              <div
                key={change.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 text-xs">{change.topic}</span>
                  <button
                    onClick={() => onOpenEvidence(change.evidenceMessageIds, 'Plan Change Evidence', change.topic)}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Quote className="w-3 h-3" />
                    <span>Evidence</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Earlier Statement */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-amber-400/90">Earlier Statement</span>
                      <span className="font-mono text-slate-500 text-[10px]">{change.earlierTimestamp}</span>
                    </div>
                    <p className="text-slate-300 italic text-xs leading-relaxed">"{change.earlierStatement}"</p>
                    <span className="text-[10px] text-slate-400 block">— {change.earlierSender}</span>
                  </div>

                  {/* Later Statement */}
                  <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/25 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-emerald-400">Later Revision</span>
                      <span className="font-mono text-slate-500 text-[10px]">{change.laterTimestamp}</span>
                    </div>
                    <p className="text-slate-200 font-medium text-xs leading-relaxed">"{change.laterStatement}"</p>
                    <span className="text-[10px] text-slate-400 block">— {change.laterSender}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Layout: Pending Action Items & Unanswered Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Action Items Preview */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display text-white">
                    Pending Tasks ({openTasks.length})
                  </h3>
                  {chat.isSampleData && (
                    <span className="text-[9px] font-mono text-amber-400/90">
                      [Demo]
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {openTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  All action items completed or dismissed.
                </div>
              ) : (
                openTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-200 leading-snug">{task.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>{task.owner || 'Unassigned'}</span>
                        <span>·</span>
                        <span className="font-mono">{task.deadline || 'No deadline'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenEvidence(task.evidenceMessageIds, task.title, task.notes)}
                      className="text-slate-400 hover:text-violet-300 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                      title="View task source message"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">Commitments: {tasks.filter(t => t.classification === 'explicit_commitment').length}</span>
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="text-violet-400 hover:underline font-medium"
            >
              Task Manager →
            </button>
          </div>
        </section>

        {/* Unresolved Questions Preview */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display text-white">
                    Unanswered Questions ({unansweredQuestions.length})
                  </h3>
                  {chat.isSampleData && (
                    <span className="text-[9px] font-mono text-amber-400/90">
                      [Demo]
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('intelligence')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>View Intel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {unansweredQuestions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No unresolved questions detected in this chat window.
                </div>
              ) : (
                unansweredQuestions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-200 font-medium leading-snug">
                        "{q.question}"
                      </p>
                      <button
                        onClick={() => onOpenEvidence(q.evidenceMessageIds, 'Question Evidence', q.question)}
                        className="text-slate-400 hover:text-amber-300 p-1 rounded hover:bg-slate-800 shrink-0 transition-colors"
                        title="View question source message"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Asked by {q.askedBy}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{q.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-[200px]">May have been answered verbally</span>
            <button
              onClick={() => onNavigateToTab('ask')}
              className="text-violet-400 hover:underline font-medium shrink-0"
            >
              Ask Chat →
            </button>
          </div>
        </section>
      </div>

      {/* Decisions Strip */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-display text-white">
                Confirmed Decisions ({decisions.filter(d => d.status === 'confirmed').length})
              </h3>
              {chat.isSampleData && (
                <span className="text-[9px] font-mono text-amber-400/90">
                  [Demo]
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('intelligence')}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
          >
            <span>Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {decisions.slice(0, 4).map((dec) => (
            <div
              key={dec.id}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                dec.status === 'superseded'
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950/70 border-slate-800/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 text-[11px]">
                  <span
                    className={`font-mono font-medium ${
                      dec.status === 'confirmed'
                        ? 'text-emerald-400'
                        : dec.status === 'superseded'
                        ? 'text-rose-400 line-through'
                        : 'text-amber-400'
                    }`}
                  >
                    {dec.status === 'confirmed' ? '✓ Confirmed' : dec.status === 'superseded' ? '✕ Superseded' : 'Proposed'}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{dec.timestamp}</span>
                </div>
                <p className="text-slate-200 font-medium leading-snug">
                  {dec.title}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {dec.decidedBy ? `By ${dec.decidedBy}` : 'Group consensus'}
                </span>
                <button
                  onClick={() => onOpenEvidence(dec.evidenceMessageIds, dec.title, dec.rationale)}
                  className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 hover:underline text-[11px]"
                >
                  <Quote className="w-3 h-3" />
                  <span>Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
