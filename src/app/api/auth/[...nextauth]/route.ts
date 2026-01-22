import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

// const prisma = new PrismaClient();

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
