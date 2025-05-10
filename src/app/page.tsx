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

        {/* Activity Feed Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-[#2f6c8e]">Recent Community Activity</h2>

            <div className="grid gap-6">
              {/* Activity Cards */}
              <div className="community-card p-6">
                <div className="flex items-start">
                  <div className="bg-[#c2e0f0] rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f6c8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">New Community Discussions</h3>
                    <p className="text-gray-600 mt-1">Join the latest conversations about technology, arts, and local events.</p>
                    <div className="mt-3">
                      <Link href="/discussions" className="text-[#7bb5d3] hover:underline font-medium">View discussions →</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="community-card p-6">
                <div className="flex items-start">
                  <div className="bg-[#e6d7c4] rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#b29777]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Upcoming Community Events</h3>
                    <p className="text-gray-600 mt-1">Check out meetups and events happening in your area this month.</p>
                    <div className="mt-3">
                      <Link href="/events" className="text-[#7bb5d3] hover:underline font-medium">View events →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Suggested Connections */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-[#2f6c8e]">People You May Know</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Connection Cards - These would be dynamically generated in a real app */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="community-card p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#c2e0f0] rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#5a95b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg">Community Member {i}</h3>
                  <p className="text-gray-600 text-sm mt-1">Interests: Technology, Art, Travel</p>
                  <button className="mt-4 bg-[#7bb5d3] text-white py-2 px-4 rounded-full hover:bg-[#5a9cbf] transition-all text-sm">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
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
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2f6c8e]">Why Join Our Community?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#c2e0f0] rounded-full p-4 inline-flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2f6c8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with Others</h3>
              <p className="text-gray-600">Find people with similar interests and build meaningful connections.</p>
            </div>

            <div className="text-center">
              <div className="bg-[#c2e0f0] rounded-full p-4 inline-flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2f6c8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Discussions</h3>
              <p className="text-gray-600">Participate in community discussions about topics you care about.</p>
            </div>

            <div className="text-center">
              <div className="bg-[#c2e0f0] rounded-full p-4 inline-flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2f6c8e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Attend Events</h3>
              <p className="text-gray-600">Discover and participate in local events and meetups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2f6c8e]">What Our Community Says</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial Cards */}
            <div className="community-card p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-16 h-16 bg-[#e6d7c4] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#b29777]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="italic text-gray-600">"TDG Connect helped me find like-minded individuals in my area. I've made lasting friendships and learned so much from this community."</p>
                  <p className="mt-3 font-semibold">- Sarah M.</p>
                </div>
              </div>
            </div>

            <div className="community-card p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-16 h-16 bg-[#e6d7c4] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#b29777]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="italic text-gray-600">"The events and discussions on TDG Connect have opened up new opportunities for me. It's more than just a social platform, it's a true community."</p>
                  <p className="mt-3 font-semibold">- Michael T.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/register"
              className="bg-[#7bb5d3] text-white py-3 px-8 rounded-full hover:bg-[#5a9cbf] transition-all shadow-md inline-flex items-center justify-center"
            >
              Join Our Community Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
