"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '', // Add phone field
    nic: '', // Added NIC field
    organization: '', // Added Organization field
    interests: '',
    facts: '',
  });
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, interests: value }));

    // Split by spaces to create tags
    if (value.trim()) {
      const tags = value.split(' ').filter(tag => tag.trim() !== '');
      setInterestTags(tags);
    } else {
      setInterestTags([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interests: interestTags.length > 0 ? interestTags : formData.interests.split(' '),
          facts: formData.facts.split(','),
          nic: formData.nic,
          organization: formData.organization,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      // Show success message with information about invitation
      setSuccess(true);
      setLoading(false);

      // Add a notification about the invitation
      if (data.inviteImageUrl) {
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        successMessage.innerHTML = 'Registration successful! <br> Your Daily Grind invitation image has been created and will be available in your profile.';
        document.body.appendChild(successMessage);

        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
      }

      // Redirect to login page after a brief delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="community-card w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#333333]">Join Our Community</h1>
          <p className="text-[#777777] mt-1">Create an account to connect with others</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#f9e5e5] text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#e6f7e6] text-green-700 rounded-lg">
            <p className="font-medium">Registration successful!</p>
            <p>Your Daily Grind invitation has been created.</p>
            <p>Redirecting to login page...</p>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-[#e6f2ea] text-blue-700 rounded-lg">
            Registering...
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#e6f2ea] text-green-700 rounded-lg">
            Registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#555555] mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
          </div>

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
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#555555] mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
          </div>

          <div>
            <label htmlFor="nic" className="block text-sm font-medium text-[#555555] mb-1">
              NIC (National Identity Card)
            </label>
            <input
              id="nic"
              type="text"
              name="nic"
              placeholder="Enter your NIC number"
              value={formData.nic}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-[#555555] mb-1">
              Organization
            </label>
            <input
              id="organization"
              type="text"
              name="organization"
              placeholder="Enter your organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
          </div>

          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-[#555555] mb-1">
              Your Interests
            </label>
            <input
              id="interests"
              type="text"
              name="interests"
              placeholder="Add interests separated by spaces"
              value={formData.interests}
              onChange={handleInterestsChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              required
            />
            <p className="mt-1 text-xs text-[#777777]">Type each interest and press space to separate them</p>

            {interestTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {interestTags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-[#e6f2ff] text-[#4a86e8] rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="facts" className="block text-sm font-medium text-[#555555] mb-1">
              Fun Facts About You
            </label>
            <textarea
              id="facts"
              name="facts"
              placeholder="I love coffee, I've visited 10 countries, etc."
              value={formData.facts}
              onChange={handleChange}
              className="w-full p-3 border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] text-[#333333] placeholder:text-[#aaaaaa]"
              rows={2}
              required
            />
            <p className="mt-1 text-xs text-[#777777]">Separate with commas</p>
          </div>

          <button
            type="submit"
            className="community-btn community-btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>

          <div className="text-center mt-6 text-[#555555]">
            Already have an account? <Link href="/auth/login" className="text-[#7bb5d3] hover:underline font-medium">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}