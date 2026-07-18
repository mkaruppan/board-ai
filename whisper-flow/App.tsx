import React, { useCallback, useRef, useState } from 'react';
import { Copy, Check, History, Settings, AlertCircle, Sparkles } from 'lucide-react';
import { AppSettings, AppStatus, DEFAULT_SETTINGS, DictationEntry, ToneStyle } from './types.ts';
import { useAudioRecorder } from './hooks/useAudioRecorder.ts';
import { usePushToTalk } from './hooks/usePushToTalk.ts';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { transcribeAndPolish, restyleText } from './services/geminiService.ts';
import { blobToBase64 } from './utils.ts';
import OrbButton from './components/OrbButton.tsx';
import ToneSelector from './components/ToneSelector.tsx';
import HistoryPanel from './components/HistoryPanel.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';

const MAX_HISTORY = 50;

const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('flow.settings', DEFAULT_SETTINGS);
  const [history, setHistory] = useLocalStorage<DictationEntry[]>('flow.history', []);

  const [status, setStatus] = useState<AppStatus>('idle');
  const [outputText, setOutputText] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyCopiedId, setHistoryCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRestyling, setIsRestyling] = useState(false);

  const durationRef = useRef(0);
  const { isRecording, level, error: micError, start, stop } = useAudioRecorder();

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const processRecording = useCallback(async () => {
    const result = await stop();
    if (!result) {
      setStatus('idle');
      return;
    }
    durationRef.current = result.durationMs;
    setStatus('transcribing');
    setErrorMessage(null);
    try {
      const base64Audio = await blobToBase64(result.blob);
      const { transcript, polished } = await transcribeAndPolish(
        base64Audio,
        result.mimeType,
        settings.tone,
        settings.dictionary
      );
      if (!transcript.trim()) {
        setErrorMessage("Didn't catch that — try again a little closer to the mic.");
        setStatus('idle');
        return;
      }
      setRawTranscript(transcript);
      setOutputText(polished || transcript);

      const entry: DictationEntry = {
        id: `${Date.now()}`,
        timestamp: Date.now(),
        rawTranscript: transcript,
        polishedText: polished || transcript,
        tone: settings.tone,
        durationMs: result.durationMs,
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));

      if (settings.autoCopy) {
        copyToClipboard(polished || transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
      setStatus('idle');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong while transcribing.');
      setStatus('idle');
    }
  }, [stop, settings.tone, settings.dictionary, settings.autoCopy, copyToClipboard, setHistory]);

  const beginRecording = useCallback(async () => {
    setErrorMessage(null);
    await start();
    setStatus('recording');
  }, [start]);

  const handleOrbPress = useCallback(() => {
    if (status === 'idle') {
      beginRecording();
    } else if (status === 'recording') {
      processRecording();
    }
  }, [status, beginRecording, processRecording]);

  usePushToTalk(
    () => status === 'idle' && beginRecording(),
    () => status === 'recording' && processRecording(),
    true
  );

  const handleToneChange = useCallback(async (tone: ToneStyle) => {
    setSettings((prev) => ({ ...prev, tone }));
    if (!rawTranscript || status !== 'idle') return;
    setIsRestyling(true);
    try {
      const restyled = await restyleText(rawTranscript, tone, settings.dictionary);
      setOutputText(restyled);
      if (settings.autoCopy) copyToClipboard(restyled);
    } catch {
      // keep the previous output if restyling fails
    } finally {
      setIsRestyling(false);
    }
  }, [rawTranscript, status, settings.dictionary, settings.autoCopy, copyToClipboard, setSettings]);

  const handleCopyOutput = useCallback(() => {
    copyToClipboard(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [outputText, copyToClipboard]);

  const handleSelectHistoryEntry = useCallback((entry: DictationEntry) => {
    setRawTranscript(entry.rawTranscript);
    setOutputText(entry.polishedText);
    setSettings((prev) => ({ ...prev, tone: entry.tone }));
    setShowHistory(false);
  }, [setSettings]);

  const handleDeleteHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, [setHistory]);

  const handleCopyHistoryEntry = useCallback((text: string, id: string) => {
    copyToClipboard(text);
    setHistoryCopiedId(id);
    setTimeout(() => setHistoryCopiedId(null), 1500);
  }, [copyToClipboard]);

  const statusLabel =
    status === 'recording' ? 'Listening...' :
    status === 'transcribing' ? 'Transcribing...' :
    isRestyling ? 'Restyling...' :
    'Tap to speak, or hold Ctrl+Space';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-flow-violet to-flow-blue flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Flow</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="History"
          >
            <History className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8 -mt-10">
        <div className="flex flex-col items-center gap-4">
          <OrbButton status={status} level={level} onPress={handleOrbPress} />
          <p className="text-sm text-slate-500">{statusLabel}</p>
        </div>

        {(errorMessage || micError) && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage || micError}</span>
          </div>
        )}

        <div className="w-full max-w-2xl">
          <ToneSelector value={settings.tone} onChange={handleToneChange} disabled={status !== 'idle'} />
        </div>

        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl bg-flow-panel border border-flow-border p-4">
            <textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              placeholder="Your dictation will appear here, cleaned up and ready to paste."
              rows={6}
              className="w-full resize-none bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none text-base leading-relaxed"
            />
            {outputText && (
              <button
                onClick={handleCopyOutput}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-flow-bg border border-flow-border px-2.5 py-1.5 text-xs text-slate-300 hover:border-flow-violet/60 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center pb-6">
        <p className="text-xs text-slate-600">Powered by Gemini · your audio is sent for transcription only, nothing is stored server-side.</p>
      </footer>

      {showHistory && (
        <HistoryPanel
          entries={history}
          onClose={() => setShowHistory(false)}
          onSelect={handleSelectHistoryEntry}
          onDelete={handleDeleteHistoryEntry}
          onCopy={(text) => {
            const entry = history.find((e) => e.polishedText === text);
            handleCopyHistoryEntry(text, entry?.id ?? '');
          }}
          copiedId={historyCopiedId}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
