export type ToneStyle = 'default' | 'professional' | 'casual' | 'notes' | 'email' | 'bullets';

export interface ToneOption {
  id: ToneStyle;
  label: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'default', label: 'Clean-up' },
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'notes', label: 'Notes' },
  { id: 'email', label: 'Email' },
  { id: 'bullets', label: 'Bullets' },
];

export interface DictationEntry {
  id: string;
  timestamp: number;
  rawTranscript: string;
  polishedText: string;
  tone: ToneStyle;
  durationMs: number;
}

export type AppStatus = 'idle' | 'recording' | 'transcribing' | 'error';

export interface AppSettings {
  tone: ToneStyle;
  autoCopy: boolean;
  dictionary: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  tone: 'default',
  autoCopy: true,
  dictionary: [],
};
