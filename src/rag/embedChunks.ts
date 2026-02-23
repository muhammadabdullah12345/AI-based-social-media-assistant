import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
});

export async function embedChunks(chunks: string[]) {
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: chunk,
      });

      // Log full response shape so we can see exactly what the SDK returns
      console.log("[embedChunks] raw response keys:", Object.keys(res));
      console.log(
        "[embedChunks] res.embedding:",
        JSON.stringify(res.embedding)?.slice(0, 100),
      );
      console.log(
        "[embedChunks] res.embeddings:",
        JSON.stringify((res as any).embeddings)?.slice(0, 100),
      );

      // Try all possible response shapes
      const values =
        res.embedding?.values ??
        (res as any).embeddings?.[0]?.values ??
        (res as any).values;

      if (!values || values.length === 0) {
        // Log the full response before throwing so we can see what we got
        console.error(
          "[embedChunks] Full response:",
          JSON.stringify(res).slice(0, 500),
        );
        throw new Error(
          `Embedding returned no values for chunk: "${chunk.slice(0, 50)}..."`,
        );
      }

      return {
        content: chunk,
        embedding: values as number[],
      };
    }),
  );

  return results;
}
