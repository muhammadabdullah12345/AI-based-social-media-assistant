import { GoogleGenAI } from "@google/genai";
import { generateImage } from "./generateImage";
const Gemini_api_key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const ai = new GoogleGenAI({
  apiKey: Gemini_api_key,
});

export async function generatePost(
  topic: string,
  targetAudience: string,
  tone: string,
  platform: string,
  emojiStatus: string,
): Promise<
  {
    title: string;
    content: string;
    image_prompt: string;
    image?: string;
  }[]
> {
  const prompt = `
You are a professional social media strategist.

Generate EXACTLY 3 different Instagram post variations.
Each variation must have a different writing style.

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
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [prompt],
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "");
  const posts = parsed.posts;

  // Generate image for EACH variation
  const postsWithImages = await Promise.all(
    posts.map(async (post: any) => {
      const image = await generateImage(post.image_prompt);
      return { ...post, image: image?.image };
    }),
  );

  return postsWithImages;
}
