// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// export async function generatePost(topic: string): Promise<string> {
//   const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-pro",
//     apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
//   });

//   const response = await model.invoke([
//     [
//       "system",
//       "You are a helpful assistant that generates a short paragraph post on a given topic.Generate the post about the user's topic. Make sure the post is informative, engaging, and well-structured.",
//     ],
//     ["human", topic],
//   ]);

//   const res = response.text;
//   // console.log(res);
//   return res;
// }
//  generationConfig: { response_mime_type: "application/json",response_schema: },
import { GoogleGenAI } from "@google/genai";
const Gemini_api_key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const ai = new GoogleGenAI({
  apiKey: Gemini_api_key,
});

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

  // console.log(JSON.parse(response));
  // console.log(response);
  // console.log(response.text);
  const res = JSON.parse(response.text || "");
  const imageRes = await ai.models.generateImages({
    model: "imagen-3.0-generate-002",
    prompt: res.image_prompt,
    config: {
      numberOfImages: 1,
    },
  });
  console.log(res);
  console.log(imageRes);
  return res;
}
