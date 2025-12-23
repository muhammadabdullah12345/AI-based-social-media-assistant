import { GoogleGenAI } from "@google/genai";

export async function generateImage(prompt: string) {
  const Gemini_api_key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  const ai = new GoogleGenAI({
    apiKey: Gemini_api_key,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create a realistic and aesthetic image with this prompt:${prompt}`,
          },
        ],
      },
    ],
  });

  const candidate = response.candidates?.[0];

  if (!candidate?.content?.parts) {
    return {
      error: "Image generation failed",
    };
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return {
        image: part.inlineData.data,
      };
    }
  }
}
