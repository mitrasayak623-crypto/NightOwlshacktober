import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  FileCode,
  StopCircle,
  Copy,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ChatParser } from '../services/chatParser';
import { aiEngine } from '../services/aiEngine';
import { StorageService } from '../services/storage';
import { Chat, Message, ChatAnalysisData, ParseResult, ParseProgress, DuplicateDetectionResult } from '../types';
import { SAMPLE_WHATSAPP_TEXT, SAMPLE_JSON_TEXT } from '../data/hackathonDemoData';

interface ImportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (
    chat: Chat,
    messages: Message[],
    analysis: ChatAnalysisData,
    replaceExistingId?: string
  ) => void;
}

export const ImportChatModal: React.FC<ImportChatModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [chatName, setChatName] = useState('');
  const [fileFormat, setFileFormat] = useState<'whatsapp_txt' | 'custom_json'>('whatsapp_txt');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');

  // Parsing & Progress State
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cancellation ref
  const cancelRequestedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate Detection State
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateDetectionResult | null>(null);

  // Preview Tabs: 'messages' vs 'unparsed'
  const [previewTab, setPreviewTab] = useState<'messages' | 'unparsed'>('messages');

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      cancelRequestedRef.current = true;
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setChatName('');
    setFileName('');
    setFileSizeStr('');
    setParseResult(null);
    setIsProcessing(false);
    setProgress(null);
    setErrorMsg(null);
    setDuplicateCheck(null);
    setPreviewTab('messages');
    cancelRequestedRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  const handleCancelProcess = () => {
    cancelRequestedRef.current = true;
    setIsProcessing(false);
    setProgress(null);
    setErrorMsg('Import processing was cancelled by user.');
  };

  const handleFileSelection = async (file: File) => {
    setErrorMsg(null);
    setDuplicateCheck(null);
    cancelRequestedRef.current = false;

    // 1. Pre-flight file validation
    const validation = ChatParser.validateFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file.');
      return;
    }

    // Format detection
    const isJson = file.name.toLowerCase().endsWith('.json');
    const detectedFormat: 'whatsapp_txt' | 'custom_json' = isJson ? 'custom_json' : 'whatsapp_txt';
    setFileFormat(detectedFormat);
    setFileName(file.name);
    setFileSizeStr(
      file.size < 1024
        ? `${file.size} B`
        : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    );

    // Auto-infer display name
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const defaultName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    setChatName(defaultName);

    // Read content using local FileReader
    setIsProcessing(true);
    setProgress({ percent: 5, stage: 'reading', currentLine: 0, totalLines: 1 });

    try {
      const content = await file.text();

      if (cancelRequestedRef.current) {
        setIsProcessing(false);
        return;
      }

      if (!content || !content.trim()) {
        setIsProcessing(false);
        setErrorMsg('The selected file contains no readable text.');
        return;
      }

      const tempChatId = `chat_${Date.now()}`;

      // Chunked parse with live progress
      const result = await ChatParser.parseAsyncWithProgress(
        content,
        detectedFormat,
        tempChatId,
        (p) => setProgress(p),
        () => cancelRequestedRef.current
      );

      if (result.cancelled) {
        setIsProcessing(false);
        setErrorMsg('File parsing was cancelled.');
        return;
      }

      if (!result.success) {
        setIsProcessing(false);
        setErrorMsg(result.error || 'Failed to parse chat records.');
        return;
      }

      setParseResult(result);

      // Check for duplicate chat in local store
      const dup = StorageService.detectDuplicateChat(
        result.fingerprint,
        defaultName,
        result.dateRange
      );
      setDuplicateCheck(dup);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to read file locally: ${err?.message || 'File access error'}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleLoadPreset = async (type: 'whatsapp' | 'json') => {
    setErrorMsg(null);
    setDuplicateCheck(null);
    cancelRequestedRef.current = false;

    if (type === 'whatsapp') {
      const sampleBlob = new Blob([SAMPLE_WHATSAPP_TEXT], { type: 'text/plain' });
      const sampleFile = new File([sampleBlob], 'whatsapp_chat_export.txt', { type: 'text/plain' });
      handleFileSelection(sampleFile);
    } else {
      const sampleBlob = new Blob([SAMPLE_JSON_TEXT], { type: 'application/json' });
      const sampleFile = new File([sampleBlob], 'weekend_trip.json', { type: 'application/json' });
      handleFileSelection(sampleFile);
    }
  };

  const executeImport = async (replaceExistingId?: string, isCopy = false) => {
    if (!parseResult || !parseResult.success || parseResult.messages.length === 0) return;

    // Check storage availability before running analysis
    const storageCheck = StorageService.checkStorageHealth();
    if (!storageCheck.isAvailable) {
      setErrorMsg(storageCheck.error || 'Browser local storage is not writable.');
      return;
    }

    setIsProcessing(true);
    setProgress({ percent: 10, stage: 'parsing_lines', currentLine: 0, totalLines: 100 });

    const finalChatId = replaceExistingId || `chat_${Date.now()}`;
    let finalDisplayName = chatName.trim() || fileName || 'Imported Chat';
    if (isCopy) {
      finalDisplayName = `${finalDisplayName} (Copy)`;
    }

    // Preserve IDs for evidence references
    const finalMessages: Message[] = parseResult.messages.map((m, idx) => ({
      ...m,
      id: `${finalChatId}_m_${idx + 1}`,
      chatId: finalChatId,
    }));

    try {
      setProgress({ percent: 50, stage: 'resolving_messages', currentLine: 50, totalLines: 100 });

      // Run on-device deterministic semantic analysis
      const analysis = await aiEngine.analyzeChat(finalMessages, finalChatId);

      setProgress({ percent: 90, stage: 'complete', currentLine: 90, totalLines: 100 });

      const newChat: Chat = {
        id: finalChatId,
        displayName: finalDisplayName,
        importedAt: new Date().toISOString(),
        sourceFormat: fileFormat,
        messageCount: finalMessages.length,
        dateRange: parseResult.dateRange,
        processingMode: 'local_engine',
        isSampleData: false,
        fingerprint: parseResult.fingerprint,
      };

      onImportComplete(newChat, finalMessages, analysis, replaceExistingId);
      onClose();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Semantic analysis error: ${e?.message || 'Processing failed'}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                Import Group Chat
              </h2>
              <p className="text-xs text-slate-400">
                100% on-device local parsing. No network transmission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Active Progress & Cancellation Bar */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-violet-300 font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {progress?.stage === 'reading'
                      ? 'Reading file into memory...'
                      : progress?.stage === 'parsing_lines'
                      ? `Parsing lines (${progress.currentLine.toLocaleString()} / ${progress.totalLines.toLocaleString()})...`
                      : progress?.stage === 'resolving_messages'
                      ? 'Running local semantic engine & linking evidence...'
                      : 'Finalizing local index...'}
                  </span>
                </div>
                <span className="font-mono text-violet-400 font-bold tabular-nums">
                  {progress?.percent || 0}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-150"
                  style={{ width: `${progress?.percent || 5}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Preserving source line IDs strictly in local memory</span>
                <button
                  type="button"
                  onClick={handleCancelProcess}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium hover:underline"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel Processing</span>
                </button>
              </div>
            </div>
          )}

          {/* Initial State: File Select & Presets */}
          {!parseResult?.success && !isProcessing && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Quick Testing Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleLoadPreset('whatsapp')}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-violet-500/50 text-left transition-all active:scale-98 flex items-center gap-3"
                  >
                    <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Load WhatsApp TXT Sample</div>
                      <div className="text-[10px] text-slate-500">16 messages with bracketed timestamps</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadPreset('json')}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-violet-500/50 text-left transition-all active:scale-98 flex items-center gap-3"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Load Structured JSON Sample</div>
                      <div className="text-[10px] text-slate-500">Document with messages array</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-violet-500/60 bg-slate-950/40 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-2xl bg-slate-800 group-hover:bg-violet-600/20 text-slate-400 group-hover:text-violet-300 mx-auto flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drop your chat export file here, or click to browse
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts plain text WhatsApp (<strong>.txt</strong>) and structured JSON (<strong>.json</strong>) up to 15MB
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Strict zero-upload client privacy</span>
                </div>
              </div>

              {/* Error Callout */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-1">
                    <div className="font-semibold text-rose-200">Import Validation Notice</div>
                    <div className="leading-relaxed">{errorMsg}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parsed Preview State */}
          {parseResult?.success && !isProcessing && (
            <div className="space-y-4">
              {/* Duplicate Detection Alert */}
              {duplicateCheck?.isDuplicate && duplicateCheck.existingChat && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Duplicate Conversation Detected</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-amber-200/90">
                    This file matches an already imported chat:{' '}
                    <strong className="text-white">"{duplicateCheck.existingChat.displayName}"</strong>{' '}
                    ({duplicateCheck.existingChat.messageCount} messages, imported on{' '}
                    {new Date(duplicateCheck.existingChat.importedAt).toLocaleDateString()}).
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => executeImport(duplicateCheck.existingChat?.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace Existing Chat</span>
                    </button>
                    <button
                      onClick={() => executeImport(undefined, true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Import as New Copy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* File Summary Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{fileName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {parseResult.parsedCount} messages · {fileSizeStr} · {parseResult.detectedSenders.length} senders
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetState}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium shrink-0 ml-2"
                >
                  Discard File
                </button>
              </div>

              {/* Chat Name Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chat / Group Title
                </label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="e.g. Hackathon Team, Marketing Sync..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Parsing Diagnostics Strip */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Parsed Messages</div>
                  <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">{parseResult.parsedCount}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Total Lines</div>
                  <div className="text-base font-bold text-slate-200 font-mono tabular-nums">{parseResult.totalLines}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Unparsed Lines</div>
                  <div className={`text-base font-bold font-mono tabular-nums ${parseResult.unparsedLines.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {parseResult.unparsedLines.length}
                  </div>
                </div>
              </div>

              {/* Date Scope & Senders */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div>
                  <strong className="text-slate-300">Date Range:</strong> {parseResult.dateRange.start} → {parseResult.dateRange.end}
                </div>
                <div className="truncate">
                  <strong className="text-slate-300">Active Senders:</strong> {parseResult.detectedSenders.join(', ')}
                </div>
              </div>

              {/* Preview Toggle Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('messages')}
                  className={`pb-2 text-xs font-medium transition-colors border-b-2 ${
                    previewTab === 'messages'
                      ? 'border-violet-400 text-violet-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Message Preview ({parseResult.messages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('unparsed')}
                  className={`pb-2 text-xs font-medium transition-colors border-b-2 ${
                    previewTab === 'unparsed'
                      ? 'border-amber-400 text-amber-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unparsed Lines ({parseResult.unparsedLines.length})
                </button>
              </div>

              {/* Tab 1: Messages Preview */}
              {previewTab === 'messages' ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {parseResult.messages.slice(0, 10).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <strong className="text-slate-200 truncate">{msg.sender}</strong>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <span>Line #{msg.sourceLineReference}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {parseResult.messages.length > 10 && (
                    <div className="text-center py-1 text-[11px] text-slate-500 font-mono">
                      + {parseResult.messages.length - 10} more messages parsed
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Unparsed Lines Diagnostics */
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {parseResult.unparsedLines.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/40 text-center text-xs text-slate-500">
                      Zero unparsed lines. 100% of lines cleanly converted.
                    </div>
                  ) : (
                    parseResult.unparsedLines.map((u, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                          <span>Line #{u.line}</span>
                          <span>{u.reason}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono truncate">{u.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {parseResult?.success && !duplicateCheck?.isDuplicate && (
            <button
              onClick={() => executeImport()}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-950/50 transition-all active:scale-95 disabled:opacity-50 min-h-[36px]"
            >
              <span>Confirm & Generate Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {parseResult?.success && duplicateCheck?.isDuplicate && (
            <button
              onClick={() => executeImport(duplicateCheck.existingChat?.id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-950/50 transition-all active:scale-95 disabled:opacity-50 min-h-[36px]"
            >
              <span>Update Existing Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
