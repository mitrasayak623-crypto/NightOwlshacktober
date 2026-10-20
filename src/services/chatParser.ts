/**
 * Client-Side Group Chat Parser
 * Adheres strictly to Section 7 (Import Chat Workflow)
 * 100% local in-browser parsing. Zero server transmission.
 *
 * Supports:
 * - WhatsApp plain text exports (12h/24h, brackets & hyphens, unicode LTR cleanups)
 * - Multiline message continuation
 * - System message identification
 * - Supported structured JSON formats
 * - Chunked asynchronous parsing with real progress telemetry & cancellation
 * - Content fingerprinting for duplicate detection
 */

import { Message, ParseResult, ParseProgress } from '../types';

// Regex patterns with support for optional LTR/RTL invisible unicode marks
// \u200E (LRM), \u200F (RLM), \uFEFF (BOM), \u202A-\u202E (directional formatting)
const UNICODE_MARKS = /[\u200E\u200F\uFEFF\u200B\u202A-\u202E]/g;

// Standard WhatsApp bracketed format: [10/19/26, 8:30:12 PM] Sender: Message or [19/10/2026, 20:30:12] Sender: Message
const REGEX_BRACKET = /^\s*\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s+([^:]+):\s*(.*)$/;

// Standard WhatsApp hyphenated format: 10/19/2026, 8:30 PM - Sender: Message or 19/10/26, 20:30 - Sender: Message
const REGEX_HYPHEN = /^\s*(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:]+):\s*(.*)$/;

