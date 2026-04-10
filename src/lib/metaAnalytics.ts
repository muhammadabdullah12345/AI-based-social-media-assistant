// src/lib/metaAnalytics.ts
// Engagement rate calculator — insights fetching moved to syncAnalytics.ts

export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  saves: number,
  reach: number,
): number {
  if (reach === 0) return 0;
  const total = likes + comments + shares + saves;
  return parseFloat(((total / reach) * 100).toFixed(2));
}
