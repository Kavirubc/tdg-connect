"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/connections');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="community-card w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#333333]">Welcome Back</h1>
          <p className="text-[#777777] mt-1">Sign in to connect with your community</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#f9e5e5] text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 p-3 bg-[#e6f2ea] text-blue-700 rounded-lg">
            Signing in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#555555] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#555555] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
              required
            />
          </div>

          <button
            type="submit"
            className="community-btn community-btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center mt-6 text-[#555555]">
            Don&apos;t have an account? <Link href="/auth/register" className="text-[#7bb5d3] hover:underline font-medium">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}