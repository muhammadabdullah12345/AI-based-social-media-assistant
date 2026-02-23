import { GoogleGenAI } from "@google/genai";
import { generateImage } from "./generateImage";
import { prisma } from "@/src/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

export async function generatePostFromDocument(
  documentId: string,
  tone: string,
  platform: string,
  emojiStatus: string,
) {
  // Fetch document chunks from the database
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { chunks: true },
  });

  if (!document) throw new Error("Document not found");

  // Combine all chunks into one context string (limit to avoid token overflow)
  const context = document.chunks
    .map((c: { content: string }) => c.content)
    .join("\n\n")
    .slice(0, 8000);

  const prompt = `
You are a professional social media strategist.

Based on the following document content, generate EXACTLY 3 different ${platform} post variations.
Each variation must have a different writing style and highlight different aspects of the document.

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

Document Content:
"""
${context}
"""

Platform: ${platform}
Tone: ${tone}
Emoji preference: ${emojiStatus}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "");
  const posts = parsed.posts;

  // Generate image for each post — if it fails, continue without image
  const postsWithImages = await Promise.all(
    posts.map(async (post: any) => {
      try {
        const result = await generateImage(post.image_prompt);
        return { ...post, image: result?.image ?? null };
      } catch (err) {
        console.warn(
          "[generatePostFromDocument] Image generation failed, skipping:",
          err,
        );
        return { ...post, image: null };
      }
    }),
  );

  return postsWithImages;
}
