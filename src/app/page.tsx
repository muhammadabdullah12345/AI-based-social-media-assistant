"use client";

import React, { useEffect, useState } from "react";
// import { generatePost } from "../ai/generate-post";
// import { generateImage } from "../ai/generateImage";

export default function page() {
  const [topic, setTopic] = useState("traveling");
  const [platform, setPlatform] = useState("instagram");
  const [targetAudience, setTargetAudience] = useState("funny people");
  const [tone, setTone] = useState("funny");
  const [emojis, setEmojis] = useState(false);
  const [emojiStatus, setEmojiStatus] = useState("");
  const [post, setPost] = useState<{
    title: string;
    content: string;
    image_prompt: string;
    image?: string;
  } | null>(null);
  // async function handleGenerate() {
  //   const generatedPost = await generatePost(topic);
  //   setPost(generatedPost);
  // }

  async function handleGeneratePost() {
    const res = await fetch("/api/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        targetAudience,
        tone,
        platform,
        emojiStatus,
      }),
    });

    const data = await res.json();
    setPost(data);
  }
  async function handleGenerateImage() {
    if (!post?.image_prompt) return;

    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: post.image_prompt,
      }),
    });

    if (!res.ok) {
      console.error("Image API failed");
      return;
    }

    const data = await res.json();
    console.log(data);

    setPost((prev) =>
      prev
        ? {
            ...prev,
            image: data.image,
          }
        : prev
    );
  }

  useEffect(() => {
    if (emojis) {
      setEmojiStatus("add");
    } else setEmojiStatus("not add");
  }, [emojis]);

  // async function handleGenerateImage() {
  //   const generatedImage = await generateImage();
  //   return generatedImage;
  // }

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
          className=" text-lg outline-none font-medium cursor-pointer"
          onChange={(e) => setEmojis(e.target.checked)}
          checked={emojis}
        />
      </div>
      <button
        className="rounded-lg border border-amber-400 p-2 cursor-pointer text-sm hover:bg-amber-400 hover:text-black transition-all font-semibold mt-5
        "
        onClick={handleGeneratePost}
      >
        Generate
      </button>
      <button
        onClick={handleGenerateImage}
        disabled={!post}
        className="rounded-lg border border-amber-400 p-2 text-sm font-semibold mt-5 cursor-pointer  hover:bg-amber-400
             disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Image
      </button>
      <div className="w-2/3 mt-10 text-lg text-justify font-normal flex flex-col items-center justify-center gap-8">
        {post && (
          <>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p>{post.content}</p>
            {post.image && (
              <img
                src={`data:image/png;base64,${post.image}`}
                className="h-80 w-80"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
