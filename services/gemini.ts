
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini client with direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getNailRecommendation = async (prompt: string, language: string = 'en') => {
  try {
    const langInstruction = language === 'fr' 
      ? "Répondez en français s'il vous plaît." 
      : "Please respond in English.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional nail stylist named Fred. A client is asking for design advice based on this request: "${prompt}". Suggest 3 specific nail design ideas including shape, color, and finish. Keep the tone friendly and expert. ${langInstruction}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A quick expert summary of the vibe." },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  shape: { type: Type.STRING },
                  colors: { type: Type.STRING },
                  details: { type: Type.STRING }
                },
                required: ["title", "shape", "colors", "details"]
              }
            }
          },
          required: ["summary", "recommendations"]
        }
      }
    });

    // Extract text directly from response property as per @google/genai SDK
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
