"use client";

import { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";

interface NavigationProps {
    session: Session | null;
}

export default function Navigation({ session }: NavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Connections", href: "/connections" },
    ];

    return (
        <nav className="w-full">
            <div className="container mx-auto max-w-6xl flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    TDG Connect
                </h1>

                <div className="flex items-center gap-4">
                    {/* Login/Logout button always visible */}
                    {session ? (
                        <div className="flex items-center">
                            <span className="hidden md:inline mr-3">
                                Welcome, {session.user?.name || "User"}
                            </span>
                            <Link
                                href="/api/auth/signout"
                                className="community-btn bg-[#d1b89c] hover:bg-[#b29777] text-white px-3 py-1.5 rounded-full text-sm transition-colors"
                            >
                                Logout
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="community-btn community-btn-secondary"
                        >
                            Login
                        </Link>
                    )}

                    {/* Hamburger button - visible on all screen sizes */}
                    <button
                        className="flex items-center p-2"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
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

            {/* Navigation menu - slides down when menu is open (on all screen sizes) */}
            <div
                className={`bg-[#7bb5d3] w-full transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-96" : "max-h-0"
                    }`}
            >
                <div className="flex flex-col p-4 space-y-3 container mx-auto max-w-6xl">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-white hover:text-gray-200 transition-colors text-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {/* Mobile-only welcome message */}
                    {session && (
                        <div className="md:hidden flex pt-3 border-t border-white/20">
                            <span>Welcome, {session.user?.name || "User"}</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}