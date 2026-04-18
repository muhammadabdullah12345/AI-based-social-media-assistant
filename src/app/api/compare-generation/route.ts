// src/app/api/compare-generation/route.ts
// Generates two posts simultaneously:
// 1. Without category (generic Gemini)
// 2. With category knowledge base (RAG-enhanced)
// Returns both with metadata showing what context was injected

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

const META_MODEL = "gemini-2.5-flash";

// ── Generate without any category context ────────────────────────────
async function generateWithoutCategory(
  topic: string,
  platform: string,
  tone: string,
): Promise<{ title: string; content: string; promptUsed: string }> {
  const prompt = `
You are a professional social media strategist.

Generate 1 ${platform} post about the given topic.

Return VALID JSON ONLY:
{
  "title": "",
  "content": ""
}

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
`;

  const response = await ai.models.generateContent({
    model: META_MODEL,
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "{}");
  return {
    title: parsed.title ?? "",
    content: parsed.content ?? "",
    promptUsed: prompt.trim(),
  };
}

// ── Retrieve RAG context from category ───────────────────────────────
async function getCategoryContext(
  categoryId: string,
  topic: string,
): Promise<{
  examples: Array<{ title: string; content: string; tone: string }>;
  documentChunks: string[];
  categoryName: string;
}> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      examples: { take: 5, orderBy: { createdAt: "desc" } },
      documents: {
        include: {
          document: { include: { chunks: { take: 50 } } },
        },
      },
    },
  });

  if (!category) throw new Error("Category not found");

  // Score chunks by relevance to topic
  const allChunks = category.documents.flatMap((cd) =>
    cd.document.chunks.map((chunk) => chunk.content),
  );

  const topicWords = topic
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 3);

  const scoredChunks = allChunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    const score =
      topicWords.reduce(
        (acc, word) => acc + (lower.includes(word) ? 2 : 0),
        0,
      ) + (lower.includes(topic.toLowerCase()) ? 5 : 0);
    return { chunk, score };
  });

  const topChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((c) => c.chunk);

  return {
    examples: category.examples.map((e) => ({
      title: e.title,
      content: e.content,
      tone: e.tone,
    })),
    documentChunks: topChunks,
    categoryName: category.displayName,
  };
}

// ── Generate WITH category context (RAG) ─────────────────────────────
async function generateWithCategory(
  topic: string,
  platform: string,
  tone: string,
  categoryId: string,
): Promise<{
  title: string;
  content: string;
  promptUsed: string;
  retrievedChunks: string[];
  examplesUsed: number;
  chunksUsed: number;
}> {
  const { examples, documentChunks, categoryName } = await getCategoryContext(
    categoryId,
    topic,
  );

  const examplesSection =
    examples.length > 0
      ? `STYLE REFERENCE EXAMPLES (${examples.length} examples from your knowledge base):
${examples
  .map(
    (ex, i) => `Example ${i + 1}:
Title: ${ex.title}
Content: ${ex.content.slice(0, 300)}...`,
  )
  .join("\n\n")}`
      : "";

  const documentSection =
    documentChunks.length > 0
      ? `RETRIEVED KNOWLEDGE (${documentChunks.length} relevant chunks from your ${documentChunks.length > 0 ? documentChunks.length : 0} uploaded documents):
${documentChunks
  .map((chunk, i) => `[Chunk ${i + 1}]: ${chunk.slice(0, 400)}`)
  .join("\n\n")}`
      : "";

  const prompt = `
You are a professional social media strategist specializing in ${categoryName}.

${examplesSection}

${documentSection}

Using the knowledge and style from the examples and retrieved documents above,
generate 1 highly specific, expert-level ${platform} post.
The post MUST reference specific details, facts, or techniques from the retrieved knowledge.

Return VALID JSON ONLY:
{
  "title": "",
  "content": ""
}

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
`;

  const response = await ai.models.generateContent({
    model: META_MODEL,
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "{}");

  return {
    title: parsed.title ?? "",
    content: parsed.content ?? "",
    promptUsed: prompt.trim(),
    retrievedChunks: documentChunks,
    examplesUsed: examples.length,
    chunksUsed: documentChunks.length,
  };
}

// ── Main route handler ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, platform, tone, categoryId } = await req.json();

  if (!topic || !categoryId) {
    return NextResponse.json(
      { error: "topic and categoryId are required" },
      { status: 400 },
    );
  }

  try {
    // Run both generations in parallel
    const [withoutResult, withResult] = await Promise.all([
      generateWithoutCategory(topic, platform ?? "instagram", tone ?? "casual"),
      generateWithCategory(
        topic,
        platform ?? "instagram",
        tone ?? "casual",
        categoryId,
      ),
    ]);

    // Calculate similarity score to show how different they are
    const withoutWords = new Set(
      withoutResult.content.toLowerCase().split(/\s+/),
    );
    const withWords = new Set(withResult.content.toLowerCase().split(/\s+/));
    const intersection = [...withoutWords].filter((w) =>
      withWords.has(w),
    ).length;
    const union = new Set([...withoutWords, ...withWords]).size;
    const similarityPercent = Math.round((intersection / union) * 100);
    const uniquenessPercent = 100 - similarityPercent;

    return NextResponse.json({
      topic,
      platform: platform ?? "instagram",
      tone: tone ?? "casual",
      without: {
        title: withoutResult.title,
        content: withoutResult.content,
        promptUsed: withoutResult.promptUsed,
        contextInjected: false,
        retrievedChunks: [],
        examplesUsed: 0,
        chunksUsed: 0,
      },
      with: {
        title: withResult.title,
        content: withResult.content,
        promptUsed: withResult.promptUsed,
        contextInjected: true,
        retrievedChunks: withResult.retrievedChunks,
        examplesUsed: withResult.examplesUsed,
        chunksUsed: withResult.chunksUsed,
      },
      analysis: {
        similarityPercent,
        uniquenessPercent,
        ragContextSize: withResult.retrievedChunks.join(" ").length,
        totalChunksRetrieved: withResult.chunksUsed,
        totalExamplesUsed: withResult.examplesUsed,
      },
    });
  } catch (err: any) {
    console.error("[Compare Generation]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
