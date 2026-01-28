import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import GeneratorForm from "@/src/components/generatorform";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // return <div>Welcome {session.user?.email}</div>;
  return <GeneratorForm />;
}
