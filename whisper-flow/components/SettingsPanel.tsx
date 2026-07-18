import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { AppSettings } from '../types.ts';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  const [newWord, setNewWord] = useState('');

  const addWord = () => {
    const word = newWord.trim();
    if (!word || settings.dictionary.includes(word)) return;
    onChange({ ...settings, dictionary: [...settings.dictionary, word] });
    setNewWord('');
  };

  const removeWord = (word: string) => {
    onChange({ ...settings, dictionary: settings.dictionary.filter((w) => w !== word) });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-flow-panel border border-flow-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium">Auto-copy to clipboard</p>
            <p className="text-xs text-slate-500">Copy the polished text as soon as it's ready.</p>
          </div>
          <button
            onClick={() => onChange({ ...settings, autoCopy: !settings.autoCopy })}
            className={`relative h-6 w-11 rounded-full transition-colors ${settings.autoCopy ? 'bg-flow-violet' : 'bg-flow-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.autoCopy ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Personal dictionary</p>
          <p className="text-xs text-slate-500 mb-3">Names or jargon Flow should spell correctly when it hears them.</p>

          <div className="flex gap-2 mb-3">
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addWord()}
              placeholder="Add a word..."
              className="flex-1 rounded-lg bg-flow-bg border border-flow-border px-3 py-2 text-sm focus:outline-none focus:border-flow-violet"
            />
            <button
              onClick={addWord}
              className="rounded-lg bg-flow-violet px-3 py-2 text-white hover:bg-flow-violet/90"
              aria-label="Add word"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {settings.dictionary.map((word) => (
              <span key={word} className="flex items-center gap-1 rounded-full bg-flow-bg border border-flow-border px-2.5 py-1 text-xs">
                {word}
                <button onClick={() => removeWord(word)} className="text-slate-500 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {settings.dictionary.length === 0 && (
              <p className="text-xs text-slate-600">No custom words yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
