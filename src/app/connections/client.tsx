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
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Connections</h1>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Your code section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Your Connection Code</h1>
          <div className="text-5xl font-mono font-bold text-blue-600 tracking-widest p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            {userCode}
          </div>
          <p className="mt-2 text-gray-600">Share this code with others to connect</p>
        </div>

        {/* Record connection section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Record a Connection</h2>

          {message.text && (
            <div
              className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="connectionCode" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full p-4 text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full p-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? 'Submitting...' : 'Connect'}
            </button>
          </form>
        </div>
      </div>

      {/* Connections List */}
      <div className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Your Connections</h2>

        {isLoading ? (
          <p className="text-center py-4">Loading your connections...</p>
        ) : connections.length === 0 ? (
          <p className="text-center py-4 text-gray-500">You have not connected with anyone yet.</p>
        ) : (
          <div className="divide-y">
            {connections.map((connection) => (
              <div key={connection._id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{connection.name}</h3>
                    <p className="text-gray-600 mt-1">
                      Interests: {connection.interests.length > 0
                        ? connection.interests.join(', ')
                        : 'None specified'}
                    </p>

                    {sharedEmails[connection._id] && (
                      <p className="text-gray-600 mt-1">
                        Email: <a href={`mailto:${connection.email}`} className="text-blue-500 hover:underline">
                          {connection.email}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    {!sharedEmails[connection._id] && (
                      <button
                        onClick={() => shareEmail(connection._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Share Contact
                      </button>
                    )}

                    <button
                      onClick={() => disconnectUser(connection._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>

                    <button
                      onClick={() => generateConversationStarter(connection._id)}
                      disabled={generatingFor === connection._id}
                      className={`px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${generatingFor === connection._id ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                    >
                      {generatingFor === connection._id ? 'Generating...' :
                        conversationStarters[connection._id] ? 'Regenerate' : 'Get Conversation Starter'}
                    </button>
                  </div>
                </div>

                {/* Conversation Starter Display */}
                {conversationStarters[connection._id] && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm uppercase font-semibold text-blue-700 mb-2">Conversation Starter</h4>
                    <p className="text-gray-800">{conversationStarters[connection._id]}</p>
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