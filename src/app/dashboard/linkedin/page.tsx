import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authoptions";
import { redirect } from "next/navigation";
import LinkedinForm from "@/src/components/LinkedinForm";

export default async function InstagramDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <LinkedinForm />;
}
