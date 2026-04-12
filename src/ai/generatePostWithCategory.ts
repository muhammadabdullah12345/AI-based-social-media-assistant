// src/ai/generatePostWithCategory.ts
// Generates posts using category knowledge base (our "fine-tuning")

import { GoogleGenAI } from "@google/genai";
import { generateImage } from "./generateImage";
import { prisma } from "@/src/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

// ── Fetch relevant knowledge for a category ──────────────────────────
async function getCategoryKnowledge(
  categoryId: string,
  topic: string,
): Promise<{
  examples: string;
  documentContext: string;
}> {
  // Get example posts for this category
  const examples = await prisma.categoryExample.findMany({
    where: { categoryId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  // Get documents linked to this category
  const categoryDocs = await prisma.categoryDocument.findMany({
    where: { categoryId },
    include: {
      document: {
        include: { chunks: true },
      },
    },
  });

  // Build examples string
  const examplesStr =
    examples.length > 0
      ? examples
          .map(
            (ex, i) =>
              `Example ${i + 1} (${ex.tone} tone, ${ex.platform}):\nTitle: ${ex.title}\nContent: ${ex.content}`,
          )
          .join("\n\n---\n\n")
      : "";

  // Build document context — find most relevant chunks using simple keyword matching
  let documentContext = "";
  if (categoryDocs.length > 0) {
    const allChunks = categoryDocs.flatMap((cd) =>
      cd.document.chunks.map((chunk) => chunk.content),
    );

    // Score chunks by relevance to topic
    const topicWords = topic.toLowerCase().split(" ");
    const scoredChunks = allChunks.map((chunk) => {
      const chunkLower = chunk.toLowerCase();
      const score = topicWords.reduce(
        (acc, word) => acc + (chunkLower.includes(word) ? 1 : 0),
        0,
      );
      return { chunk, score };
    });

    // Take top 5 most relevant chunks
    const topChunks = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c) => c.chunk);

    documentContext = topChunks.join("\n\n").slice(0, 4000);
  }

  return { examples: examplesStr, documentContext };
}

// ── Main generation function ─────────────────────────────────────────
export async function generatePostWithCategory({
  topic,
  targetAudience,
  tone,
  platform,
  emojiStatus,
  categoryId,
}: {
  topic: string;
  targetAudience: string;
  tone: string;
  platform: string;
  emojiStatus: string;
  categoryId: string;
}) {
  // Get category info
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Get knowledge base for this category
  const { examples, documentContext } = await getCategoryKnowledge(
    categoryId,
    topic,
  );

  // Build the enhanced prompt
  const categorySection = `
CATEGORY EXPERTISE: ${category.displayName}
Category Focus: ${category.description ?? ""}
`;

  const examplesSection = examples
    ? `
REFERENCE EXAMPLES (posts that performed well in this category — match this style):
${examples}

`
    : "";

  const documentSection = documentContext
    ? `
CATEGORY KNOWLEDGE BASE (use this domain knowledge to enrich the posts):
"""
${documentContext}
"""

`
    : "";

  const prompt = `
You are a professional social media strategist specializing in ${category.displayName} content.

${categorySection}
${examplesSection}
${documentSection}

Your task: Generate EXACTLY 3 different ${platform} post variations about the given topic.
Each variation must have a genuinely different angle, structure, and writing style.
Use the category knowledge and examples above to make posts more authentic, specific, and expert.

Return VALID JSON ONLY in this format:
{
  "posts": [
    {
      "title": "",
      "content": "",
      "image_prompt": ""
    }
  ]
}

Topic: ${topic}
Platform: ${platform}
Tone: ${tone}
Target Audience: ${targetAudience}
Emoji preference: ${emojiStatus}

Important:
- Draw on the category knowledge base to add specific facts, tips, or insights
- Match the style of the reference examples if provided
- Make each variation distinctly different
- Keep content authentic to the ${category.displayName} niche
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "");
  const posts = parsed.posts;

  // Generate images for each post
  const postsWithImages = await Promise.all(
    posts.map(async (post: any) => {
      try {
        const result = await generateImage(post.image_prompt);
        return { ...post, image: result?.image ?? null };
      } catch {
        return { ...post, image: null };
      }
    }),
  );

  return postsWithImages;
}
