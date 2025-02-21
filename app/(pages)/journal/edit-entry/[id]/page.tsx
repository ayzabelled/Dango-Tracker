/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { notFound, useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/loading-indicator";
import { Journal } from "@/components/columns";
import { useSession } from "next-auth/react";
import { use } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const [entry, setEntry] = useState<Journal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resolvedParams = use(params);
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated" || !session) {
            return;
        }

        const id = resolvedParams?.id;

        if (!id) {
            console.error("ID is missing.");
            notFound();
            return;
        }

        const fetchEntry = async () => {
            if (!session?.user?.id) {
                console.error("User ID is missing.");
                setError("User ID is missing.");
                setLoading(false);
                return;
            }

            const userId = session.user.id;

            setLoading(true);

            try {
                const response = await fetch(`/api/journal?id=${id}&userId=${userId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                    console.error("Failed to fetch entry:", errorMessage);
                    setError(errorMessage);
                    return;
                }

                const data = await response.json();
                console.log("API Response:", data);

                if (data && data.data && data.data.length > 0) {
                    setEntry(data.data[0]);
                } else {
                    console.error("Entry not found in API response.");
                    setError("Entry not found.");
                }

            } catch (err: any) {
                console.error("Error fetching entry:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEntry();
    }, [status, session, resolvedParams?.id]);

    const handleSave = async () => {
        if (!entry) return; // Make sure entry is loaded

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/journal?id=${resolvedParams?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry), // Send the entry data directly
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                console.error("Failed to update entry:", errorMessage);
                setError(errorMessage);
                return;
            }

            const data = await response.json();
            console.log("Update Response:", data);

            if (data.data) {
                setEntry(data.data); // Update the entry with the returned data
                 router.refresh();//refresh the page
            } else {
                console.error("No data received after update.");
                setError("Failed to update entry.");
            }

        } catch (err: any) {
            console.error("Error updating entry:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEntry((prevEntry) => ({
            ...prevEntry,
            [name]: value,
        }));
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!entry) {
        return <p>Entry not found.</p>;
    }

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="font-bold text-3xl pt-2 pb-2">Edit Journal Entry</h1>
            <div className="border-2 border-[#6486DB] p-4 rounded-md shadow-md bg-[#F4F4F4] text-[#212121]">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-row">
                        <label className="font-bold" htmlFor="date">Date: </label>
                        <Input
                            type="date"
                            id="date"
                            name="date"
                            value={entry?.date || ''} // Use entry directly
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="font-bold" htmlFor="title">Title:</label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={entry?.title || ''} // Use entry directly
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="font-bold" htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={entry?.description || ''} // Use entry directly
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                </div>
                <Button onClick={handleSave} className="w-full bg-[#6486DB] text-white">
                    Save
                </Button>
            </div>
        </div>
    );
}