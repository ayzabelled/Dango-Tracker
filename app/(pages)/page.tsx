"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import {
  FinancialTracker,
  Journal,
  journalColumn,
  todolistColumn,
  TodoListRequest,
  trackerColumns,
} from "@/components/columns"; // Import your type
import { DahboardTable } from "@/components/dashboard-tables";
import LoadingSpinner from "@/components/loading-indicator";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [data, setData] = useState<FinancialTracker[] | null>(null);
  const [todoData, setTodoData] = useState<TodoListRequest[] | null>(null);
  const [journalData, setJournalData] = useState<Journal[] | null>(null);
  const [isHidden, setIsHidden] = useState(true);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
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

        const todoResponse = await fetch(
          `/api/to-do-list?userId=${session.user.id}`
        );

        if (!todoResponse.ok) {
          const errorData = await todoResponse.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${todoResponse.status}`
          );
        }

        const todoResult = await todoResponse.json();
        console.log("todolist: ", todoResult);

        setTodoData(todoResult.data as TodoListRequest[]);

        const journalResult = await fetch(
          `/api/journal?userId=${session.user.id}`
        );

        if (!journalResult.ok) {
          const errorData = await journalResult.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${journalResult.status}`
          );
        }

        const journalResponse = await journalResult.json();
        console.log("journal: ", journalResponse);

        setJournalData(journalResponse.data as Journal[]);

        if (!journalResponse.data || !Array.isArray(journalResponse.data)) {
          throw new Error("Invalid data format received from the API.");
        }

        setJournalData(journalResponse.data as Journal[]);

        setTodoData(todoResult.data as TodoListRequest[]);

        if (!todoResult.data || !Array.isArray(todoResult.data)) {
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

  if (status === "loading") {
    return <LoadingSpinner />;
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
      {loading && <LoadingSpinner />}
      <div className="p-2">
        <span className="text-xl">Welcome back, </span>
        <span className="text-xl font-bold"> 🍡 {session?.user?.name} 🍡</span>

        <div>
          <h1 className="text-2xl font-bold text-white pt-2 pb-2">Dashboard</h1>{" "}
          {/* Updated title */}
          <div className="bg-[#f4f4f4] rounded-xl shadow-md flex justify-center text-[#212121] text-xl font-bold h-9">
            <p className="flex items-center">
              {" "}
              {isHidden ? "₱******" : `₱${totalAmount}`}
            </p>
            <button
              onClick={toggleVisibility}
              className="pl-4 text-[#6486DB] hover:text-[#2d4071]"
              aria-label={isHidden ? "Show Amount" : "Hide Amount"}
            >
              {isHidden ? (
                <EyeIcon className="h-5 w-5" />
              ) : (
                <EyeSlashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="flex justify-center pt-1 italic text-xs">Balance</p>
          <h1 className="text-xl font-bold text-white pt-2 pb-2">
            Recent Transactions
          </h1>{" "}
          <div>
            {data && <DahboardTable columns={trackerColumns} data={data} />}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white pt-4 pb-2">
            {" "}
            To-do List
          </h1>
        </div>
        <div>
          {todoData && (
            <DahboardTable
              columns={todolistColumn}
              data={todoData}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white pt-4 pb-2">
            {" "}
            Journal Entries
          </h1>
        </div>
        <div>
          {journalData && (
            <DahboardTable
              columns={journalColumn}
              data={journalData}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>
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
