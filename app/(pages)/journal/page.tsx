"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Journal, journalColumn } from "@/components/columns";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/loading-indicator";

const TodoList: React.FC = () => {
  // Renamed for clarity
  const { data: session, status } = useSession();
  const [data, setData] = useState<Journal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckboxChange = async (id: string) => {
    try {
      const response = await fetch(`/api/to-do-list`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, done: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to update received status");
      }
      // Refresh the page after successful update
      window.location.reload();
    } catch (error) {
      console.error("Error updating received status:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return ;

    if (status === "unauthenticated" || !session) {
      redirect("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          // Check if user id exists
          throw new Error("User ID is missing.");
        }

        const response = await fetch(
          `/api/journal?userId=${session.user.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("todolist: ", result);

        setData(result.data as Journal[]);

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format received from the API.");
        }

        setData(result.data as Journal[]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching data:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {loading && <LoadingSpinner />}

      <div className="p-4">
        <h1 className="text-2xl font-bold text-white pt-2 pb-4">
        ✍️ Journal
        </h1>{" "}
        {/* Updated title */}
        <div>
          {data && (
            <DataTable
              columns={journalColumn}
              data={data}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default function TodoListWrapper() {
  // Updated wrapper name
  return (
    <SessionProvider>
      <TodoList /> {/* Updated component name */}
    </SessionProvider>
  );
}
