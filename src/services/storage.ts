/**
 * Local Storage & Privacy Management
 * Adheres strictly to Section 11 (Privacy Center) & Section 16 (Local Storage & Security)
 * Zero remote backups. Zero server logs. Single-click purge.
 */

import { Chat, Message, ChatAnalysisData, AppSettings, DuplicateDetectionResult, StorageHealthResult } from '../types';
import {
  DEMO_CHAT,
  DEMO_MESSAGES,
  DEMO_SUMMARY,
  DEMO_TASKS,
  DEMO_DECISIONS,
  DEMO_QUESTIONS,
  DEMO_PLAN_CHANGES,
  DEMO_TOPIC_CLUSTERS,
  DEMO_REPEATED_QUESTIONS,
} from '../data/hackathonDemoData';

const STORAGE_KEYS = {
  CHATS_INDEX: 'nightowl_chats_index_v1',
  CHAT_MESSAGES_PREFIX: 'nightowl_msgs_',
  CHAT_ANALYSIS_PREFIX: 'nightowl_analysis_',
  SETTINGS: 'nightowl_settings_v1',
  ONBOARDING_COMPLETED: 'nightowl_onboarding_done_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  summaryLength: 'balanced',
  preferredLanguage: 'English',
  defaultDateRange: 'all',
  theme: 'dark',
};

export class StorageService {
  /**
   * Verify whether localStorage is accessible and functional in this browser environment
   * Identifies exact limitations if storage is disabled or quota blocked
   */
  static checkStorageHealth(): StorageHealthResult {
    try {
      const testKey = '__nightowl_storage_probe__';
      localStorage.setItem(testKey, 'probe_val');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      if (retrieved !== 'probe_val') {
        return {
          isAvailable: false,
          error: 'Local browser storage could not retain probe data. Storage may be restricted.',
        };
      }
      return { isAvailable: true };
    } catch (e: any) {
      return {
        isAvailable: false,
        error: `Browser local storage is unavailable or quota is exceeded (${e?.message || 'Access denied'}). NightOwl requires local browser storage to save your chats privately.`,
      };
    }
  }

