// next-auth.d.ts
import NextAuth, { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string; // Add the uid property
  }

  interface Session {
    user?: User;
  }
}