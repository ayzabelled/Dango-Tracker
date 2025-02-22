/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/loading-indicator";
import { Journal } from "@/components/columns";
import { useSession } from "next-auth/react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        const response = await fetch(
          `/api/journal/single-entry?id=${id}&userId=${userId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            errorData.error || `HTTP error! status: ${response.status}`;
          console.error("Failed to fetch entry:", errorMessage);
          setError(errorMessage);
          return;
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data && data.data && data.data.length > 0) {
          const fetchedEntry = data.data[0];
          if (fetchedEntry.date) {
            // Format the date to YYYY-MM-DD
            const date = new Date(fetchedEntry.date);
            const formattedDate = date.toISOString().split("T")[0];
            setEntry({ ...fetchedEntry, date: formattedDate });
          } else {
            setEntry(fetchedEntry);
          }
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
    setSuccessMessage(null);


    try {
      const response = await fetch(`/api/journal?id=${resolvedParams?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry), // Send the entry data directly
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;
        console.error("Failed to update entry:", errorMessage);
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("Update Response:", data);

      if (data.data) {
        setEntry(data.data); // Update the entry with the returned data
        setSuccessMessage("Entry updated successfully!");
        router.refresh(); //refresh the page
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (entry) {
      setEntry((prevEntry) => {
        if (prevEntry) {
          return {
            ...prevEntry,
            [name]: value,
          };
        }
        return prevEntry;
      });
    }
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
      <h1 className="font-bold text-3xl pt-2 pb-2">📝 Edit Journal Entry</h1>
      <div className="border-2 border-[#6486DB] p-4 rounded-md shadow-md bg-[#F4F4F4] text-[#212121]">
        <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 flex justify-center">
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>
          <div className="flex items-center">
            <label className="font-bold" htmlFor="date">
              Date:{" "}
            </label>
          </div>
          <div className="col-span-2">
            <Input
              type="date"
              id="date"
              name="date"
              value={entry?.date || ""} // Use entry directly
              onChange={handleInputChange}
              className="border-[#6486DB] border-2 rounded-md bg-white text-center"
            />
          </div>
          <div className="flex items-center">
            <label className="font-bold" htmlFor="title">
              Title:
            </label>
          </div>
          <div className="col-span-2">
            <Input
              type="text"
              id="title"
              name="title"
              value={entry?.title || ""} // Use entry directly
              onChange={handleInputChange}
              className="border-[#6486DB] border-2 rounded-md bg-white text-center"
            />
          </div>
          <div className="col-span-3">
            <label
              htmlFor="description"
              className="flex flex-start text-gray-500 text-xs italic pb-2"
            >
              Journal Entry
            </label>{" "}
            <textarea
              id="description"
              name="description"
              value={entry?.description || ""} // Use entry directly
              onChange={handleInputChange}
              className="w-full min-h-[10rem] max-h-[20rem] overflow-auto [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-md px-3 py-1 text-start text-sm"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full bg-[#6486DB] text-white">
          Update
        </Button>
      </div>
      <div className="pt-2">
      <Button
          className="bg-[#6486DB] text-white"
          onClick={() => router.back()}
        >
          ⬅️ BACK
        </Button>
        </div>
    </div>
  );
}
