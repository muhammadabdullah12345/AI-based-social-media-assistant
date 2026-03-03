// src/app/dashboard/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import SocialAccountsSettings from "@/src/components/SocialAccountsSettings";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <SocialAccountsSettings />;
}
