"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<"request" | "reset" | "success">("request");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Password strength validation
    const isPasswordStrong = (password: string) => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        );
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // This endpoint should check if user exists and return success (no email sent, just for UX)
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Something went wrong");
            }
            setStep("reset");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!isPasswordStrong(newPassword)) {
            setError(
                "Password must be at least 8 characters, include a digit, a symbol, and an uppercase letter."
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Reset failed");
            }
            setStep("success");
            setTimeout(() => router.push("/auth/login"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="community-card w-full max-w-md p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
                {error && (
                    <div className="mb-4 p-3 bg-[#f9e5e5] text-red-700 rounded-lg">{error}</div>
                )}
                {step === "request" && (
                    <form onSubmit={handleRequest} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Enter your email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 border border-[#e6d7c4] rounded-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="community-btn community-btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Checking..." : "Continue"}
                        </button>
                    </form>
                )}
                {step === "reset" && (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium mb-1">
                                Enter your 4-digit registration code
                            </label>
                            <input
                                id="code"
                                type="text"
                                name="code"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className="w-full p-3 border border-[#e6d7c4] rounded-lg"
                                required
                                pattern="\d{4}"
                                maxLength={4}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-[#e6d7c4] rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-[#e6d7c4] rounded-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="community-btn community-btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
                {step === "success" && (
                    <div className="mb-4 p-3 bg-[#e6f7e6] text-green-700 rounded-lg text-center">
                        Password reset successful!<br />Redirecting to login...
                    </div>
                )}
            </div>
        </div>
    );
}
