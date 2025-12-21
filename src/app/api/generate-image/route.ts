import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("IMAGE PROMPT:", prompt);
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
              text: `Create a nano banana image realistic and aesthetic with this prompt:${prompt}`,
            },
          ],
        },
      ],
    });

    // console.log("GEMINI RESPONSE:", JSON.stringify(response, null, 2));

    const candidate = response.candidates?.[0];

    if (!candidate?.content?.parts) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return NextResponse.json({
          image: part.inlineData.data,
        });
      }
    }

    return NextResponse.json({ error: "No image data found" }, { status: 500 });
  } catch (err) {
    console.error("IMAGE API ERROR:", err);
    return NextResponse.json({ error: "Server crashed" }, { status: 500 });
  }
}
