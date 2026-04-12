// src/lib/seedCategories.ts
// Creates default categories for a user on first login

import { prisma } from "@/src/lib/prisma";

const DEFAULT_CATEGORIES = [
  {
    name: "cooking",
    displayName: "Cooking & Food",
    description: "Recipes, food tips, cooking techniques, restaurant reviews",
  },
  {
    name: "sports",
    displayName: "Sports & Athletics",
    description: "Sports news, athlete stories, fitness tips, game analysis",
  },
  {
    name: "fitness",
    displayName: "Health & Fitness",
    description: "Workout routines, wellness tips, nutrition advice",
  },
  {
    name: "travel",
    displayName: "Travel & Adventure",
    description: "Travel guides, destination highlights, travel tips",
  },
  {
    name: "technology",
    displayName: "Technology & Innovation",
    description: "Tech news, product reviews, digital trends",
  },
  {
    name: "business",
    displayName: "Business & Entrepreneurship",
    description: "Business tips, startup stories, professional advice",
  },
];

export async function ensureDefaultCategories(userId: string) {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId, name: cat.name } },
      update: {},
      create: { ...cat, userId },
    });
  }
}
