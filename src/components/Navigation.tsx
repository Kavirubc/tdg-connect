"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import useTrackClick from '@/lib/useTrackClick';
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProps {
    session: Session | null;
}

export default function Navigation({ session: serverSession }: NavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Use client-side session to ensure it's always up-to-date
    const { data: clientSession } = useSession();

    // Use the client session if available, otherwise fall back to server session
    const session = clientSession || serverSession;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        await signOut({ redirect: false });
        router.push('/');
    };

    const trackClick = useTrackClick();

    // Remove Profile from nav links
    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Connections", href: "/connections" },
        { name: "Discover", href: "/discover" },
    ];
    const authLinks = navLinks;

    return (
        <nav className="w-full bg-[var(--color-background)] text-[var(--color-foreground)] border-b border-[var(--primary-light)]">
            <div className="container mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
                {/* Logo Section */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group"
                    onClick={trackClick}
                >
                    <img
                        src="/rocket.svg"
                        alt="TDG Connect Logo"
                        className="h-7 w-7 lumo-rocket"
                    />
                    <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
                        TDG <span style={{ color: 'var(--accent)' }}>Connect</span>
                    </span>
                </Link>

                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center space-x-7">
                    {authLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-1 py-2 text-sm font-medium transition-colors duration-150 ${pathname === link.href
                                ? 'text-[var(--primary-dark)] border-b-2 border-[var(--primary-dark)]'
                                : 'text-[var(--primary-light)] hover:text-[var(--primary-dark)] hover:border-b-2 hover:border-[var(--primary-dark)] border-b-2 border-transparent'
                                }`}
                            onClick={trackClick}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* User icon with dropdown for profile/logout if logged in */}
                    {session ? (
                        <div className="relative flex items-center gap-2">
                            <span className="hidden md:flex items-center text-sm font-medium cursor-pointer group" tabIndex={0}>
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user?.name || 'User'}
                                        className="w-8 h-8 rounded-full object-cover mr-2 border border-[var(--primary-light)]"
                                    />
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-white text-xs font-bold mr-2">
                                        {session.user?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                                {/* Dropdown on hover/focus */}
                                <div className="absolute right-0 top-10 z-20 hidden group-focus-within:flex group-hover:flex flex-col min-w-[160px] bg-[var(--card-bg)] border border-[var(--primary-light)] rounded shadow-md animate-fadeIn">
                                    <Link href="/profile" className="px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary-light)]/10 transition-colors">Profile</Link>
                                    <button
                                        onClick={e => { trackClick(e); handleSignOut(e); }}
                                        className="px-4 py-2 text-sm text-left text-[var(--primary)] hover:bg-[var(--primary-light)]/10 transition-colors"
                                        aria-label="Logout"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </span>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="lumo-btn lumo-btn-primary text-sm px-5 py-2"
                            onClick={trackClick}
                        >
                            Login
                        </Link>
                    )}

                    {/* Hamburger button - visible on mobile only */}
                    <button
                        className="flex md:hidden items-center p-2 rounded focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <svg
                            className="w-6 h-6 text-[var(--primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation menu */}
            <div
                className={`bg-[var(--color-background)] transition-all duration-200 overflow-hidden border-t border-[var(--primary-light)] ${isMenuOpen ? 'max-h-[400px]' : 'max-h-0'}`}
            >
                <div className="flex flex-col space-y-1 container mx-auto max-w-6xl px-4 py-3">
                    {authLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`rounded p-3 transition-colors duration-150 flex items-center text-base font-medium ${pathname === link.href
                                ? 'text-[var(--primary-dark)]'
                                : 'text-[var(--primary-light)] hover:text-[var(--primary-dark)]'
                                }`}
                            onClick={(e) => { trackClick(e); setIsMenuOpen(false); }}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Mobile-only user icon with dropdown */}
                    {session && (
                        <div className="mt-4 pt-3 border-t border-[var(--primary-light)] flex items-center">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user?.name || 'User'}
                                    className="w-9 h-9 rounded-full object-cover mr-3 border border-[var(--primary-light)]"
                                />
                            ) : (
                                <span className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-white text-xs font-bold mr-3">
                                    {session.user?.name?.charAt(0) || 'U'}
                                </span>
                            )}
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-medium truncate" style={{ color: 'var(--primary)' }}>{session.user?.name || 'User'}</span>
                                <span className="text-xs text-[var(--accent-light)] truncate max-w-[150px]">{session.user?.email || ''}</span>
                            </div>
                            <button
                                onClick={e => { trackClick(e); handleSignOut(e); }}
                                className="lumo-btn lumo-btn-primary text-xs px-3 py-2 ml-2"
                                aria-label="Logout"
                            >
                                Logout
                            </button>
                            <Link
                                href="/profile"
                                className="lumo-btn lumo-btn-primary text-xs px-3 py-2 ml-2"
                                onClick={trackClick}
                            >
                                Profile
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
