"use client";

import React, { useEffect, useState } from "react";
import { generatePost } from "../ai/generate-post";

export default function page() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [emojis, setEmojis] = useState(false);
  const [emojiStatus, setEmojiStatus] = useState("");
  const [post, setPost] = useState<{
    title: string;
    content: string;
    image_prompt: string;
  } | null>(null);
  // async function handleGenerate() {
  //   const generatedPost = await generatePost(topic);
  //   setPost(generatedPost);
  // }

  async function handleGenerate() {
    const generatedPost = await generatePost(
      topic,
      targetAudience,
      tone,
      platform,
      emojiStatus
    );
    setPost(generatedPost);
  }
  useEffect(() => {
    if (emojis) {
      setEmojiStatus("add");
    } else setEmojiStatus("not add");
  }, [emojis]);

  return (
    <div className="text-3xl font-bold min-h-screen  bg-amber-800 text-center flex flex-col justify-center items-center">
      Post Generator
      <div className="flex items-center justify-center gap-2 mt-5">
        <input
          type="text"
          placeholder="topic name"
          className="border-b text-2xl outline-none font-medium"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">
        <input
          type="text"
          placeholder="Platform"
          className="border-b text-2xl outline-none font-medium"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">
        <input
          type="text"
          placeholder="Target Audience"
          className="border-b text-2xl outline-none font-medium"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">  
        <input
          type="text"
          placeholder="Tone"
          className="border-b text-2xl outline-none font-medium"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-center gap-2 mt-5">
        <label htmlFor="" className="text-lg">
          Do you want to add emojis?
        </label>
        <input
          type="checkbox"
          className=" text-lg outline-none font-medium"
          onChange={(e) => setEmojis(e.target.checked)}
          checked={emojis}
        />
      </div>
      <button
        className="rounded-lg border border-amber-400 p-2 cursor-pointer text-sm hover:bg-amber-400 hover:text-black transition-all font-semibold mt-5
        "
        onClick={handleGenerate}
      >
        Generate
      </button>
      <div className="w-2/3 mt-10 text-lg text-justify font-normal">
        {post && (
          <>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p>{post.content}</p>
          </>
        )}
      </div>
    </div>
  );
}
