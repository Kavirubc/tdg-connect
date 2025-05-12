"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        nic: '',
        organization: '',
        interests: '',
        facts: '',
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    interests: formData.interests.split(','),
                    facts: formData.facts.split(','),
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
            router.push('/auth/login');
        } catch (err: unknown) {
            setError((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold">Register</h1>
                {error && <p className="text-red-500">{error}</p>}
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="nic" placeholder="National Identity Card (NIC)" value={formData.nic} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input type="text" name="organization" placeholder="Organization" value={formData.organization} onChange={handleChange} className="w-full p-2 border rounded" required />
                <textarea name="interests" placeholder="Interests (comma-separated)" value={formData.interests} onChange={handleChange} className="w-full p-2 border rounded" />
                <textarea name="facts" placeholder="Facts about yourself (comma-separated)" value={formData.facts} onChange={handleChange} className="w-full p-2 border rounded" />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Register
                </button>
            </form>
        </div>
    );
}