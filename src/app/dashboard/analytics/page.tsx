// src/app/dashboard/analytics/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <AnalyticsClient />;
}
