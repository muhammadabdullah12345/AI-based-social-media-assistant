export function buildPrompt(context: string, meta: any) {
  return `
You are an expert Instagram content strategist.

ONLY use the context below to generate the post.

Context:
${context}

Platform: Instagram
Tone: ${meta.tone}
Audience: ${meta.targetAudience}

Generate EXACTLY 3 post variations in valid JSON.
`;
}
