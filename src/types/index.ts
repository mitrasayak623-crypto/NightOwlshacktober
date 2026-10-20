/**
 * NightOwl AI Core Data Models
 * Adheres strictly to Section 13 (Data Models)
 */

export type ProcessingMode = 'local_engine' | 'demo_mode' | 'unavailable';

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'dismissed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskClassification = 'explicit_commitment' | 'suggested_followup' | 'inferred';

export type DecisionStatus = 'confirmed' | 'proposed' | 'superseded';
export type QuestionStatus = 'unanswered' | 'resolved';

export interface Chat {
  id: string;
  displayName: string;
  importedAt: string; // ISO string
  sourceFormat: 'whatsapp_txt' | 'custom_json' | 'fictional_demo';
  messageCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  processingMode: ProcessingMode;
  isSampleData?: boolean;
  fingerprint?: string; // Content fingerprint for duplicate detection
}

export interface Message {
  id: string;
  chatId: string;
  timestamp: string; // e.g. "2026-10-19 21:15"
  sender: string;
  text: string;
  messageType: 'user' | 'system';
  sourceLineReference: number;
}

export interface Task {
  id: string;
  chatId: string;
  title: string;
  owner?: string; // If explicitly identified
  deadline?: string; // If explicitly stated
  status: TaskStatus;
  priority: TaskPriority;
  evidenceMessageIds: string[];
  confidence: number; // 0.0 to 1.0
  classification: TaskClassification;
  notes?: string;
}

export interface Decision {
  id: string;
  chatId: string;
  title: string;
  status: DecisionStatus;
  timestamp: string;
  evidenceMessageIds: string[];
  supersedesDecisionId?: string;
  decidedBy?: string;
  rationale?: string;
}

export interface OpenQuestion {
  id: string;
  chatId: string;
  question: string;
  askedBy: string;
  timestamp: string;
  evidenceMessageIds: string[];
  status: QuestionStatus;
  confidence: number;
  apparentContext?: string;
}

export interface PlanChange {
  id: string;
  chatId: string;
  topic: string;
  earlierStatement: string;
  earlierSender: string;
  earlierTimestamp: string;
  laterStatement: string;
  laterSender: string;
  laterTimestamp: string;
  evidenceMessageIds: string[];
  confidence: number;
}

export interface TopicCluster {
  id: string;
  title: string;
  messageCount: number;
  keyParticipants: string[];
  summary: string;
  messageIds: string[];
}

export interface RepeatedQuestion {
  id: string;
  normalizedQuestion: string;
  occurrences: {
    askedBy: string;
    timestamp: string;
    messageId: string;
  }[];
}

export interface Summary {
  id: string;
  chatId: string;
  dateRange: {
    start: string;
    end: string;
  };
  twoLineSummary: string;
  keyUpdates: {
    id: string;
    text: string;
    category: 'critical' | 'action' | 'update';
    evidenceMessageIds: string[];
  }[];
  generatedAt: string;
  evidenceMessageIds: string[];
}

export interface ChatAnalysisData {
  summary: Summary;
  tasks: Task[];
  decisions: Decision[];
  openQuestions: OpenQuestion[];
  planChanges: PlanChange[];
  topicClusters: TopicCluster[];
  repeatedQuestions: RepeatedQuestion[];
}

export interface AppSettings {
  summaryLength: 'concise' | 'balanced' | 'detailed';
  preferredLanguage: string;
  defaultDateRange: 'all' | 'last_24h' | 'last_week';
  theme: 'dark';
}

export interface ParseProgress {
  percent: number;
  stage: 'reading' | 'parsing_lines' | 'resolving_messages' | 'auditing' | 'complete';
  currentLine: number;
  totalLines: number;
}

export interface ParseResult {
  success: boolean;
  messages: Message[];
  totalLines: number;
  parsedCount: number;
  unparsedLines: { line: number; text: string; reason: string }[];
  detectedSenders: string[];
  dateRange: { start: string; end: string };
  fingerprint: string;
  error?: string;
  cancelled?: boolean;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  existingChat?: Chat;
  matchType?: 'fingerprint' | 'exact_metadata';
}

export interface StorageHealthResult {
  isAvailable: boolean;
  error?: string;
}
