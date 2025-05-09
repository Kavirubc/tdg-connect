// This is a server component that will fetch the session
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import ConnectionClient from './client';

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not Logged In</h1>
          <p>Please log in to use this feature.</p>
          <a href="/auth/login" className="text-blue-500 hover:underline">Log in</a>
        </div>
      </div>
    );
  }

  return <ConnectionClient userCode={session.user.code} userId={session.user.id} />;
}