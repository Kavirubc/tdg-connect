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

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Connections", href: "/connections" },
        { name: "Discover", href: "/discover" },
    ];

    // Add conditional links based on auth state
    const authLinks = session ? [
        ...navLinks,
        { name: "Profile", href: "/profile" },
    ] : navLinks;

    return (
        <nav className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
            <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
                {/* Logo Section */}
                <Link
                    href="/"
                    className="text-xl font-bold flex items-center group"
                    onClick={trackClick}
                >
                    <div className="relative mr-2.5">
                        <img
                            src="/rocket.svg"
                            alt="TDG Connect Logo"
                            className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 lumo-rocket"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700 hidden md:block"></div>
                    </div>
                    <span className="text-white font-extrabold tracking-tight">
                        TDG <span className="text-blue-200">Connect</span>
                    </span>
                </Link>

                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center space-x-10">
                    {authLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative group px-1 py-2 text-sm font-medium ${pathname === link.href
                                ? 'text-white'
                                : 'text-blue-100 hover:text-white'
                                }`}
                            onClick={trackClick}
                        >
                            {link.name}
                            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-300 rounded-full transform transition-all duration-300 ${pathname === link.href
                                ? 'scale-x-100 opacity-100'
                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-75'
                                }`}></span>
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* Login/Logout button always visible */}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden md:flex items-center text-sm font-medium">
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center overflow-hidden mr-2">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user?.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-xs font-bold">
                                            {session.user?.name?.charAt(0) || "U"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-blue-100">{session.user?.name || "User"}</span>
                            </span>
                            <button
                                onClick={e => { trackClick(e); handleSignOut(e); }}
                                className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700 focus:outline-none"
                                aria-label="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="bg-blue-50 hover:bg-white text-blue-700 font-medium px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700 focus:outline-none"
                            onClick={trackClick}
                        >
                            Login
                        </Link>
                    )}

                    {/* Hamburger button - visible on mobile only */}
                    <button
                        className="flex md:hidden items-center p-2 rounded-lg hover:bg-blue-800 transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <svg
                            className="w-6 h-6 text-white"
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

            {/* Mobile Navigation menu with improved animation and style */}
            <div
                className={`bg-gradient-to-b from-blue-800 to-blue-700 transition-all duration-300 ease-in-out overflow-hidden border-t border-blue-500 ${isMenuOpen ? "max-h-[500px]" : "max-h-0"
                    }`}
            >
                <div className="flex flex-col space-y-1 container mx-auto max-w-6xl px-4 py-3">
                    {authLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative rounded-xl p-3 transition-all duration-200 flex items-center ${pathname === link.href
                                ? 'bg-blue-900/50 font-medium text-white'
                                : 'text-blue-100 hover:bg-blue-900/30 hover:text-white'
                                }`}
                            onClick={(e) => { trackClick(e); setIsMenuOpen(false); }}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full mr-3 ${pathname === link.href ? 'bg-blue-300' : 'bg-blue-400/50'
                                }`}></div>
                            {link.name}
                        </Link>
                    ))}

                    {/* Mobile-only profile section */}
                    {session && (
                        <div className="mt-4 pt-3 border-t border-blue-600/50 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center overflow-hidden mr-3">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user?.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-xs font-bold">
                                            {session.user?.name?.charAt(0) || "U"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{session.user?.name || "User"}</span>
                                    <span className="text-xs text-blue-200 truncate max-w-[150px]">{session.user?.email || ""}</span>
                                </div>
                            </div>
                            <button
                                onClick={e => { trackClick(e); handleSignOut(e); }}
                                className="bg-blue-900 hover:bg-blue-950 px-3 py-2 rounded-lg text-xs font-medium"
                                aria-label="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
