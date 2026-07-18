import { GoogleGenAI, Type } from "@google/genai";
import { ToneStyle } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL = 'gemini-2.5-flash-latest';

const TONE_INSTRUCTIONS: Record<ToneStyle, string> = {
  default: 'Lightly clean up disfluencies and add punctuation, but keep the wording natural and close to what was said.',
  professional: 'Rewrite as clear, professional prose suitable for a workplace message. Fix grammar, remove filler words, keep it concise.',
  casual: 'Rewrite in a relaxed, conversational tone, like a quick message to a friend. Keep it short and natural.',
  notes: 'Rewrite as concise notes: short sentences or fragments capturing the key points, no filler words.',
  email: 'Rewrite as a polished email body with clear paragraphs and a professional but warm tone. Only add a greeting or sign-off if implied by the content.',
  bullets: 'Rewrite as a clean bulleted list of the key points, one per line, each starting with "- ".',
};

const DICTATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.STRING,
      description: 'Verbatim transcription of the audio, including filler words like "um" and false starts.',
    },
    polished: {
      type: Type.STRING,
      description: 'The cleaned-up rewrite of the speech, per the requested style.',
    },
  },
  required: ['transcript', 'polished'],
};

const buildDictionaryNote = (dictionary: string[]): string =>
  dictionary.length
    ? `The speaker may use these specific names or terms; prefer this exact spelling whenever you hear something close to them: ${dictionary.join(', ')}.`
    : '';

export const transcribeAndPolish = async (
  base64Audio: string,
  mimeType: string,
  tone: ToneStyle,
  dictionary: string[]
): Promise<{ transcript: string; polished: string }> => {
  const prompt = `You are a dictation assistant. Listen to the audio and produce two fields:
1. "transcript": a verbatim transcription of exactly what was said, including filler words and false starts.
2. "polished": a rewrite of the speech. ${TONE_INSTRUCTIONS[tone]}
${buildDictionaryNote(dictionary)}
If the audio is silent or unintelligible, return empty strings for both fields.
Return only the JSON object.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Audio } },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: DICTATION_RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error('No response from the model.');
  const parsed = JSON.parse(text);
  return { transcript: parsed.transcript ?? '', polished: parsed.polished ?? '' };
};

export const restyleText = async (
  rawText: string,
  tone: ToneStyle,
  dictionary: string[]
): Promise<string> => {
  const prompt = `Rewrite the following dictated text. ${TONE_INSTRUCTIONS[tone]}
${buildDictionaryNote(dictionary)}

Text:
"""
${rawText}
"""

Return only the rewritten text, with no preamble or quotes around it.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text?.trim() || rawText;
};
