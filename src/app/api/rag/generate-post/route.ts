import { prisma } from "@/src/lib/prisma";
import { retrieveTopChunks } from "@/src/rag/retrieveChunks";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

export async function POST(req: Request) {
  const { documentId, tone, targetAudience } = await req.json();

  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
  });

  const queryEmbeddingRes = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: "Create Instagram post from document",
  });

  const context = retrieveTopChunks(
    queryEmbeddingRes.embedding?.values!,
    chunks as any,
  );

  const prompt = `
You are an Instagram content expert.

Use ONLY the context below.

Context:
${context}

Tone: ${tone}
Audience: ${targetAudience}

Return EXACTLY 3 posts in JSON:
{
  "posts": [{ "title": "", "content": "", "image_prompt": "" }]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  return Response.json(JSON.parse(response.text!));
}
