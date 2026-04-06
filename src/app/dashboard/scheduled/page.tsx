// src/app/dashboard/scheduled/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import ScheduledPostsClient from "./ScheduledPostsClient";

export default async function ScheduledPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <ScheduledPostsClient />;
}
