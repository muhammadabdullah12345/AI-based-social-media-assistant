// src/app/dashboard/settings/connect-manual/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import ManualConnectClient from "./ManualConnectClient";

export default async function ManualConnectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <ManualConnectClient />;
}
