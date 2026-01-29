const savePost = async (title: string, content: string, image: string) => {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      content,
      image,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to save post");
  }

  return await res.json();
};
