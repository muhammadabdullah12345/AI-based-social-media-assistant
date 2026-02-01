import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import InstagramForm from "@/src/components/InstagramForm";

export default async function InstagramDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <InstagramForm />;
}
