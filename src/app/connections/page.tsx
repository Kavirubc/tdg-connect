// This is a server component that will fetch the session
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import ConnectionClient from './client';
import Link from 'next/link';

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="community-card w-full max-w-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#333333] mb-2">Not Logged In</h1>
          <p className="text-[#777777] mb-4">Please log in to use this feature.</p>
          <Link href="/auth/login" className="community-btn community-btn-primary inline-block">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return <ConnectionClient userCode={session.user.code} userId={session.user.id} />;
}