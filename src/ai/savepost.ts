export const savePost = async (
  title: string,
  content: string,
  image: string,
  platform: string,
  sourceType: string,
  documentId?: string,
) => {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content,
      image,
      platform,
      sourceType,
      documentId,
    }),
  });

  if (!res.ok) throw new Error("Save failed");
};
