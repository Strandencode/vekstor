import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendMagicLink, sendPasswordReset, sendVerificationEmail } from "./email";
import { createWorkspaceForUser } from "./workspace";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    "https://vekstor.vercel.app",
    "https://vekstor-strandencodes-projects.vercel.app",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink(email, url);
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createWorkspaceForUser(user);
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
