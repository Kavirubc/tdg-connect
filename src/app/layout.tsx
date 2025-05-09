import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from "@/lib/auth";

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
        <header className="bg-[#7bb5d3] text-white p-4 shadow-sm">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <h1 className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              TDG Connect
            </h1>
            {session ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline">Welcome, {session.user?.name || 'User'}</span>
                <Link href="/api/auth/signout" className="community-btn bg-[#d1b89c] hover:bg-[#b29777] text-white px-3 py-1.5 rounded-full text-sm transition-colors">
                  Logout
                </Link>
              </div>
            ) : (
              <Link href="/auth/login" className="community-btn community-btn-secondary">
                Login
              </Link>
            )}
          </div>
        </header>
        <main className="container mx-auto max-w-6xl px-4 py-6 flex-grow">
          {children}
        </main>
        <footer className="py-6 bg-[#e6d7c4] text-[#333333]">
          <div className="container mx-auto max-w-6xl px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} <Link href="https://kaviru.cc">Kaviru H | TDG Connect - Building communities together</Link></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
