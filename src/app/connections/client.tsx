"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Connection {
  _id: string;
  name: string;
  code: string;
  email: string;
  interests: string[];
  isDisconnected?: boolean;
}

interface MessageState {
  text: string;
  type: 'success' | 'error' | null;
}

interface ConnectionClientProps {
  userCode: string;
  userId: string;
}

export default function ConnectionClient({ userCode }: ConnectionClientProps) {
  const [connectionCode, setConnectionCode] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationStarters, setConversationStarters] = useState<Record<string, string>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [sharedEmails, setSharedEmails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/user/connections');
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      const data = await response.json();
      // Only show active connections in the connections page
      setConnections(data.connections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setMessage({ text: 'Failed to load connections', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: null });

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode,
          connectionCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record connection');
      }

      setMessage({ text: 'Connection recorded successfully!', type: 'success' });
      setConnectionCode('');
      fetchConnections(); // Refresh the connections list
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disconnectUser = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect user');
      }

      // Update local state to show disconnected status
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));

      // Clear any conversation starters and shared emails for this connection
      const updatedStarters = { ...conversationStarters };
      delete updatedStarters[connectionId];
      setConversationStarters(updatedStarters);

      const updatedSharedEmails = { ...sharedEmails };
      delete updatedSharedEmails[connectionId];
      setSharedEmails(updatedSharedEmails);

      setMessage({ text: 'Connection disconnected successfully', type: 'success' });
    } catch (error) {
      console.error('Error disconnecting user:', error);
      setMessage({ text: 'Failed to disconnect user', type: 'error' });
    }
  };

  const generateConversationStarter = async (connectionId: string) => {
    setGeneratingFor(connectionId);
    try {
      const response = await fetch('/api/conversation-starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate conversation starter');
      }

      const data = await response.json();
      setConversationStarters(prev => ({
        ...prev,
        [connectionId]: data.conversationStarter
      }));
    } catch (error) {
      console.error('Error generating conversation starter:', error);
      setMessage({ text: 'Failed to generate conversation starter', type: 'error' });
    } finally {
      setGeneratingFor(null);
    }
  };

  const shareEmail = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections/share-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to share email');
      }

      setSharedEmails(prev => ({
        ...prev,
        [connectionId]: true
      }));
      setMessage({ text: 'Email shared successfully', type: 'success' });
    } catch (error) {
      console.error('Error sharing email:', error);
      setMessage({ text: 'Failed to share email', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#333333] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Your Connections
        </h1>
        <Link
          href="/dashboard"
          className="community-btn community-btn-primary whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Go to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your code section */}
        <div className="community-card p-6">
          <h2 className="text-xl font-bold mb-4 text-[#333333] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#7bb5d3]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 116 0v2h2V7a5 5 0 00-5-5z" />
            </svg>
            Your Connection Code
          </h2>
          <div className="text-4xl md:text-5xl font-mono font-bold text-[#7bb5d3] tracking-widest p-4 border-2 border-[#c2e0f0] rounded-lg bg-[#f8f7f4] text-center">
            {userCode}
          </div>
          <p className="mt-3 text-[#777777] text-center">Share this code with others to connect</p>
        </div>

        {/* Record connection section */}
        <div className="community-card p-6">
          <h2 className="text-xl font-bold mb-4 text-[#333333] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#d1b89c]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Record a Connection
          </h2>

          {message.text && (
            <div
              className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-[#e6f2ea] text-green-700' : 'bg-[#f9e5e5] text-red-700'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="connectionCode" className="block text-sm font-medium text-[#555555] mb-1">
                Enter 4-digit code
              </label>
              <input
                id="connectionCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="Enter code"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value)}
                className="w-full p-4 text-xl border border-[#e6d7c4] rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`community-btn community-btn-primary w-full text-lg ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
      </div>

      {/* Connections List */}
      <div className="community-card p-6">
        <h2 className="text-xl font-bold mb-6 text-[#333333] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#7bb5d3]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Your Active Connections
        </h2>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7bb5d3]"></div>
            <p className="mt-4 text-[#777777]">Loading your connections...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-[#555555] mb-1">You have no active connections.</p>
            <p className="text-[#777777] text-sm mb-6">Share your code or enter someone else's code to connect.</p>
            <Link href="/dashboard" className="community-btn text-sm py-1.5 px-3 rounded-full bg-[#c2e0f0] text-[#5a95b5] hover:bg-[#7bb5d3] hover:text-white">
              View All Connections on Dashboard
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {connections.map((connection) => (
              <div key={connection._id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#333333]">{connection.name}</h3>
                    <p className="text-[#777777] text-sm mt-1">
                      Interests: {connection.interests.length > 0
                        ? connection.interests.join(', ')
                        : 'None specified'}
                    </p>

                    {sharedEmails[connection._id] && (
                      <p className="text-[#777777] text-sm mt-1">
                        Email: <a href={`mailto:${connection.email}`} className="text-[#7bb5d3] hover:underline">
                          {connection.email}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!sharedEmails[connection._id] && (
                      <button
                        onClick={() => shareEmail(connection._id)}
                        className="community-btn text-sm py-1.5 px-3 bg-[#c2e0f0] text-[#5a95b5] hover:bg-[#7bb5d3] hover:text-white rounded-full"
                      >
                        Share Contact
                      </button>
                    )}

                    <button
                      onClick={() => disconnectUser(connection._id)}
                      className="community-btn text-sm py-1.5 px-3 bg-[#f9e5e5] text-[#d05353] hover:bg-[#e66767] hover:text-white rounded-full"
                    >
                      Disconnect
                    </button>

                    <button
                      onClick={() => generateConversationStarter(connection._id)}
                      disabled={generatingFor === connection._id}
                      className={`community-btn text-sm py-1.5 px-3 rounded-full transition-colors 
                        ${generatingFor === connection._id
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-[#e6d7c4] text-[#b29777] hover:bg-[#d1b89c] hover:text-white'
                        }`}
                    >
                      {generatingFor === connection._id ? 'Generating...' :
                        conversationStarters[connection._id] ? 'Regenerate' : 'Get Conversation Starter'}
                    </button>
                  </div>
                </div>

                {/* Conversation Starter Display */}
                {conversationStarters[connection._id] && (
                  <div className="mt-4 p-4 bg-[#f8f7f4] border border-[#e6d7c4] rounded-lg">
                    <h4 className="text-sm uppercase font-semibold text-[#b29777] mb-2">Conversation Starter</h4>
                    <p className="text-[#555555]">{conversationStarters[connection._id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}