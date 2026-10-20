import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Quote,
  Shield,
  AlertCircle,
  ArrowRight,
  Search,
  Cpu,
} from 'lucide-react';
import { Message, Chat } from '../types';
import { aiEngineManager } from '../services/aiEngine';

interface AskChatViewProps {
  chat: Chat;
  allMessages: Message[];
  onOpenEvidence: (evidenceIds: string[], title: string, context?: string) => void;
}

interface QAHistoryItem {
  id: string;
  question: string;
  answer: string;
  evidenceMessageIds: string[];
  confidence: number;
  found: boolean;
  timestamp: string;
  isDemo: boolean;
  engineLabel: string;
}

export const AskChatView: React.FC<AskChatViewProps> = ({
  chat,
  allMessages,
  onOpenEvidence,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [history, setHistory] = useState<QAHistoryItem[]>(() => {
    if (chat.isSampleData) {
      return [
        {
          id: 'qa_init_1',
          question: 'What time did we decide to meet?',
          answer:
            '[Demo Mode] The team confirmed meeting: "Let us meet tomorrow at 10:00 AM sharp in Innovation Lab A. Gives everyone sleep." (Alex Rivera confirmed by David Chen and Liam O’Connor).',
          evidenceMessageIds: ['msg_05', 'msg_07', 'msg_16'],
          confidence: 0.98,
          found: true,
          timestamp: '10:00 AM',
          isDemo: true,
          engineLabel: 'Demo Engine (Offline)',
        },
      ];
    }
    return [];
  });

  useEffect(() => {
    if (chat.isSampleData) {
      setHistory([
        {
          id: `qa_init_${chat.id}`,
          question: 'What time did we decide to meet?',
          answer:
            '[Demo Mode] The team confirmed meeting: "Let us meet tomorrow at 10:00 AM sharp in Innovation Lab A. Gives everyone sleep." (Alex Rivera confirmed by David Chen and Liam O’Connor).',
          evidenceMessageIds: ['msg_05', 'msg_07', 'msg_16'],
          confidence: 0.98,
          found: true,
          timestamp: '10:00 AM',
          isDemo: true,
          engineLabel: 'Demo Engine (Offline)',
        },
      ]);
    } else {
      setHistory([]);
    }
  }, [chat.id, chat.isSampleData]);

  const suggestedQuestions = [
    'What time did we decide to meet?',
    'Who said they would prepare the presentation?',
    'What is still pending?',
    'Did the meeting time change?',
    'What was the final decision about our project?',
  ];

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setInputQuery('');

    try {
      // Simulate brief processing latency for realistic tactile feedback
      await new Promise((r) => setTimeout(r, 350));

      // Dispatch to decoupled engine through AIEngineManager
      const engine = aiEngineManager.getEngine(chat.isSampleData);
      const result = await engine.answerQuestion(q, allMessages);

      const newItem: QAHistoryItem = {
        id: `qa_${Date.now()}`,
        question: q,
        answer: result.answer,
        evidenceMessageIds: result.evidenceMessageIds,
        confidence: result.confidence,
        found: result.found,
        timestamp: new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(new Date()),
        isDemo: result.isDemo,
        engineLabel: result.engineLabel,
      };

      setHistory((prev) => [newItem, ...prev]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  const activeEngineInfo = aiEngineManager.getEngine(chat.isSampleData).getRuntimeInfo();

  return (
    <div className="space-y-5 pb-6">
      {/* Top Header */}
      <div className="pt-1">
        <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Chat Grounding</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1 tracking-tight">
          Ask Your Chats
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Query decisions, times, assignees, or topics with verified citations.
        </p>
      </div>

      {/* Engine Status Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {activeEngineInfo.isDemo ? (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-slate-300">
            {activeEngineInfo.isDemo ? (
              <span>
                <strong className="text-amber-300 font-mono">[Demo Mode Active]</strong> Answers are prewritten examples for the fictional Hackathon transcript.
              </span>
            ) : (
              <span>
                <strong className="text-emerald-300 font-mono">[Local Semantic Engine]</strong> Grounded strictly in your imported message memory.
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-violet-400" />
          <span>{activeEngineInfo.modelBackendName}</span>
        </div>
      </div>

      {/* Suggested Starter Questions */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Common Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(sq)}
              disabled={isSearching}
              className="text-left px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50 active:scale-95"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Ask Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about this conversation..."
            disabled={isSearching}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-14 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-md shadow-slate-950/40 min-h-[48px]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSearching}
            className="absolute right-2 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 text-white disabled:text-slate-500 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Searching Indicator */}
      {isSearching && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3 animate-in fade-in duration-150">
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-xs text-slate-300">
            Searching message index and verifying evidence provenance...
          </span>
        </div>
      )}

      {/* Q&A Thread Feed */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm"
          >
            {/* User Question */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                Q
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-white">
                    {item.question}
                  </div>
                  {/* Visibly Labeled Demo / Local Badge */}
                  {item.isDemo ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                      Demo Prewritten
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                      Local Inference
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Asked at {item.timestamp} · {item.engineLabel}
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="pl-8 space-y-2.5">
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                  item.found
                    ? item.isDemo
                      ? 'bg-slate-950/60 border-amber-500/20 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                {!item.found && (
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Insufficient Evidence</span>
                  </div>
                )}
                {item.answer}
              </div>

              {/* Citations Footer */}
              {item.found && item.evidenceMessageIds.length > 0 && (
                <div className="flex items-center justify-between pt-0.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Quote className="w-3.5 h-3.5 text-violet-400" />
                    <span>
                      {item.evidenceMessageIds.length} verified{' '}
                      {item.evidenceMessageIds.length === 1 ? 'citation' : 'citations'}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      onOpenEvidence(
                        item.evidenceMessageIds,
                        `Answer Evidence for "${item.question}"`,
                        item.answer
                      )
                    }
                    className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    <span>Inspect Context</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
