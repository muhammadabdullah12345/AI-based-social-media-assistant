import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import InstagramPostHistory from "@/src/components/InstagramHistory";

export default async function InstagramHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <InstagramPostHistory />;
}
