"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { FinancialTracker, trackerColumns } from "@/components/columns"; // Import your type
import { DahboardTable } from "@/components/dashboard-tables";

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [data, setData] = useState<FinancialTracker[] | null>(null);

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
    return <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
    <svg
      className="animate-spin size-10 text-[#6486DB]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"
      />
    </svg>
  </div>;
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // User is authenticated, but no data is being fetched, so an empty dashboard
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <svg
            className="animate-spin size-10 text-[#6486DB]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"
            />
          </svg>
        </div>
      )}
      <div className="p-2 pl-8">
        <span className="text-xl">Welcome back, </span>
        <span className="text-xl font-bold"> 🍡 {session?.user?.name} 🍡</span>

        <div>
          <h1 className="text-2xl font-bold text-white pt-2 pb-2">
            Financial Tracker
          </h1>{" "}
          {/* Updated title */}
          <div className="bg-[#f4f4f4] rounded-xl shadow-md flex justify-center text-[#212121] text-xl font-bold h-9">
            <p className="flex items-center">₱{totalAmount}</p>
          </div>
          <p className="flex justify-center pt-1 italic text-xs">Balance</p>
          <h1 className="text-xl font-bold text-white pt-2 pb-4">
            Recent Transactions
          </h1>{" "}
          <div>
            {data && <DahboardTable columns={trackerColumns} data={data} />}
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default function DashboardWrapper() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}
