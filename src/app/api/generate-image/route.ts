import { generateImage } from "@/src/ai/generateImage";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("IMAGE PROMPT:", prompt);

    const image = await generateImage(prompt);

    return NextResponse.json(image);
  } catch (err) {
    console.error("IMAGE API ERROR:", err);
    return NextResponse.json({ error: "Server crashed" }, { status: 500 });
  }
}
