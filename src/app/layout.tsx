import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import SessionProvider from "@/components/SessionProvider";
import PostHogAnalyticsProvider from "@/components/PostHogAnalyticsProvider";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TDG Connect - Improve your community life",
  description: "Build meaningful connections and achieve your networking goals",
  icons: {
    icon: "/rocket.svg"
  }
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
            <header className="bg-gradient-to-r from-[#2f78c2] to-[#31b3e3] text-white p-4 shadow-md sticky top-0 z-50">
              <Navigation session={session} />
            </header>
            <main className="container mx-auto max-w-6xl px-4 py-6 flex-grow lumo-fade-in">
              {children}
            </main>
            <footer className="py-8 bg-[#f0f5fb] text-[#333333] border-t border-[#e2e8f0]">
              <div className="container mx-auto max-w-6xl px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center mb-4 md:mb-0">
                    <Image
                      src="/rocket.svg"
                      alt="TDG Connect"
                      width={30}
                      height={36}
                      className="mr-2 lumo-rocket"
                    />
                    <span className="font-semibold text-[#2f78c2]">TDG Connect</span>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm">© {new Date().getFullYear()} <Link href="https://kaviru.cc" className="text-[#2f78c2] hover:text-[#155ba5] transition-colors">Kaviru H | TDG Connect</Link></p>
                    <p className="text-xs text-gray-500 mt-1">Building communities together, one connection at a time</p>
                  </div>
                </div>
              </div>
            </footer>
          </PostHogAnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
