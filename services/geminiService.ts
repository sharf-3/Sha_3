import { GoogleGenAI } from '@google/genai';
import { GeneratedScript, ScriptResponseSchema } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFacelessScript = async (
  nicheTitle: string,
  topic: string,
  tone: string = 'engaging'
): Promise<GeneratedScript> => {
  const ai = getClient();

  const prompt = `
    You are a world-class social media strategist specializing in "faceless" content creation.
    Create a viral video script for the Niche: "${nicheTitle}".
    Topic: "${topic}".
    Tone: "${tone}".
    
    The video should be optimized for Facebook Reels / TikTok / YouTube Shorts (Vertical format).
    It must NOT require a human face. Focus on Stock Footage, Animations, Gameplay, or Product shots as visual cues.
    
    Return a JSON object with a catchy title, a strong hook (first 3s), script segments with visual cues, hashtags, and a caption.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ScriptResponseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GeneratedScript;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateVideoClip = async (prompt: string): Promise<string> => {
  const ai = getClient();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    if (operation.error) {
       console.error('Video generation failed:', operation.error);
       const errorMessage = (operation.error as any).message || 'Video generation failed';
       throw new Error(errorMessage);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    // Fetch the video content using the API Key
    const apiKey = process.env.API_KEY;
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo API Error:", error);
    throw error;
  }
};