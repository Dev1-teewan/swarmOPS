import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Privy from "@/provider/privy";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import OnchainKitProvider from "@/provider/onchainKit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwarmOPS",
  description: "AI Agent Swarm Wallet Manager Platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Privy>
            <OnchainKitProvider>
              {children}
            </OnchainKitProvider>
          </Privy>
        </ThemeProvider>
      </body>
    </html>
  );
}
