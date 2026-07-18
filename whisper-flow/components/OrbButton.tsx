import React from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { AppStatus } from '../types.ts';

interface OrbButtonProps {
  status: AppStatus;
  level: number;
  onPress: () => void;
}

const OrbButton: React.FC<OrbButtonProps> = ({ status, level, onPress }) => {
  const isRecording = status === 'recording';
  const isProcessing = status === 'transcribing';

  const ringScale = 1 + level * 0.5;

  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <div
          className="absolute rounded-full bg-flow-violet/25 transition-transform duration-75"
          style={{ width: 140, height: 140, transform: `scale(${ringScale})` }}
        />
      )}
      <button
        onClick={onPress}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        className={`relative h-28 w-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-flow-violet/40
          ${isRecording ? 'bg-gradient-to-br from-flow-violet to-red-500 orb-recording' : 'bg-gradient-to-br from-flow-violet to-flow-blue hover:scale-105'}
        `}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-10 w-10 text-white orb-processing" />
        ) : (
          <Mic className="h-10 w-10 text-white" />
        )}
      </button>
    </div>
  );
};

export default OrbButton;
