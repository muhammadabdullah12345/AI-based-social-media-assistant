import { GoogleGenAI } from "@google/genai";
import axios from "axios";
export const Gemini_api_key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const ai = new GoogleGenAI({
  apiKey: Gemini_api_key,
});

// export async function generateImage(prompt: string) {
//   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0:generateImage?key=${apiKey}`;

//   const body = {
//     prompt: {
//       text: prompt,
//     },
//   };

//   const response = await axios.post(url, body);

//   // Extract Base64
//   const imageBase64 = response.data.images[0].imageBytes;

//   return imageBase64;
// }

export async function generatePost(
  topic: string,
  targetAudience: string,
  tone: string,
  platfrom: string,
  emojiStatus: string
): Promise<{ title: string; content: string; image_prompt: string }> {
  const prompt = `
          You are a content creator which generates every kind of social media post including each aspect of life.Please format your response as valid JSON with exactly this structure:
    {
      "title": "An engaging title for the post",
      "content": "Create a 50 words social media post about ${topic} for ${platfrom}.Tone should be ${tone} and target audience should be ${targetAudience}.I want to ${emojiStatus} emojis.",
      "image_prompt": "A concise description for an AI image generator to create an image that complements the post"
    }
     Make sure to return only valid JSON, no additional text or formatting.
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [prompt],
    config: {
      responseMimeType: "application/json",
    },
  });

  console.log(response);
  console.log(response.text);
  const res = JSON.parse(response.text || "");
  // const imageRes = await ai.models.generateImages({
  //   model: "imagen-3.0",
  //   prompt: res.image_prompt,
  //   config: {
  //     numberOfImages: 1,
  //   },
  // });
  console.log(res);

  // const imageBase64 = await generateImage(res.image_prompt);

  // return {
  //   ...res,
  //   image: imageBase64,
  // };
  return res;
}
