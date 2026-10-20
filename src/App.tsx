/**
 * NightOwl AI — Primary Application Container
 * Adheres strictly to Product Specification, Universal Frontend Design Constitution,
 * and Zero-Cloud Privacy Architecture.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { MorningBriefView } from './components/MorningBriefView';
import { TasksView } from './components/TasksView';
import { AskChatView } from './components/AskChatView';
import { IntelligenceView } from './components/IntelligenceView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { OnboardingModal } from './components/OnboardingModal';
import { ImportChatModal } from './components/ImportChatModal';
import { SettingsModal } from './components/SettingsModal';
import { EvidenceModal } from './components/EvidenceModal';
import { NightOwlLogo } from './components/NightOwlLogo';

import { Chat, Message, ChatAnalysisData, Task, AppSettings } from './types';
import { StorageService } from './services/storage';
import { aiEngineManager } from './services/aiEngine';
import { DEMO_CHAT } from './data/hackathonDemoData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('brief');

  // Load chats & active chat
  const [chats, setChats] = useState<Chat[]>(() => StorageService.getChats());
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const list = StorageService.getChats();
    return list[0]?.id || '';
  });

  // Active chat content
  const [messages, setMessages] = useState<Message[]>(() =>
    activeChatId ? StorageService.getMessages(activeChatId) : []
  );
  const [analysis, setAnalysis] = useState<ChatAnalysisData | null>(() =>
    activeChatId ? StorageService.getAnalysis(activeChatId) : null
  );

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() =>
    StorageService.getSettings()
  );

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !StorageService.isOnboardingCompleted();
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Universal Evidence Modal State
  const [evidenceModal, setEvidenceModal] = useState<{
    isOpen: boolean;
    evidenceIds: string[];
    title: string;
    context?: string;
  }>({
    isOpen: false,
    evidenceIds: [],
    title: '',
    context: undefined,
  });

  // Synchronize messages & analysis when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setAnalysis(null);
      return;
    }
    const msgs = StorageService.getMessages(activeChatId);
    setMessages(msgs);

    const data = StorageService.getAnalysis(activeChatId);
    if (data) {
      setAnalysis(data);
    } else if (msgs.length > 0) {
      const curChat = chats.find((c) => c.id === activeChatId);
      const engine = aiEngineManager.getEngine(curChat?.isSampleData);
      engine.analyzeChat(msgs, activeChatId).then((newAnalysis) => {
        setAnalysis(newAnalysis);
        if (curChat) {
          StorageService.saveFullChat(curChat, msgs, newAnalysis);
        }
      });
    } else {
      setAnalysis(null);
    }
  }, [activeChatId, chats]);

  const currentChat: Chat | null =
    chats.find((c) => c.id === activeChatId) || (chats.length > 0 ? chats[0] : null);

  // Onboarding completion
  const handleOnboardingComplete = (action: 'demo' | 'import') => {
    StorageService.setOnboardingCompleted(true);
    setIsOnboardingOpen(false);

    if (action === 'demo') {
      StorageService.resetDemoData();
      const updatedChats = StorageService.getChats();
      setChats(updatedChats);
      setActiveChatId(DEMO_CHAT.id);
      setActiveTab('brief');
    } else {
      setIsImportModalOpen(true);
    }
  };

  // Import completion handler with duplicate replacement support
  const handleImportComplete = (
    newChat: Chat,
    newMessages: Message[],
    newAnalysis: ChatAnalysisData,
    replaceExistingId?: string
  ) => {
    if (replaceExistingId) {
      StorageService.replaceExistingChat(replaceExistingId, newChat, newMessages, newAnalysis);
    } else {
      StorageService.saveFullChat(newChat, newMessages, newAnalysis);
    }
    const updatedChats = StorageService.getChats();
    setChats(updatedChats);
    setActiveChatId(newChat.id);
    setMessages(newMessages);
    setAnalysis(newAnalysis);
    setActiveTab('brief');
  };

  // Task updates
  const handleUpdateTasks = (updatedTasks: Task[]) => {
    if (!analysis) return;
    const updatedAnalysis: ChatAnalysisData = {
      ...analysis,
      tasks: updatedTasks,
    };
    setAnalysis(updatedAnalysis);
    StorageService.updateTasks(activeChatId, updatedTasks);
  };

  // Reprocess local semantic analysis through decoupled engine
  const handleReprocess = async () => {
    if (!currentChat || messages.length === 0) return;
    const engine = aiEngineManager.getEngine(currentChat.isSampleData);
    const reanalyzed = await engine.analyzeChat(messages, activeChatId);
    setAnalysis(reanalyzed);
    StorageService.saveFullChat(currentChat, messages, reanalyzed);
  };

  // Delete current chat
  const handleDeleteCurrentChat = () => {
    if (!activeChatId) return;
    StorageService.deleteChat(activeChatId);
    const remaining = StorageService.getChats();
    setChats(remaining);
    if (remaining.length > 0) {
      setActiveChatId(remaining[0].id);
    } else {
      setActiveChatId('');
      setMessages([]);
      setAnalysis(null);
    }
    setActiveTab('brief');
  };

  // Clear demo data
  const handleClearDemoData = () => {
    StorageService.clearDemoData();
    const remaining = StorageService.getChats();
    setChats(remaining);
    if (activeChatId === DEMO_CHAT.id) {
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId('');
        setMessages([]);
        setAnalysis(null);
      }
    }
  };

  // Reset demo data
  const handleResetDemoData = () => {
    StorageService.resetDemoData();
    const updated = StorageService.getChats();
    setChats(updated);
    setActiveChatId(DEMO_CHAT.id);
    setActiveTab('brief');
  };

  // Nuclear wipe
  const handleNuclearWipe = () => {
    StorageService.clearAllData();
    StorageService.resetDemoData();
    const freshChats = StorageService.getChats();
    setChats(freshChats);
    setActiveChatId(DEMO_CHAT.id);
    setIsOnboardingOpen(true);
    setActiveTab('brief');
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Open universal evidence modal
  const handleOpenEvidence = (
    evidenceIds: string[],
    title: string,
    context?: string
  ) => {
    setEvidenceModal({
      isOpen: true,
      evidenceIds,
      title,
      context,
    });
  };

  const openTasksCount =
    analysis?.tasks.filter((t) => t.status === 'open' || t.status === 'in_progress')
      .length || 0;
  const openQuestionsCount =
    analysis?.openQuestions.filter((q) => q.status === 'unanswered').length || 0;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      {/* Top Application Header */}
      <Header
        currentChat={currentChat}
        allChats={chats}
        onSelectChat={(id) => setActiveChatId(id)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPrivacy={() => setActiveTab('privacy')}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-4 pb-24 sm:pb-20">
        {!currentChat ? (
          activeTab === 'privacy' ? (
            <PrivacyCenterView
              currentChat={null}
              allChats={chats}
              onDeleteCurrentChat={handleDeleteCurrentChat}
              onClearDemoData={handleClearDemoData}
              onResetDemoData={handleResetDemoData}
              onNuclearWipe={handleNuclearWipe}
              onOpenImport={() => setIsImportModalOpen(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center max-w-md mx-auto space-y-4 animate-in fade-in duration-150">
              <div className="w-16 h-16 rounded-3xl bg-violet-600/15 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-xl shadow-violet-950/30">
                <NightOwlLogo size={40} />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">No Conversations Loaded</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Import an exported group chat from WhatsApp (.txt) or structured JSON, or load the fictional Hackathon Team demo to explore features.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 w-full justify-center">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import Chat</span>
                </button>
                <button
                  onClick={handleResetDemoData}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all active:scale-95 min-h-[40px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Load Demo Conversation</span>
                </button>
              </div>
            </div>
          )
        ) : analysis ? (
          <>
            {activeTab === 'brief' && (
              <MorningBriefView
                chat={currentChat}
                summary={analysis.summary}
                tasks={analysis.tasks}
                decisions={analysis.decisions}
                openQuestions={analysis.openQuestions}
                planChanges={analysis.planChanges}
                allMessages={messages}
                onOpenEvidence={handleOpenEvidence}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenImport={() => setIsImportModalOpen(true)}
                onReprocess={handleReprocess}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksView
                tasks={analysis.tasks}
                allMessages={messages}
                chatId={activeChatId}
                onUpdateTasks={handleUpdateTasks}
                onOpenEvidence={handleOpenEvidence}
              />
            )}

            {activeTab === 'ask' && (
              <AskChatView
                chat={currentChat}
                allMessages={messages}
                onOpenEvidence={handleOpenEvidence}
              />
            )}

            {activeTab === 'intelligence' && (
              <IntelligenceView
                chat={currentChat}
                decisions={analysis.decisions}
                openQuestions={analysis.openQuestions}
                planChanges={analysis.planChanges}
                topicClusters={analysis.topicClusters}
                repeatedQuestions={analysis.repeatedQuestions}
                allMessages={messages}
                onOpenEvidence={handleOpenEvidence}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyCenterView
                currentChat={currentChat}
                allChats={chats}
                onDeleteCurrentChat={handleDeleteCurrentChat}
                onClearDemoData={handleClearDemoData}
                onResetDemoData={handleResetDemoData}
                onNuclearWipe={handleNuclearWipe}
                onOpenImport={() => setIsImportModalOpen(true)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Decoding conversation locally...</p>
          </div>
        )}
      </main>

      {/* Fixed Ergonomic Bottom Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        openTasksCount={openTasksCount}
        openQuestionsCount={openQuestionsCount}
      />

      {/* Universal Evidence Inspector Modal */}
      <EvidenceModal
        isOpen={evidenceModal.isOpen}
        onClose={() => setEvidenceModal((prev) => ({ ...prev, isOpen: false }))}
        evidenceIds={evidenceModal.evidenceIds}
        allMessages={messages}
        title={evidenceModal.title}
        sourceContext={evidenceModal.context}
      />

      {/* Onboarding Walkthrough Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {/* Local Chat Import Modal */}
      <ImportChatModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearDemoData={handleClearDemoData}
        onClearAllData={handleNuclearWipe}
      />
    </div>
  );
}
