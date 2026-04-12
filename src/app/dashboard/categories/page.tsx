// src/app/dashboard/categories/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <CategoriesClient />;
}
