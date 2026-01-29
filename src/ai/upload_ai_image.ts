export const uploadAIImage = async (base64Image: string) => {
  const res = await fetch("/api/upload-ai-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Image }),
  });

  if (!res.ok) throw new Error("AI image upload failed");

  const data = await res.json();
  return data.cloudinaryUrl;
};
