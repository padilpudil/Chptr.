import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          username: `pending_google_${profile.sub}`,
          email: profile.email,
          avatarUrl: profile.picture,
          role: "USER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username || user.name;
        token.role = user.role;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.username = session.name;
        if (session.username) token.username = session.username;
        if (session.picture) token.picture = session.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
