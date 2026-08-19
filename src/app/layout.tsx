import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

import { getSession } from "@/lib/auth";
import { SessionChecker } from "@/components/SessionChecker";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BoostWave CRM",
  description: "CRM for Real Estate linked to n8n WhatsApp Bot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full bg-[var(--bg-page)]">
        {session ? (
          <>
            <SessionChecker />
            <AppShell session={session}>
              {children}
            </AppShell>
          </>
        ) : (
          <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1B2838] to-[#0D1B2A] p-4">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
