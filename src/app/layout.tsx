import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import SessionProvider from "@/components/SessionProvider";
import PostHogAnalyticsProvider from "@/components/PostHogAnalyticsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TDG Connect - Community App by Kaviru H",
  description: "Connect with people in your community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          <PostHogAnalyticsProvider>
            <header className="bg-[#7bb5d3] text-white p-4 shadow-sm">
              <Navigation session={session} />
            </header>
            <main className="container mx-auto max-w-6xl px-4 py-6 flex-grow">
              {children}
            </main>
            <footer className="py-6 bg-[#e6d7c4] text-[#333333]">
              <div className="container mx-auto max-w-6xl px-4 text-center text-sm">
                <p>© {new Date().getFullYear()} <Link href="https://kaviru.cc">Kaviru H | TDG Connect - Building communities together</Link></p>
              </div>
            </footer>
          </PostHogAnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
