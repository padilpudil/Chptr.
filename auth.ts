import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        // Check for dev-mode google bypass
        if (identifier === "google-developer@chptr.com" && password === "google-bypass-token-dev-mode") {
          let user = await db.user.findUnique({
            where: { email: "google-developer@chptr.com" },
          });
          if (!user) {
            let username = "pending_google_developer";
            const existingUserByUsername = await db.user.findUnique({
              where: { username },
            });
            if (existingUserByUsername) {
              username = `pending_google_developer_${Math.floor(1000 + Math.random() * 9000)}`;
            }
            user = await db.user.create({
              data: {
                username,
                email: "google-developer@chptr.com",
                avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                bio: "Simulated Google Developer Account for testing.",
                role: "USER"
              }
            });
          }
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
          };
        }

        // Find user by email or username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier }
            ]
          }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Run the base config jwt callback
      let updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session });
      
      // Perform Node-specific db check to fetch fresh credentials/roles
      if (updatedToken.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: updatedToken.id as string },
            select: { role: true, username: true }
          });
          if (dbUser) {
            updatedToken.role = dbUser.role;
            updatedToken.username = dbUser.username;
          }
        } catch (e) {
          // Fallback if db is transiently offline
        }
      }

      return updatedToken;
    },
  }
});
