"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { trackerColumns, FinancialTracker } from "@/components/columns";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/loading-indicator";
import TransactionItem from "@/components/financial-view-2";
import { BsTable, BsGrid3X3GapFill, BsSearch } from "react-icons/bs";
import { Button } from "@/components/ui/button";

const FinancialTrackerHistory: React.FC = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<FinancialTracker[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isTableView, setIsTableView] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<FinancialTracker[] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleView = () => {
    setIsTableView(!isTableView);
    setCurrentPage(1);
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

  useEffect(() => {
    if (data) {
      const filtered = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData(null);
    }
  }, [searchTerm, data]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }
  if (status === "unauthenticated" || !session) {
    return null;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  const groupTransactionsByDate = (transactions: FinancialTracker[]) => {
    const grouped: { [key: string]: FinancialTracker[] } = {};
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return grouped;
  };

  const getPaginatedTransactions = () => {
    if (!filteredData) return {};
  
    const grouped = groupTransactionsByDate(filteredData);
    const allTransactions = Object.values(grouped).flat();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
  
    const paginatedGrouped: { [key: string]: FinancialTracker[] } = {}; // Corrected type here
    paginatedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      if (!paginatedGrouped[date]) {
        paginatedGrouped[date] = [];
      }
      paginatedGrouped[date].push(transaction);
    });
  
    return paginatedGrouped;
  };

  const totalPages = filteredData
    ? Math.ceil(
        Object.values(groupTransactionsByDate(filteredData)).flat().length /
          itemsPerPage
      )
    : 0;

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white pt-2 pb-4">
          📜 Financial History
        </h1>
        <p>Total Amount</p>
        <div className="bg-[#f4f4f4] rounded-xl shadow-md flex justify-center text-[#212121] text-xl font-bold h-9">
          <p className="flex items-center">₱{totalAmount}</p>
        </div>
        <div className="pt-4">
          <div className="flex flex-row gap-4 items-center pb-4 ">
            <Button
              onClick={toggleView}
              className="bg-[#6486DB] text-white border-2 border-[#6486DB] hover:bg-[#F4F4F4] hover:text-[#6486DB]"
            >
              {isTableView ? <BsGrid3X3GapFill /> : <BsTable />}
            </Button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {isTableView ? (
            <div className="flex flex-col justify-center items-center">
              {Object.entries(getPaginatedTransactions()).map(
                ([date, transactions]) => (
                  <div
                    key={date}
                    className="mb-4 w-full flex flex-col items-center justify-center"
                  >
                    <h2 className="text-sm text-white mb-2">{date}</h2>
                    {transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        title={transaction.title || "N/A"}
                        date={new Date(transaction.date)}
                        time={transaction.time}
                        category={transaction.category}
                        amount={transaction.amount}
                        isCashOut={transaction.type === "Cash Out"}
                      />
                    ))}
                  </div>
                )
              )}
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                  className="bg-[#6486DB] text-white border-2 border-[#6486DB] hover:bg-[#f4f4f4] hover:text-[#6486DB]"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-white">Page {currentPage} of {totalPages}</span>
                <Button
                  className="bg-[#6486DB] text-white border-2 border-[#6486DB] hover:bg-[#f4f4f4] hover:text-[#6486DB]"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            filteredData && (
              <DataTable columns={trackerColumns} data={filteredData} />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default function FinancialTrackerHistoryWrapper() {
  return (
    <SessionProvider>
      <FinancialTrackerHistory />
    </SessionProvider>
  );
}