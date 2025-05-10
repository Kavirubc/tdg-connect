import Link from "next/link";
import Image from "next/image";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is logged in, show personalized view
  if (session) {
    return (
      <div className="min-h-screen">
        {/* Hero section for logged in users */}
        <section className="bg-gradient-to-b from-[#c2e0f0] to-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold mb-4 text-[#2f6c8e]">Welcome back, {session.user?.name}!</h1>
            <p className="text-xl text-gray-700 mb-8">Continue building your community connections</p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-[#7bb5d3] text-white py-3 px-6 rounded-full hover:bg-[#5a9cbf] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Your Dashboard
              </Link>

              <Link
                href="/connections"
                className="bg-[#e6d7c4] text-[#333333] py-3 px-6 rounded-full hover:bg-[#d1b89c] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Your Connections
              </Link>
            </div>
          </div>
        </section>

        

        {/* Suggested Connections */}
       
      </div>
    );
  }

  // For non-logged in users, show welcome page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#c2e0f0] to-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-8">
            <Image
              src="/globe.svg"
              alt="TDG Connect Logo"
              width={100}
              height={100}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2f6c8e]">Welcome to TDG Connect</h1>
          <p className="text-xl text-gray-700 mb-8">Build meaningful connections in your community</p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/login"
              className="bg-[#7bb5d3] text-white py-3 px-8 rounded-full hover:bg-[#5a9cbf] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Log In
            </Link>

            <Link
              href="/auth/register"
              className="bg-[#e6d7c4] text-[#333333] py-3 px-8 rounded-full hover:bg-[#d1b89c] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
     

      {/* Testimonials Section */}
      
    </div>
  );
}
