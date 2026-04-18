// src/app/dashboard/compare/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import CompareClient from "./CompareClient";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <CompareClient />;
}
