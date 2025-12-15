import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import { NextResponse } from "next/server";

export async function POST() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY!,
  });

  const prompt =
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const candidate = response.candidates?.[0];
  if (!candidate) {
    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      await fs.writeFile("public/gemini-image.png", buffer);

      return NextResponse.json({
        imageUrl: "/gemini-image.png",
      });
    }
  }

  return NextResponse.json({ error: "No image data" }, { status: 500 });
}
