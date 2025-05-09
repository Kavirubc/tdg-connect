import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-md w-full flex flex-col items-center text-center">
        <div className="mb-8">
          <Image
            src="/globe.svg"
            alt="TDG Connect Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-[#2f6c8e]">Welcome to TDG Connect</h1>
        <p className="mb-8 text-gray-600 text-lg">Connect with others and start meaningful conversations</p>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/auth/login"
            className="bg-[#7bb5d3] text-white py-3 px-6 rounded-md hover:bg-[#5a9cbf] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Log In
          </Link>

          <Link
            href="/auth/register"
            className="bg-[#e6d7c4] text-[#333333] py-3 px-6 rounded-md hover:bg-[#d1b89c] transition-all transform hover:scale-105 shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
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
