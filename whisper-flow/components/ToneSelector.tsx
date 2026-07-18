import React from 'react';
import { ToneStyle, TONE_OPTIONS } from '../types.ts';

interface ToneSelectorProps {
  value: ToneStyle;
  onChange: (tone: ToneStyle) => void;
  disabled?: boolean;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {TONE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50
            ${value === opt.id
              ? 'bg-flow-violet text-white border-flow-violet'
              : 'bg-transparent text-slate-400 border-flow-border hover:border-flow-violet/60 hover:text-slate-200'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ToneSelector;
