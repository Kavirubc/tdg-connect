import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-md w-full flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to TDG Connect</h1>
        <p className="mb-8">Connect with others and start meaningful conversations</p>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Log In
          </Link>

          <Link
            href="/auth/register"
            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      <footer className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} TDG Connect • All rights reserved
      </footer>
    </div>
  );
}
