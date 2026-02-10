import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { redirect } from "next/navigation";
import LinkedinForm from "@/src/components/LinkedinForm";

export default async function LinkedinDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <LinkedinForm />;
}