  /**
   * Detect if a chat with matching content fingerprint or identical name and date range already exists
   */
  static detectDuplicateChat(
    fingerprint: string,
    displayName: string,
    dateRange: { start: string; end: string }
  ): DuplicateDetectionResult {
    const existingChats = this.getChats();

    // 1. Check exact content fingerprint
    if (fingerprint && fingerprint !== 'empty') {
      const matchByFingerprint = existingChats.find((c) => c.fingerprint === fingerprint);
      if (matchByFingerprint) {
        return {
          isDuplicate: true,
          existingChat: matchByFingerprint,
          matchType: 'fingerprint',
        };
      }
    }

    // 2. Check identical display name and date range
    const cleanName = displayName.trim().toLowerCase();
    const matchByMetadata = existingChats.find(
      (c) =>
        c.displayName.trim().toLowerCase() === cleanName &&
        c.dateRange.start === dateRange.start &&
        c.dateRange.end === dateRange.end
    );

    if (matchByMetadata) {
      return {
        isDuplicate: true,
        existingChat: matchByMetadata,
        matchType: 'exact_metadata',
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Get initial or persisted chats list
   */
  static getChats(): Chat[] {
    try {
      const isDemoCleared = localStorage.getItem('nightowl_demo_cleared') === 'true';
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS_INDEX);
      if (!raw) {
        return isDemoCleared ? [] : [DEMO_CHAT];
      }
      const parsed: Chat[] = JSON.parse(raw);
      if (!isDemoCleared && !parsed.some((c) => c.id === DEMO_CHAT.id)) {
        return [DEMO_CHAT, ...parsed];
      }
      return parsed.filter((c) => !isDemoCleared || c.id !== DEMO_CHAT.id);
    } catch {
      return localStorage.getItem('nightowl_demo_cleared') === 'true' ? [] : [DEMO_CHAT];
    }
  }

  /**
   * Save chats list index
   */
  static saveChatsIndex(chats: Chat[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS_INDEX, JSON.stringify(chats));
    } catch (e) {
      console.warn('Storage quota exceeded while updating chat index', e);
    }
  }

  /**
   * Get messages for a given chat
   */
  static getMessages(chatId: string): Message[] {
    if (chatId === DEMO_CHAT.id) {
      if (localStorage.getItem('nightowl_demo_cleared') === 'true') {
        return [];
      }
      return DEMO_MESSAGES;
    }
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.CHAT_MESSAGES_PREFIX}${chatId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get analysis data for a chat
   */
  static getAnalysis(chatId: string): ChatAnalysisData | null {
    if (chatId === DEMO_CHAT.id) {
      if (localStorage.getItem('nightowl_demo_cleared') === 'true') {
        return null;
      }
      let tasks = DEMO_TASKS;
      try {
        const stored = localStorage.getItem('nightowl_demo_tasks') || sessionStorage.getItem('nightowl_demo_tasks');
        if (stored) {
          tasks = JSON.parse(stored);
        }
      } catch {}
      return {
        summary: DEMO_SUMMARY,
        tasks,
        decisions: DEMO_DECISIONS,
        openQuestions: DEMO_QUESTIONS,
        planChanges: DEMO_PLAN_CHANGES,
        topicClusters: DEMO_TOPIC_CLUSTERS,
        repeatedQuestions: DEMO_REPEATED_QUESTIONS,
      };
    }
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.CHAT_ANALYSIS_PREFIX}${chatId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Persist a full chat record with its messages and analysis
   */
  static saveFullChat(chat: Chat, messages: Message[], analysis: ChatAnalysisData): boolean {
    const health = this.checkStorageHealth();
    if (!health.isAvailable) {
      console.error(health.error);
      return false;
    }

    try {
      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_MESSAGES_PREFIX}${chat.id}`,
        JSON.stringify(messages)
      );

      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_ANALYSIS_PREFIX}${chat.id}`,
        JSON.stringify(analysis)
      );

      const existing = this.getChats().filter((c) => c.id !== chat.id);
      this.saveChatsIndex([chat, ...existing]);
      return true;
    } catch (err) {
      console.error('Failed to save chat locally:', err);
      return false;
    }
  }

  /**
   * Replace an existing chat with updated import data
   */
  static replaceExistingChat(
    existingChatId: string,
    newChat: Chat,
    newMessages: Message[],
    newAnalysis: ChatAnalysisData
  ): boolean {
    // Delete previous records
    this.deleteChat(existingChatId);
    // Save updated chat
    return this.saveFullChat(newChat, newMessages, newAnalysis);
  }

  /**
   * Update tasks for an active chat
   */
  static updateTasks(chatId: string, updatedTasks: ChatAnalysisData['tasks']): void {
    const analysis = this.getAnalysis(chatId);
    if (!analysis) return;
    analysis.tasks = updatedTasks;

    if (chatId === DEMO_CHAT.id) {
      try {
        localStorage.setItem('nightowl_demo_tasks', JSON.stringify(updatedTasks));
        sessionStorage.setItem('nightowl_demo_tasks', JSON.stringify(updatedTasks));
      } catch {}
      return;
    }

    try {
      localStorage.setItem(
        `${STORAGE_KEYS.CHAT_ANALYSIS_PREFIX}${chatId}`,
        JSON.stringify(analysis)
      );
    } catch (e) {
      console.warn('Failed to update tasks:', e);
    }
  }

  /**
   * Delete a single chat and all associated messages and insights
   */
  static deleteChat(chatId: string): void {
    if (chatId === DEMO_CHAT.id) {
      localStorage.setItem('nightowl_demo_cleared', 'true');
      localStorage.removeItem('nightowl_demo_tasks');
      sessionStorage.removeItem('nightowl_demo_tasks');
    }
    try {
      localStorage.removeItem(`${STORAGE_KEYS.CHAT_MESSAGES_PREFIX}${chatId}`);
      localStorage.removeItem(`${STORAGE_KEYS.CHAT_ANALYSIS_PREFIX}${chatId}`);
      const remaining = this.getChats().filter((c) => c.id !== chatId);
      this.saveChatsIndex(remaining);
    } catch (e) {
      console.error('Error deleting chat:', e);
    }
  }

  /**
   * Nuclear wipe
   */
  static clearAllData(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('nightowl_') || key.startsWith('fp_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to wipe storage:', e);
    }
  }

  /**
   * Clear demo data only
   */
  static clearDemoData(): void {
    localStorage.setItem('nightowl_demo_cleared', 'true');
    localStorage.removeItem('nightowl_demo_tasks');
    sessionStorage.removeItem('nightowl_demo_tasks');
    const remaining = this.getChats().filter((c) => c.id !== DEMO_CHAT.id);
    this.saveChatsIndex(remaining);
  }

  /**
   * Reset demo data
   */
  static resetDemoData(): void {
    localStorage.removeItem('nightowl_demo_cleared');
    localStorage.removeItem('nightowl_demo_tasks');
    sessionStorage.removeItem('nightowl_demo_tasks');
    const existing = this.getChats().filter((c) => c.id !== DEMO_CHAT.id);
    this.saveChatsIndex([DEMO_CHAT, ...existing]);
  }

  /**
   * Storage footprint calculation
   */
  static getStorageFootprint(): { bytes: number; formatted: string; chatCount: number; messageCount: number } {
    let bytes = 0;
    let messageCount = 0;
    const chats = this.getChats();

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nightowl_')) {
          const val = localStorage.getItem(key) || '';
          bytes += (key.length + val.length) * 2;
        }
      }
    } catch {
      bytes = 0;
    }

    chats.forEach((c) => {
      messageCount += c.messageCount;
    });

    const formatted =
      bytes < 1024
        ? `${bytes} bytes`
        : bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    return { bytes, formatted, chatCount: chats.length, messageCount };
  }

  /**
   * App Settings
   */
  static getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }

  /**
   * Onboarding State
   */
  static isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  static setOnboardingCompleted(completed: boolean): void {
    if (completed) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    }
  }
}
