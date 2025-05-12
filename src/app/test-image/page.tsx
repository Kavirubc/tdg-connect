'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TestImagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [imageTests, setImageTests] = useState<Array<{ path: string, exists: boolean | null }>>([
        { path: '/vercel.svg', exists: null },
        { path: '/invites/invite_1747031716229.png', exists: null },
        { path: '/invite_1747031716229.png', exists: null },
    ]);
    const [serverDebugInfo, setServerDebugInfo] = useState<any>(null);
    const [serverDebugLoading, setServerDebugLoading] = useState<boolean>(false);
    const [serverDebugError, setServerDebugError] = useState<string | null>(null);

    // Format image URL helper function
    const formatImageUrl = (url: string | undefined) => {
        if (!url) return '';
        return url.startsWith('/invites/') ? url : `/invites${url}`;
    };

    // Test if an image exists/is accessible
    useEffect(() => {
        const testImages = async () => {
            const results = await Promise.all(
                imageTests.map(async (test) => {
                    try {
                        const response = await fetch(test.path, { method: 'HEAD' });
                        return { ...test, exists: response.ok };
                    } catch (error) {
                        console.error(`Error testing ${test.path}:`, error);
                        return { ...test, exists: false };
                    }
                })
            );
            setImageTests(results);
        };

        testImages();
    }, []);

    // Get server-side file system debug info
    const getServerDebugInfo = async () => {
        try {
            setServerDebugLoading(true);
            setServerDebugError(null);

            const response = await fetch('/api/debug/file-system');
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setServerDebugInfo(data);
        } catch (error) {
            console.error("Error fetching server debug info:", error);
            setServerDebugError(error instanceof Error ? error.message : String(error));
        } finally {
            setServerDebugLoading(false);
        }
    };

    // Generate a new invitation image for testing
    const handleGenerateNewImage = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/regenerate-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();
            console.log('Generated image response:', data);

            // Ensure URL format is correct
            const correctedUrl = formatImageUrl(data.inviteImageUrl);
            setGeneratedImageUrl(correctedUrl);

            // Add the new URL to our tests
            setImageTests(prev => [
                ...prev,
                { path: data.inviteImageUrl, exists: null },
                { path: correctedUrl, exists: null }
            ]);

        } catch (err) {
            console.error('Error generating image:', err);
            alert('Error generating image: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Image Loading Test Page</h1>

            {/* Server File System Debug Section */}
            <div className="mb-8 border p-4 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">Server File System Debug</h2>
                <button
                    onClick={getServerDebugInfo}
                    disabled={serverDebugLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded mb-4 disabled:opacity-50"
                >
                    {serverDebugLoading ? 'Loading...' : 'Get Server Debug Info'}
                </button>

                {serverDebugError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p><strong>Error:</strong> {serverDebugError}</p>
                    </div>
                )}

                {serverDebugInfo && (
                    <div className="bg-white p-4 rounded border overflow-auto max-h-96">
                        <h3 className="font-semibold mb-2">File System Info:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 className="font-medium">Directories:</h4>
                                <p className="text-sm">Public: {serverDebugInfo.directories.publicExists ? '✅' : '❌'}</p>
                                <p className="text-sm">Invites: {serverDebugInfo.directories.invitesExists ? '✅' : '❌'}</p>
                                <p className="text-sm font-mono text-xs break-all">Path: {serverDebugInfo.directories.invitesPath}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Static Files:</h4>
                                <p className="text-sm">vercel.svg: {serverDebugInfo.staticFiles.vercelSvgExists ? '✅' : '❌'}</p>
                                <p className="text-sm">next.svg: {serverDebugInfo.staticFiles.nextSvgExists ? '✅' : '❌'}</p>
                            </div>
                        </div>

                        <h4 className="font-medium mt-4 mb-2">Invitation Files ({serverDebugInfo.inviteFiles.count}):</h4>
                        {serverDebugInfo.inviteFiles.count > 0 ? (
                            <>
                                <ul className="text-sm mb-4 max-h-40 overflow-y-auto">
                                    {serverDebugInfo.inviteFiles.files.map((file: string, i: number) => (
                                        <li key={i} className="font-mono text-xs mb-1">
                                            {file}
                                            <button
                                                className="ml-2 text-blue-500 underline"
                                                onClick={() => window.open(file, '_blank')}
                                            >
                                                Test
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {serverDebugInfo.inviteFiles.sampleFile && (
                                    <div className="text-sm bg-gray-100 p-3 rounded">
                                        <p><strong>Sample File:</strong> {serverDebugInfo.inviteFiles.sampleFile.name}</p>
                                        <p>Size: {serverDebugInfo.inviteFiles.sampleFile.size} bytes</p>
                                        <p>Created: {new Date(serverDebugInfo.inviteFiles.sampleFile.created).toLocaleString()}</p>
                                        <p>Read Access: {serverDebugInfo.inviteFiles.sampleFile.accessPermissions.read ? 'Yes' : 'No'}</p>
                                        <p>Write Access: {serverDebugInfo.inviteFiles.sampleFile.accessPermissions.write ? 'Yes' : 'No'}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-red-500 text-sm">No invitation files found!</p>
                        )}

                        <h4 className="font-medium mt-4 mb-2">Environment:</h4>
                        <div className="font-mono text-xs bg-gray-100 p-3 rounded">
                            <p>NODE_ENV: {serverDebugInfo.environment.nodeEnv}</p>
                            <p>CWD: {serverDebugInfo.environment.cwd}</p>
                            <p>Platform: {serverDebugInfo.environment.platform}</p>
                            <p>UID: {serverDebugInfo.environment.uid}</p>
                            <p>GID: {serverDebugInfo.environment.gid}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 border p-4 rounded">
                <h2 className="text-xl font-semibold mb-2">Image Path Tests</h2>
                <div className="space-y-2">
                    {imageTests.map((test, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <div className="w-6 h-6 mr-2">
                                {test.exists === null ? (
                                    <span className="text-yellow-500">⏳</span>
                                ) : test.exists ? (
                                    <span className="text-green-500">✓</span>
                                ) : (
                                    <span className="text-red-500">✗</span>
                                )}
                            </div>
                            <div className="flex-1 font-mono text-sm">{test.path}</div>
                            <div>
                                <button
                                    onClick={() => window.open(test.path, '_blank')}
                                    className="text-blue-500 underline text-sm"
                                >
                                    Try Direct Link
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Built-in Static Image Test</h2>
                    <p className="mb-4">This tests loading a built-in image from the public directory:</p>
                    <div className="border p-4 rounded-md">
                        <p className="text-sm text-gray-500 mb-2">Standard img tag:</p>
                        <img
                            src="/vercel.svg"
                            alt="Vercel Logo"
                            width={200}
                            height={100}
                            className="mb-4"
                        />
                        <p className="text-sm text-gray-500 mb-2">Next.js Image component:</p>
                        <Image
                            src="/vercel.svg"
                            alt="Vercel Logo"
                            width={200}
                            height={100}
                            className="mb-4"
                        />
                    </div>
                </div>

                <div className="border rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Invitation Image Test</h2>
                    <p className="mb-4">This tests loading an invitation image from the public/invites directory:</p>
                    <div className="border p-4 rounded-md">
                        <p className="text-sm text-gray-500 mb-2">URL being tested: /invites/invite_1747031716229.png</p>
                        <p className="text-sm text-gray-500 mb-2">Standard img tag:</p>
                        <img
                            src="/invites/invite_1747031716229.png"
                            alt="Invitation"
                            width={200}
                            height={200}
                            className="mb-4"
                            onError={(e) => {
                                console.error('Image failed to load');
                                e.currentTarget.style.border = '2px solid red';
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 border rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Generate New Test Image</h2>
                <button
                    onClick={handleGenerateNewImage}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate New Image'}
                </button>

                {generatedImageUrl && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Newly Generated Image:</h3>
                        <p className="text-sm text-gray-500 mb-2">URL: {generatedImageUrl}</p>
                        <div className="border p-4 rounded-md">
                            <img
                                src={generatedImageUrl}
                                alt="Newly generated invitation"
                                className="max-h-[300px]"
                                onError={(e) => {
                                    console.error('New image failed to load');
                                    e.currentTarget.style.border = '2px solid red';
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Link
                href="/profile"
                className="bg-blue-500 text-white py-2 px-4 rounded mt-8 inline-block"
            >
                Back to Profile
            </Link>
        </div>
    );
}
