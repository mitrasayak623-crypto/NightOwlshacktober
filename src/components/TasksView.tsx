import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  User,
  Quote,
  Edit2,
  XCircle,
  RotateCcw,
  Check,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskClassification, Message } from '../types';

interface TasksViewProps {
  tasks: Task[];
  allMessages: Message[];
  chatId: string;
  onUpdateTasks: (tasks: Task[]) => void;
  onOpenEvidence: (evidenceIds: string[], title: string, context?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  chatId,
  onUpdateTasks,
  onOpenEvidence,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [classificationFilter, setClassificationFilter] = useState<'all' | TaskClassification>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'status'>('priority');

  // Modal / Form state for Add / Edit Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formClassification, setFormClassification] = useState<TaskClassification>('explicit_commitment');
  const [formStatus, setFormStatus] = useState<TaskStatus>('open');

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormOwner('');
    setFormDeadline('');
    setFormPriority('medium');
    setFormClassification('explicit_commitment');
    setFormStatus('open');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormOwner(task.owner || '');
    setFormDeadline(task.deadline || '');
    setFormPriority(task.priority);
    setFormClassification(task.classification);
    setFormStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: formTitle.trim(),
              owner: formOwner.trim() || undefined,
              deadline: formDeadline.trim() || undefined,
              priority: formPriority,
              classification: formClassification,
              status: formStatus,
            }
          : t
      );
      onUpdateTasks(updated);
    } else {
      const newTask: Task = {
        id: `task_custom_${Date.now()}`,
        chatId,
        title: formTitle.trim(),
        owner: formOwner.trim() || undefined,
        deadline: formDeadline.trim() || undefined,
        priority: formPriority,
        classification: formClassification,
        status: formStatus,
        evidenceMessageIds: [],
        confidence: 1.0,
        notes: 'Manually created task.',
      };
      onUpdateTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (taskId: string, targetStatus: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t));
    onUpdateTasks(updated);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (classificationFilter !== 'all' && t.classification !== classificationFilter) return false;
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const weight = { high: 3, medium: 2, low: 1 };
      return weight[b.priority] - weight[a.priority];
    }
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    }
    return a.status.localeCompare(b.status);
  });

  // Groupings
  const explicitCommitments = sortedTasks.filter((t) => t.classification === 'explicit_commitment');
  const suggestedFollowups = sortedTasks.filter((t) => t.classification === 'suggested_followup');
  const inferredTasks = sortedTasks.filter((t) => t.classification === 'inferred');

  return (
    <div className="space-y-5 pb-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            My Action Items & Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explicit commitments, suggested follow-ups, and inferred tasks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-950/40 transition-all self-start sm:self-auto min-h-[38px] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'open', 'in_progress', 'completed', 'dismissed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] ${
                statusFilter === s
                  ? 'bg-violet-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {s === 'all'
                ? `All (${tasks.length})`
                : s === 'in_progress'
                ? `In Progress (${tasks.filter((t) => t.status === 'in_progress').length})`
                : `${s.charAt(0).toUpperCase() + s.slice(1)} (${tasks.filter((t) => t.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-mono">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-violet-500"
          >
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Main Task List */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No action items match this filter</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Switch your filter to view completed tasks or click "Add Custom Task" to register an item.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setStatusFilter('all')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Show All Tasks
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Section 1: Explicit Commitments */}
          {explicitCommitments.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <h2 className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[11px]">
                  Explicit Commitments ({explicitCommitments.length})
                </h2>
                <span className="text-slate-500">· Named promiser</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {explicitCommitments.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}

          {/* Section 2: Suggested Follow-ups */}
          {suggestedFollowups.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <h2 className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[11px]">
                  Suggested Follow-ups ({suggestedFollowups.length})
                </h2>
                <span className="text-slate-500">· Unassigned action items</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedFollowups.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}

          {/* Section 3: Inferred / Uncertain Tasks */}
          {inferredTasks.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <h2 className="font-bold uppercase tracking-wider text-slate-300 font-mono text-[11px]">
                  Inferred Tasks ({inferredTasks.length})
                </h2>
                <span className="text-slate-500">· Contextual needs</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inferredTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base font-bold font-display text-white mb-4">
              {editingTask ? 'Edit Action Item' : 'Add New Task'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Verify projector HDMI connection"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Responsible Person
                  </label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="Leave empty if unassigned"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="e.g. Oct 20, 10:00 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as TaskClassification)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="explicit_commitment">Commitment</option>
                    <option value="suggested_followup">Follow-up</option>
                    <option value="inferred">Inferred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-950/40"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderTaskCard(t: Task) {
    const isDone = t.status === 'completed';
    const isDismissed = t.status === 'dismissed';

    return (
      <div
        key={t.id}
        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          isDone
            ? 'bg-slate-950/40 border-slate-800/50 opacity-75'
            : isDismissed
            ? 'bg-slate-950/30 border-slate-800/40 opacity-50'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700/80'
        }`}
      >
        <div>
          {/* Header row: Status & Priority */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-medium ${
                  t.status === 'completed'
                    ? 'text-emerald-400'
                    : t.status === 'in_progress'
                    ? 'text-cyan-400'
                    : t.status === 'dismissed'
                    ? 'text-slate-500'
                    : 'text-violet-400'
                }`}
              >
                {t.status === 'in_progress' ? 'IN PROGRESS' : t.status.toUpperCase()}
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={`text-[10px] font-mono ${
                  t.priority === 'high'
                    ? 'text-rose-400'
                    : t.priority === 'medium'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {t.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            <button
              onClick={() => openEditModal(t)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task Title */}
          <h3
            className={`text-sm font-semibold text-slate-100 leading-snug ${
              isDone ? 'line-through text-slate-400' : ''
            }`}
          >
            {t.title}
          </h3>

          {/* Metadata: Owner & Deadline */}
          <div className="mt-2.5 space-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Owner:{' '}
                {t.owner ? (
                  <strong className="text-slate-200">{t.owner}</strong>
                ) : (
                  <span className="text-amber-400/90 italic">No owner assigned</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Deadline:{' '}
                {t.deadline ? (
                  <strong className="text-slate-200 font-mono">{t.deadline}</strong>
                ) : (
                  <span className="text-slate-500 italic">No deadline stated</span>
                )}
              </span>
            </div>
          </div>

          {t.notes && (
            <p className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              {t.notes}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {t.status !== 'completed' ? (
              <button
                onClick={() => toggleStatus(t.id, 'completed')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Mark Done</span>
              </button>
            ) : (
              <button
                onClick={() => toggleStatus(t.id, 'open')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reopen</span>
              </button>
            )}

            {t.status !== 'dismissed' ? (
              <button
                onClick={() => toggleStatus(t.id, 'dismissed')}
                className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors text-xs"
                title="Dismiss task"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => toggleStatus(t.id, 'open')}
                className="text-[11px] text-slate-400 hover:underline"
              >
                Restore
              </button>
            )}
          </div>

          {t.evidenceMessageIds.length > 0 ? (
            <button
              onClick={() => onOpenEvidence(t.evidenceMessageIds, t.title, t.notes)}
              className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Quote className="w-3 h-3" />
              <span>Evidence</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">Manual task</span>
          )}
        </div>
      </div>
    );
  }
};
