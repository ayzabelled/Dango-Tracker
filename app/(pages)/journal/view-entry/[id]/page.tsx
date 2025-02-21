"use client";
import { useState, useEffect } from "react";
import { notFound } from 'next/navigation';
import LoadingSpinner from "@/components/loading-indicator";
import { Journal } from "@/components/columns";
import { format } from 'date-fns';
import { useSession } from "next-auth/react";
import { use } from 'react';

export default function ViewEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const [entry, setEntry] = useState<Journal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resolvedParams = use(params);

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
                    setEntry(data.data[0]); // Access the first element
                } else {
                    console.error("Entry not found in API response.");
                    setError("Entry not found.");
                }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Error fetching entry:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEntry();
    }, [status, session, resolvedParams?.id]); // Correct dependency

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!entry) {
        return <p>Entry not found.</p>;
    }

    const formattedDate = entry?.date ? format(new Date(entry.date), "MM-dd-yyyy") : "Invalid Date"; // Safe date access

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="font-bold text-3xl pt-2 pb-2">📖 View Journal Entry</h1>
            <div className="border-2 border-[#6486DB] p-4 rounded-md shadow-md bg-[#F4F4F4] text-[#212121] w-full">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-row gap-2">
                        <p className="font-bold">Date: </p>
                        <p> {formattedDate}</p>
                    </div>
                    <div className="col-span-2 flex flex-row gap-2">
                        <p className="font-bold">Title:</p>
                        <p>{entry?.title}</p> 
                    </div>
                    <div className="col-span-2 max-h-[40rem] overflow-auto">
                        <p className="font-bold">Description:</p>
                        <p>{entry?.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}