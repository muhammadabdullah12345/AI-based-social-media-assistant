import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import TwitterForm from "@/src/components/TwitterForm";

export default async function TwitterDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <TwitterForm />;
}
