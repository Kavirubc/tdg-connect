"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { trackConnectionCreated } from '@/lib/posthog';
import useTrackClick from '@/lib/useTrackClick';
import Image from 'next/image';

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
  const [conversationStarters, setConversationStarters] = useState<Record<string, string[]>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [sharedEmails, setSharedEmails] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const trackClick = useTrackClick();

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
      Swal.fire({
        title: 'Error',
        text: 'Failed to load connections',
        icon: 'error',
        confirmButtonColor: '#7bb5d3'
      });
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

      Swal.fire({
        title: 'Success!',
        text: 'Connection recorded successfully!',
        icon: 'success',
        confirmButtonColor: '#7bb5d3'
      });

      // Track the connection event in PostHog
      trackConnectionCreated(userCode, data.connection._id);

      setConnectionCode('');
      fetchConnections(); // Refresh the connections list
    } catch (err: unknown) {
      Swal.fire({
        title: 'Error',
        text: err instanceof Error ? err.message : 'An error occurred',
        icon: 'error',
        confirmButtonColor: '#7bb5d3'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disconnectUser = async (connectionId: string) => {
    // Confirm before disconnecting
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will disconnect this user from your network. You can always connect again later.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7bb5d3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, disconnect'
    });

    if (!result.isConfirmed) return;

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

      Swal.fire({
        title: 'Disconnected',
        text: 'Connection disconnected successfully',
        icon: 'success',
        confirmButtonColor: '#7bb5d3'
      });
    } catch (error) {
      console.error('Error disconnecting user:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to disconnect user',
        icon: 'error',
        confirmButtonColor: '#7bb5d3'
      });
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
        throw new Error('Failed to generate conversation starters');
      }

      const data = await response.json();
      setConversationStarters(prev => ({
        ...prev,
        [connectionId]: data.starters || [],
      }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Conversation starters generated!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate conversation starters',
        icon: 'error',
        confirmButtonColor: '#7bb5d3'
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Code copied to clipboard!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const shareViaEmail = async (connectionId: string, connectionName: string) => {
    try {
      const response = await fetch(`/api/connections/share-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setSharedEmails(prev => ({
        ...prev,
        [connectionId]: true
      }));

      Swal.fire({
        title: 'Email Sent!',
        text: `Your contact information has been shared with ${connectionName}.`,
        icon: 'success',
        confirmButtonColor: '#2f78c2'
      });
    } catch (error) {
      console.error('Error sharing via email:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to share via email',
        icon: 'error',
        confirmButtonColor: '#2f78c2'
      });
    }
  };

  return (
    <div className="space-y-8 lumo-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2f78c2] to-[#31b3e3] text-white">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/grid-bg.svg"
            alt="Grid background"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Connections</h1>
              <p className="text-white/80 max-w-lg">Manage your network and build meaningful relationships.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/discover"
                className="lumo-btn bg-white text-[#2f78c2] py-3 px-6 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-md flex items-center justify-center whitespace-nowrap font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                </svg>
                Discover People
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Your code section */}
        <div className="lumo-card p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-[#81b6f1]/20 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 116 0v2h2V7a5 5 0 00-5-5z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Code</div>
              <div className="text-2xl font-mono font-bold text-[#333333]">{userCode}</div>
              <div className="text-xs text-gray-500 mt-1">share to connect</div>
            </div>
          </div>
          <button
            className="mt-2 w-full py-2 border border-[#2f78c2] text-[#2f78c2] rounded-md text-sm hover:bg-[#81b6f1]/20 transition-colors"
            onClick={copyCode}
            aria-label="Copy Code"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Record connection section */}
        <div className="lumo-card p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-[#a9e2f5]/20 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#31b3e3]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7a5 5 0 00-5-5z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">New Connection</div>
              <div className="text-2xl font-bold text-[#333333]">Add Connection</div>
            </div>
          </div>

          {message.text && (
            <div
              className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-[#e6f2ea] text-green-700' : 'bg-[#f9e5e5] text-red-700'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); trackClick(); handleSubmit(e); }} className="space-y-4">
            <div>
              <input
                id="connectionCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="Enter 4-digit code"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value)}
                className="w-full p-4 text-xl border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f78c2] focus:border-[#2f78c2]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`lumo-btn lumo-btn-primary w-full py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-md font-medium ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              aria-label="Connect"
            >
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
      </div>

      {/* Connections List */}
      <div className="lumo-card p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2f78c2] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#2f78c2]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Your Connections
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f78c2]"></div>
            <p className="mt-4 text-[#777777]">Loading your connections...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#81b6f1]/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-[#555555] mb-4">You haven&apos;t connected with anyone yet.</p>
            <p className="text-[#777777] mb-6">Share your code with others to start building your network!</p>
            <Link
              href="/discover"
              className="lumo-btn lumo-btn-accent py-3 px-6 rounded-full shadow-md inline-flex items-center justify-center"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <div
                key={connection._id}
                className="p-5 border border-gray-100 rounded-lg hover:shadow-md transition-all hover:translate-y-[-4px]"
              >
                <div className="flex justify-between">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-[#81b6f1]/20 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#333333]">{connection.name}</h3>
                      <p className="text-[#777777] text-sm">
                        Code: {connection.code}
                        {sharedEmails[connection._id] ? (
                          <span className="ml-2">| Email: {connection.email}</span>
                        ) : (
                          <button className="ml-2 text-xs text-[#2f78c2] underline" onClick={() => shareViaEmail(connection._id, connection.name)} disabled={sharedEmails[connection._id]}>
                            {sharedEmails[connection._id] ? 'Shared' : 'Share Email'}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="dropdown relative">
                    <button
                      onClick={e => { e.stopPropagation(); trackClick(e); }}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                      aria-label="Connection options"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {connection.interests?.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connection.interests.slice(0, 3).map((interest: string, i: number) => (
                        <span
                          key={i}
                          className="lumo-tag"
                        >
                          {interest}
                        </span>
                      ))}
                      {connection.interests.length > 3 && (
                        <span className="text-xs text-gray-500">+{connection.interests.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className="py-2 px-4 border border-[#2f78c2] text-[#2f78c2] rounded-md text-sm hover:bg-[#81b6f1]/20 transition-colors flex items-center justify-center"
                    onClick={() => shareViaEmail(connection._id, connection.name)}
                    disabled={sharedEmails[connection._id]}
                    aria-label="Share My Email"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {sharedEmails[connection._id] ? 'Shared' : 'Share Email'}
                  </button>
                  <button
                    className="py-2 px-4 border border-[#31b3e3] text-[#31b3e3] rounded-md text-sm hover:bg-[#a9e2f5]/20 transition-colors flex items-center justify-center"
                    onClick={() => generateConversationStarter(connection._id)}
                    disabled={generatingFor === connection._id}
                    aria-label="Generate Conversation Starter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {generatingFor === connection._id ? 'Generating...' : 'Chat Starters'}
                  </button>
                </div>

                {conversationStarters[connection._id] && conversationStarters[connection._id].length > 0 && (
                  <div className="mt-3 p-3 bg-[#81b6f1]/20 rounded-md">
                    <ul className="list-decimal list-inside space-y-1">
                      {conversationStarters[connection._id].map((starter, idx) => (
                        <li key={idx} className="text-sm text-[#333333]">{starter}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 text-right">
                  <button
                    onClick={() => disconnectUser(connection._id)}
                    className="text-red-500 text-xs hover:underline"
                    aria-label="Disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="lumo-card p-6 bg-[#f0f5fb] border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-[#2f78c2]">Tips for Building Connections</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#31b3e3] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Share your code with people you meet to quickly establish connections.
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#31b3e3] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Use conversation starters to break the ice when meeting new connections.
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#31b3e3] mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Build your network to increase your community rank and status.
          </li>
        </ul>
      </div>
    </div>
  );
}