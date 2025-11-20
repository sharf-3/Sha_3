import { Type } from '@google/genai';

export interface Niche {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  gradient: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface ScriptSegment {
  visualCue: string;
  audioScript: string;
  duration: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  segments: ScriptSegment[];
  hashtags: string[];
  caption: string;
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
}

// Schema for Gemini JSON output
export const ScriptResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Catchy viral title for the video" },
    hook: { type: Type.STRING, description: "The first 3 seconds audio hook" },
    caption: { type: Type.STRING, description: "Social media caption text" },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          visualCue: { type: Type.STRING, description: "Detailed description of stock footage or animation to show" },
          audioScript: { type: Type.STRING, description: "What the voiceover should say" },
          duration: { type: Type.STRING, description: "Estimated duration like '3s'" }
        }
      }
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["title", "hook", "segments", "hashtags", "caption"]
};