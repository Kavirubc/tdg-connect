import Link from "next/link";
import Image from "next/image";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import InvitationView from '@/components/InvitationView';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Get full user data including invitation image URL if user is logged in
  let userData = null;
  if (session?.user?.email) {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userData = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        inviteImageUrl: user.inviteImageUrl
      };
    }
  }

  // If user is logged in, show personalized view
  if (session) {
    return (
      <div className="min-h-screen">
        {/* Hero section for logged in users */}
        <section className="py-16 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
            <div className="mb-8 flex justify-center">
              <Image
                src="/rocket.svg"
                alt="TDG Connect Logo"
                width={80}
                height={90}
                className="lumo-rocket"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2f78c2]">Welcome back, <span className="text-[#31b3e3]">{session.user?.name}</span>!</h1>
            <p className="text-xl text-gray-700 mb-10">Continue building your community connections</p>

            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/dashboard"
                className="lumo-btn lumo-btn-primary py-3 px-8 rounded-full shadow-md flex items-center justify-center group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Your Dashboard
              </Link>

              <Link
                href="/connections"
                className="lumo-btn lumo-btn-wizard py-3 px-8 rounded-full shadow-md flex items-center justify-center group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Your Connections
              </Link>

              <Link
                href="/discover"
                className="lumo-btn lumo-btn-accent py-3 px-8 rounded-full shadow-md flex items-center justify-center group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Discover People
              </Link>
            </div>

            <div className="mt-10 text-center">
              <p className="text-gray-500 inline-flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#31b3e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Achieving your next goal is one spell away
              </p>
            </div>
          </div>
        </section>

        {/* Daily Grind Invitation Section */}
        {userData && (

          <div className="max-w-4xl mx-auto px-4">

            <InvitationView user={userData} />

          </div>

        )}
      </div>
    );
  }

  // For non-logged in users, show welcome page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-24">
        <div className="max-w-5xl mx-auto text-center px-4">
          <div className="mb-10 relative">
            <Image
              src="/rocket.svg"
              alt="TDG Connect Logo"
              width={120}
              height={140}
              className="mx-auto lumo-rocket"
            />
            <div className="absolute w-24 h-24 bg-[#a9e2f5]/30 rounded-full -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#2f78c2]">Improve your <span className="text-[#31b3e3]">community</span> life</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">Build meaningful connections and achieve your networking goals with TDG Connect</p>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/auth/login"
              className="lumo-btn lumo-btn-primary py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Log In
            </Link>

            <Link
              href="/auth/register"
              className="lumo-btn lumo-btn-wizard py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </Link>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#31b3e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Achieving your next goal is one spell away
            </p>
          </div>
        </div>
      </section>

      {/* Features Section with cards */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#2f78c2]">A Glimpse of what TDG Connect Offers</h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">Discover how our platform can transform your community experience</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="lumo-card p-8 text-center hover:-translate-y-2 transition-all duration-300">
              <div className="bg-[#81b6f1]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#2f78c2]">Build Connections</h3>
              <p className="text-gray-600">Connect with people who share your interests and expand your professional network easily.</p>
            </div>

            {/* Feature 2 */}
            <div className="lumo-card p-8 text-center hover:-translate-y-2 transition-all duration-300">
              <div className="bg-[#a9e2f5]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#31b3e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#31b3e3]">Discover People</h3>
              <p className="text-gray-600">Find and connect with interesting people in your community with similar goals and interests.</p>
            </div>

            {/* Feature 3 */}
            <div className="lumo-card p-8 text-center hover:-translate-y-2 transition-all duration-300">
              <div className="bg-[#b0a7ec]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#6a57d1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#6a57d1]">Track Progress</h3>
              <p className="text-gray-600">Monitor your networking growth and achieve meaningful milestones in your community journey.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
