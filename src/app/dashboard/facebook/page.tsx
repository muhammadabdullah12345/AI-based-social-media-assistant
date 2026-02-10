import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import FacebookForm from "@/src/components/FacebookForm";

export default async function InstagramDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <FacebookForm />;
}