// System messages (e.g. "10/19/2026, 8:00 PM - Messages and calls are end-to-end encrypted...")
const REGEX_SYSTEM_HYPHEN = /^\s*(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*(.+)$/;
const REGEX_SYSTEM_BRACKET = /^\s*\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s*(.+)$/;

export class ChatParser {
  /**
   * Strip non-printing directional formatting, BOM, and normalize non-breaking spaces from WhatsApp lines
   */
  static cleanLine(line: string): string {
    return line.replace(UNICODE_MARKS, '').replace(/[\u202F\u00A0]/g, ' ').trimEnd();
  }

  /**
   * Compute stable deterministic fingerprint for a collection of messages
   */
  static computeFingerprint(messages: Message[]): string {
    if (messages.length === 0) return 'empty';
    const count = messages.length;
    const start = messages[0]?.timestamp || '';
    const end = messages[messages.length - 1]?.timestamp || '';
    const firstMsg = messages[0]?.text.slice(0, 30) || '';
    const lastMsg = messages[messages.length - 1]?.text.slice(0, 30) || '';
    const senders = Array.from(new Set(messages.map((m) => m.sender))).sort().join('|');

    // Create a fast hash string
    const seed = `${count}_${start}_${end}_${senders}_${firstMsg}_${lastMsg}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `fp_${Math.abs(hash).toString(36)}_${count}`;
  }

  /**
   * Validate file metadata before reading
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file was provided.' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'The selected file is empty (0 bytes).' };
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB limit
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum supported size for browser-only processing is 15MB.`,
      };
    }

    const nameLower = file.name.toLowerCase();
    const hasValidExt = nameLower.endsWith('.txt') || nameLower.endsWith('.json');
    if (!hasValidExt) {
      return {
        valid: false,
        error: `Unsupported file extension (${file.name}). NightOwl AI accepts exported plain text (.txt) or structured (.json) files.`,
      };
    }

    return { valid: true };
  }

  /**
   * Parse plain text chat export synchronously
   */
  static parsePlainText(content: string, chatId: string): ParseResult {
    if (!content || !content.trim()) {
      return {
        success: false,
        messages: [],
        totalLines: 0,
        parsedCount: 0,
        unparsedLines: [{ line: 1, text: '', reason: 'File is completely empty' }],
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error: 'The uploaded file is empty.',
      };
    }

    const rawLines = content.split(/\r?\n/);
    const messages: Message[] = [];
    const unparsedLines: { line: number; text: string; reason: string }[] = [];
    const sendersSet = new Set<string>();

    let currentMessage: Message | null = null;

    for (let i = 0; i < rawLines.length; i++) {
      const lineNum = i + 1;
      const line = this.cleanLine(rawLines[i]);

      if (!line.trim()) {
        continue;
      }

      // 1. Bracket format check: [Date, Time] Sender: Message
      let match = line.match(REGEX_BRACKET);
      if (match) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, sender, text] = match;
        const cleanSender = sender.trim();
        sendersSet.add(cleanSender);
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: cleanSender,
          text: text.trim(),
          messageType: 'user',
          sourceLineReference: lineNum,
        };
        continue;
      }

      // 2. Hyphen format check: Date, Time - Sender: Message
      match = line.match(REGEX_HYPHEN);
      if (match) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, sender, text] = match;
        const cleanSender = sender.trim();
        sendersSet.add(cleanSender);
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: cleanSender,
          text: text.trim(),
          messageType: 'user',
          sourceLineReference: lineNum,
        };
        continue;
      }

      // 3. System message checks
      const sysMatch = line.match(REGEX_SYSTEM_BRACKET) || line.match(REGEX_SYSTEM_HYPHEN);
      if (sysMatch && !line.includes(':')) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, text] = sysMatch;
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: 'System',
          text: text.trim(),
          messageType: 'system',
          sourceLineReference: lineNum,
        };
        continue;
      }

      // 4. Multiline continuation: append to active message
      if (currentMessage) {
        currentMessage.text += `\n${line}`;
      } else {
        // Line without timestamp before any recognized message
        unparsedLines.push({
          line: lineNum,
          text: line.length > 80 ? `${line.substring(0, 80)}...` : line,
          reason: 'Unrecognized line before any timestamp header.',
        });
      }
    }

    if (currentMessage) {
      messages.push(currentMessage);
    }

    if (messages.length === 0) {
      return {
        success: false,
        messages: [],
        totalLines: rawLines.length,
        parsedCount: 0,
        unparsedLines,
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error:
          'No valid message records found. Please ensure the file uses standard WhatsApp export formatting (e.g. "[MM/DD/YY, HH:MM:SS AM] Sender: text").',
      };
    }

    const start = messages[0]?.timestamp || '';
    const end = messages[messages.length - 1]?.timestamp || '';
    const fingerprint = this.computeFingerprint(messages);

    return {
      success: true,
      messages,
      totalLines: rawLines.length,
      parsedCount: messages.length,
      unparsedLines,
      detectedSenders: Array.from(sendersSet),
      dateRange: { start, end },
      fingerprint,
    };
  }

  /**
   * Parse JSON chat exports synchronously
   */
  static parseJson(jsonString: string, chatId: string): ParseResult {
    let rawData: unknown;
    try {
      rawData = JSON.parse(jsonString);
    } catch (e: any) {
      return {
        success: false,
        messages: [],
        totalLines: 0,
        parsedCount: 0,
        unparsedLines: [{ line: 1, text: '', reason: `Malformed JSON: ${e?.message || 'Syntax error'}` }],
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error: `Invalid JSON syntax: ${e?.message || 'Check for syntax errors or invalid formatting'}.`,
      };
    }

    interface RawMessage {
      timestamp?: string;
      date?: string;
      time?: string;
      created_at?: string;
      sender?: string;
      author?: string;
      user?: string;
      name?: string;
      text?: string;
      content?: string;
      message?: string;
      body?: string;
    }

    let rawList: RawMessage[] = [];
    if (Array.isArray(rawData)) {
      rawList = rawData as RawMessage[];
    } else if (rawData && typeof rawData === 'object' && 'messages' in rawData && Array.isArray((rawData as { messages: unknown }).messages)) {
      rawList = (rawData as { messages: RawMessage[] }).messages;
    } else {
      return {
        success: false,
        messages: [],
        totalLines: 0,
        parsedCount: 0,
        unparsedLines: [{ line: 1, text: '', reason: 'Root object lacks a "messages" array.' }],
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error: 'JSON format must either be an array of message objects or an object containing a "messages" array.',
      };
    }

    const messages: Message[] = [];
    const unparsed: { line: number; text: string; reason: string }[] = [];
    const senders = new Set<string>();

    rawList.forEach((item, index) => {
      const text = item.text || item.content || item.message || item.body || '';
      const sender = item.sender || item.author || item.user || item.name || 'Unknown Sender';
      const timestamp = item.timestamp || item.created_at || (item.date && item.time ? `${item.date} ${item.time}` : item.date) || 'No timestamp';

      if (!text.trim()) {
        unparsed.push({
          line: index + 1,
          text: JSON.stringify(item),
          reason: 'Item is missing a message body/text attribute.',
        });
        return;
      }

      senders.add(sender);
      messages.push({
        id: `${chatId}_m_${messages.length + 1}`,
        chatId,
        timestamp,
        sender,
        text: text.trim(),
        messageType: 'user',
        sourceLineReference: index + 1,
      });
    });

    if (messages.length === 0) {
      return {
        success: false,
        messages: [],
        totalLines: rawList.length,
        parsedCount: 0,
        unparsedLines: unparsed,
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error: 'Zero valid message objects found in the JSON document.',
      };
    }

    const start = messages[0]?.timestamp || '';
    const end = messages[messages.length - 1]?.timestamp || '';
    const fingerprint = this.computeFingerprint(messages);

    return {
      success: true,
      messages,
      totalLines: rawList.length,
      parsedCount: messages.length,
      unparsedLines: unparsed,
      detectedSenders: Array.from(senders),
      dateRange: { start, end },
      fingerprint,
    };
  }

  /**
   * Asynchronous chunked parser with real-time progress and cancellation token
   */
  static async parseAsyncWithProgress(
    content: string,
    format: 'whatsapp_txt' | 'custom_json',
    chatId: string,
    onProgress: (progress: ParseProgress) => void,
    isCancelled: () => boolean
  ): Promise<ParseResult> {
    if (format === 'custom_json') {
      onProgress({ percent: 20, stage: 'reading', currentLine: 0, totalLines: 1 });
      await new Promise((r) => setTimeout(r, 60));
      if (isCancelled()) {
        return {
          success: false,
          messages: [],
          totalLines: 0,
          parsedCount: 0,
          unparsedLines: [],
          detectedSenders: [],
          dateRange: { start: '', end: '' },
          fingerprint: '',
          cancelled: true,
          error: 'Import was cancelled by the user.',
        };
      }
      onProgress({ percent: 70, stage: 'parsing_lines', currentLine: 1, totalLines: 1 });
      const res = this.parseJson(content, chatId);
      onProgress({ percent: 100, stage: 'complete', currentLine: 1, totalLines: 1 });
      return res;
    }

    // Plain text chunked processing
    const rawLines = content.split(/\r?\n/);
    const totalLines = rawLines.length;

    onProgress({ percent: 5, stage: 'reading', currentLine: 0, totalLines });

    const messages: Message[] = [];
    const unparsedLines: { line: number; text: string; reason: string }[] = [];
    const sendersSet = new Set<string>();

    let currentMessage: Message | null = null;
    const CHUNK_SIZE = 250;

    for (let i = 0; i < totalLines; i++) {
      if (i % CHUNK_SIZE === 0) {
        if (isCancelled()) {
          return {
            success: false,
            messages: [],
            totalLines,
            parsedCount: 0,
            unparsedLines: [],
            detectedSenders: [],
            dateRange: { start: '', end: '' },
            fingerprint: '',
            cancelled: true,
            error: 'Import was cancelled by the user.',
          };
        }

        const pct = Math.min(95, Math.round((i / totalLines) * 90) + 5);
        onProgress({
          percent: pct,
          stage: 'parsing_lines',
          currentLine: i,
          totalLines,
        });
        // Yield to the UI thread
        await new Promise((r) => setTimeout(r, 8));
      }

      const lineNum = i + 1;
      const line = this.cleanLine(rawLines[i]);

      if (!line.trim()) continue;

      let match = line.match(REGEX_BRACKET);
      if (match) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, sender, text] = match;
        const cleanSender = sender.trim();
        sendersSet.add(cleanSender);
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: cleanSender,
          text: text.trim(),
          messageType: 'user',
          sourceLineReference: lineNum,
        };
        continue;
      }

      match = line.match(REGEX_HYPHEN);
      if (match) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, sender, text] = match;
        const cleanSender = sender.trim();
        sendersSet.add(cleanSender);
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: cleanSender,
          text: text.trim(),
          messageType: 'user',
          sourceLineReference: lineNum,
        };
        continue;
      }

      const sysMatch = line.match(REGEX_SYSTEM_BRACKET) || line.match(REGEX_SYSTEM_HYPHEN);
      if (sysMatch && !line.includes(':')) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        const [, dateStr, timeStr, text] = sysMatch;
        currentMessage = {
          id: `${chatId}_m_${messages.length + 1}`,
          chatId,
          timestamp: `${dateStr} ${timeStr}`.trim(),
          sender: 'System',
          text: text.trim(),
          messageType: 'system',
          sourceLineReference: lineNum,
        };
        continue;
      }

      if (currentMessage) {
        currentMessage.text += `\n${line}`;
      } else {
        unparsedLines.push({
          line: lineNum,
          text: line.length > 80 ? `${line.substring(0, 80)}...` : line,
          reason: 'Line does not start with a recognized timestamp or active message header.',
        });
      }
    }

    if (currentMessage) {
      messages.push(currentMessage);
    }

    if (isCancelled()) {
      return {
        success: false,
        messages: [],
        totalLines,
        parsedCount: 0,
        unparsedLines: [],
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: '',
        cancelled: true,
        error: 'Import was cancelled by the user.',
      };
    }

    if (messages.length === 0) {
      return {
        success: false,
        messages: [],
        totalLines,
        parsedCount: 0,
        unparsedLines,
        detectedSenders: [],
        dateRange: { start: '', end: '' },
        fingerprint: 'empty',
        error:
          'No valid message records found. Please ensure the file uses standard WhatsApp export formatting (e.g. "[MM/DD/YY, HH:MM:SS AM] Sender: text").',
      };
    }

    const start = messages[0]?.timestamp || '';
    const end = messages[messages.length - 1]?.timestamp || '';
    const fingerprint = this.computeFingerprint(messages);

    onProgress({ percent: 100, stage: 'complete', currentLine: totalLines, totalLines });

    return {
      success: true,
      messages,
      totalLines,
      parsedCount: messages.length,
      unparsedLines,
      detectedSenders: Array.from(sendersSet),
      dateRange: { start, end },
      fingerprint,
    };
  }
}
