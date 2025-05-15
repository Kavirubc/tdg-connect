"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Add a type for User
interface DiscoverUser {
    _id: string;
    name: string;
    organization: string;
    interests: string[];
    facts: string[];
}

export default function DiscoverPage() {
    const [users, setUsers] = useState<DiscoverUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<DiscoverUser | null>(null);
    const [seeYouSoon, setSeeYouSoon] = useState<{ [userId: string]: boolean }>({});
    const router = useRouter();

    useEffect(() => {
        fetch("/api/discover")
            .then((res) => res.json())
            .then((data) => setUsers(data.users || []));
    }, []);

    const handleSeeYouSoon = async (userId: string) => {
        await fetch(`/api/connections/see-you-soon`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });
        setSeeYouSoon((prev) => ({ ...prev, [userId]: true }));
    };

    if (selectedUser) {
        return (
            <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
                <button className="mb-4 text-blue-500" onClick={() => setSelectedUser(null)}>
                    ← Back to Discover
                </button>
                <h2 className="text-2xl font-bold mb-2">{selectedUser.name}</h2>
                <p className="mb-1 font-medium">Organization: <span className="font-normal">{selectedUser.organization}</span></p>
                <div className="mb-2">
                    <span className="font-medium">Facts:</span>
                    <ul className="list-disc ml-6">
                        {selectedUser.facts?.map((fact, i) => (
                            <li key={i}>{fact}</li>
                        ))}
                    </ul>
                </div>
                <div className="mb-4">
                    <span className="font-medium">Interests:</span>
                    <ul className="list-disc ml-6">
                        {selectedUser.interests?.map((interest, i) => (
                            <li key={i}>{interest}</li>
                        ))}
                    </ul>
                </div>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => handleSeeYouSoon(selectedUser._id)}
                    disabled={seeYouSoon[selectedUser._id]}
                >
                    {seeYouSoon[selectedUser._id] ? "See you there!" : "See you there"}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-6">Discover People</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((user) => (
                    <div
                        key={user._id}
                        className="p-4 bg-white rounded shadow hover:shadow-lg cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                    >
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-gray-600">{user.organization}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
