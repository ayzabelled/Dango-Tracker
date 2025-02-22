/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/new-entry.tsx
"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/loading-indicator";

const NewEntryPage: React.FC = () => {
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !session) {
      redirect("/login");
      return;
    }
  }, [status, session]);

  if (status === "unauthenticated" || !session) {
    return null;
  }

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!session?.user?.id) {
      setError("User is not authenticated.");
      return;
    }

    try {
      const requestBody = {
        userId: session.user.id,
        title: title,
        description,
        date: date,
      };

      console.log("Request Body:", requestBody);
      const response = await fetch("/api/journal", {
        // Correct API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create entry");
      }

      setDescription("");
      setDate("");
      setSuccessMessage("Entry created successfully!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating new entry:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {loading && <LoadingSpinner/>
      }
      <div className="flex flex-col items-center p-4">
        <h1 className="font-bold text-3xl pt-2 pb-2">✍️ Journal Entry ✍️</h1>
        <div className="border-2 border-[#6486DB] p-4 rounded-md shadow-md bg-[#F4F4F4] text-[#212121]"
        >
                 

          <form
            onSubmit={handleSubmitEntry}
            className="grid grid-cols-3 gap-4 bg-[#F4F4F4] text-[#212121]"
          >
            <div className="col-span-3 flex justify-center">
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>
            <div className="flex items-center">
              <label htmlFor="date">Date:</label>
            </div>
            <div className="col-span-2">
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border-[#6486DB] border-2 rounded-md bg-white text-center"
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="title">Title:</label>
            </div>
            <div className="col-span-2">
              <Input
                type="text"
                id="title"
                placeholder="Journal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="[&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-md text-center bg-white"
                required
              />
            </div>
            <div className="col-span-3">
              <label
                htmlFor="description"
                className="flex flex-start text-gray-500 text-xs italic pb-2"
              >
                Journal Entry
              </label>
              <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="w-full min-h-[10rem] max-h-[20rem] overflow-auto [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-md px-3 py-1 text-start text-sm"
              />
            </div>


            <div className="flex justify-center col-span-3">
              <Button type="submit" className="w-full bg-[#6486DB] text-white">
                Submit
              </Button>
            </div>
          </form>
      </div>
      </div>
    </>
  );
};

export default function NewEntryPageWrapper() {
  return (
    <SessionProvider>
      <NewEntryPage />
    </SessionProvider>
  );
}
