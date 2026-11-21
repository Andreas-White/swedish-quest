import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Provider } from "next-auth/providers";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const providers: Provider[] = [
  // Email + password. Always available — no SMTP needed.
  // Signup via POST /api/signup, login via this provider.
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw) => {
      const parsed = z
        .object({ email: z.string().email(), password: z.string().min(8) })
        .safeParse(raw);
      if (!parsed.success) return null;
      const email = parsed.data.email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

// Email magic-link (passwordless). Requires EMAIL_SERVER + EMAIL_FROM.
if (process.env.EMAIL_SERVER) {
  providers.push(
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM ?? "Swedish Quest <noreply@example.com>",
    }),
  );
}

// Google OAuth. Requires AUTH_GOOGLE_ID/SECRET.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT is required for the Credentials (email+password) provider.
  // Email magic-link + Google still work: they use the adapter for
  // users/accounts/verification-tokens, only sessions live in the JWT.
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers,
  pages: { signIn: "/login" },
  trustHost: true,
});
