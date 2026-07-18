import React from 'react';
import { Copy, Trash2, X, Check } from 'lucide-react';
import { DictationEntry } from '../types.ts';
import { formatTimestamp, formatDuration } from '../utils.ts';

interface HistoryPanelProps {
  entries: DictationEntry[];
  onClose: () => void;
  onSelect: (entry: DictationEntry) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  copiedId: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ entries, onClose, onSelect, onDelete, onCopy, copiedId }) => {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-flow-panel border-l border-flow-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-flow-border">
          <h2 className="text-lg font-semibold">History</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {entries.length === 0 && (
            <p className="text-slate-500 text-sm text-center mt-10">Your dictations will show up here.</p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group rounded-xl border border-flow-border bg-flow-bg/60 p-3 cursor-pointer hover:border-flow-violet/50"
              onClick={() => onSelect(entry)}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{formatTimestamp(entry.timestamp)} · {formatDuration(entry.durationMs)}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onCopy(entry.polishedText); }}
                    className="hover:text-white"
                    aria-label="Copy"
                  >
                    {copiedId === entry.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                    className="hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-200 line-clamp-3">{entry.polishedText || entry.rawTranscript}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
