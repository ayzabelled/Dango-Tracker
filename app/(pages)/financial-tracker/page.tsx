"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { trackerColumns } from "@/components/columns";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FinancialTracker } from "@/components/columns"; // Import your type
import LoadingSpinner from "@/components/loading-indicator";


const FinancialTrackerHistory: React.FC = () => {
  // Renamed for clarity
  const { data: session, status } = useSession();
  const [data, setData] = useState<FinancialTracker[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

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
          `/api/financial-tracker?userId=${session.user.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        setData(result.data as FinancialTracker[]);
        setTotalAmount(result.totalAmount);

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format received from the API.");
        }

        setData(result.data as FinancialTracker[]);
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
    return        <LoadingSpinner/>

  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {loading && <LoadingSpinner/>}

      <div className="p-4">
        <h1 className="text-2xl font-bold text-white pt-2 pb-4">
          📜 Financial History
        </h1>{" "}
        {/* Updated title */}
        <p>Total Amount</p>
        <div className="bg-[#f4f4f4] rounded-xl shadow-md flex justify-center text-[#212121] text-xl font-bold h-9">
          <p className="flex items-center">₱{totalAmount}</p>
        </div>
        <div className="pt-4">
          {data && <DataTable columns={trackerColumns} data={data} />}
        </div>
      </div>
    </>
  );
};

export default function FinancialTrackerHistoryWrapper() {
  // Updated wrapper name
  return (
    <SessionProvider>
      <FinancialTrackerHistory /> {/* Updated component name */}
    </SessionProvider>
  );
}
