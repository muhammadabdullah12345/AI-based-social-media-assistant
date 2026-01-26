import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  // console.log("❤ Signup API called");
  const { email, password } = await req.json();
  // console.log("❤ Signup credentials recieved");
  const hashedPassword = await bcrypt.hash(password, 12);
  // console.log("❤ Signup password hashed");
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  // console.log("❤ Signup user created");
  return Response.json({ success: true, message: "User created successfully" });
}
