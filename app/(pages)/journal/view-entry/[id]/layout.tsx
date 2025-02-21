// app/journal/view-entry/layout.tsx
"use client"; // Important for SessionProvider
import { SessionProvider } from "next-auth/react";

export default function ViewEntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}