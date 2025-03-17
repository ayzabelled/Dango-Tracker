"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns"; // Import date-fns (install it: npm install date-fns)
import Link from "next/link";

export type FinancialTracker = {
  userid: string;
  id: string;
  title: string;
  amount: number;
  category: string;
  type: string;
  date: Date;
  time: string;
  received: boolean;
};

export const trackerColumns: ColumnDef<FinancialTracker>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const type: string = row.getValue("type");
      let className =
        "flex justify-center rounded-md px-2 py-1 text-sm font-bold"; // Default styles

      if (type === "Cash In") {
        className += " bg-green-100 text-green-700 border-green-700 border-2"; // Add Cash In specific styles
      } else if (type === "Cash Out") {
        className += " bg-red-100 text-red-700 border-red-700 border-2"; 
      }

      return <div className={className}>{type}</div>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      return <div className="flex text-justify justify-center">{title}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="flex justify-center">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("fil-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);

      return <div className="flex justify-center whitespace-nowrap">{formatted}</div>;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const category: string = row.getValue("category");
      return <div className="flex text-justify justify-center">{category}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const dateString: string = row.getValue("date");
      const date = new Date(dateString); // Create a Date object

      if (isNaN(date.getTime())) {
        // Check for invalid date
        return <div className="flex justify-center">Invalid Date</div>;
      }

      const formattedDate = format(date, "MM-dd-yyyy"); // Format the date
      return <div className="flex justify-center">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "time",
    header: () => <div className="flex justify-center">Time</div>,
    cell: ({ row }) => {
      const time: string = row.getValue("time");
      return <div className="flex justify-center">{time}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original; // Get the original data object

      const handleDelete = async () => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this entry?"
        );
        if (confirmDelete) {
          try {
            const response = await fetch(
              `/api/financial-tracker?id=${item.id}`,
              {
                // Send id as query parameter
                method: "DELETE",
              }
            );

            if (!response.ok) {
              const errorData = await response.json(); // Try to parse error from server
              const errorMessage =
                errorData.error || `HTTP error! status: ${response.status}`;
              console.error("Failed to delete entry:", errorMessage);
              alert(`Error deleting: ${errorMessage}`); // Alert the user to the error
            } else {
              // Refresh the page or update the table data
              window.location.reload(); // Simplest way: reload the page
              // Or, if you are managing the data in state:
              // const newData = data.filter((entry) => entry.id !== item.id);
              // setData(newData);
            }
          } catch (error) {
            console.error("Error deleting entry:", error);
            alert("An error occurred during deletion."); // Alert the user
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-bold">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 text-xs hover:text-white hover:bg-red-500"
              onClick={handleDelete} // Call the handleDelete function
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export type TodoListRequest = {
  id: string;
  userId: string;
  categoryname: string;
  description: string;
  dueDate: string;
  done: boolean;
};

export const todolistColumn: ColumnDef<TodoListRequest>[] = [
  {
    accessorKey: "done",
    header: () => <div className="flex justify-center">✅</div>,
    cell: ({ row }) => {
      const handleCheckboxChange = async (checked: boolean) => {
        row.original.done = checked;

        // Make API call to update the received value
        const response = await fetch(`/api/to-do-list?id=${row.original.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            done: checked,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update received status");
        } else {
          // Refresh the page after successful update
          window.location.reload();
        }
      };

      return (
        <div className="flex justify-center">
          <Checkbox
            checked={row.original.done}
            onCheckedChange={handleCheckboxChange}
            aria-label="Select row"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "categoryname",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const categoryname: string = row.getValue("categoryname");
      return <div className="flex justify-center">{categoryname}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const description: string = row.getValue("description");
      return <div className="flex justify-center">{description}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const dateString: string = row.getValue("dueDate");
      const date = new Date(dateString); // Create a Date object

      if (isNaN(date.getTime())) {
        // Check for invalid date
        return <div className="flex justify-center">Invalid Date</div>;
      }

      const formattedDate = format(date, "MM-dd-yyyy"); // Format the date
      return <div className="flex justify-center">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original; // Get the original data object

      const handleDelete = async () => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this entry?"
        );
        if (confirmDelete) {
          try {
            const response = await fetch(`/api/to-do-list?id=${item.id}`, {
              // Send id as query parameter
              method: "DELETE",
            });

            if (!response.ok) {
              const errorData = await response.json(); // Try to parse error from server
              const errorMessage =
                errorData.error || `HTTP error! status: ${response.status}`;
              console.error("Failed to delete entry:", errorMessage);
              alert(`Error deleting: ${errorMessage}`); // Alert the user to the error
            } else {
              // Refresh the page or update the table data
              window.location.reload(); // Simplest way: reload the page
              // Or, if you are managing the data in state:
              // const newData = data.filter((entry) => entry.id !== item.id);
              // setData(newData);
            }
          } catch (error) {
            console.error("Error deleting entry:", error);
            alert("An error occurred during deletion."); // Alert the user
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-bold">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 text-xs hover:text-white hover:bg-red-500"
              onClick={handleDelete} // Call the handleDelete function
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export type Journal = {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
};

export const journalColumn: ColumnDef<Journal>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const dateString: string = row.getValue("date");
      const date = new Date(dateString); // Create a Date object

      if (isNaN(date.getTime())) {
        // Check for invalid date
        return <div className="flex justify-center">Invalid Date</div>;
      }

      const formattedDate = format(date, "MM-dd-yyyy"); // Format the date
      return <div className="flex justify-center">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      return <div className="flex justify-center overflow-ellipsis">{title}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }: { row: { original: Journal } }) => {
      const description = row.original.description;
      const truncatedDescription = description.length > 15 ? description.substring(0, 15) + "..." : description; // Truncate

      return (
          <div className="flex justify-center overflow-ellipsis"> {/* Keep overflow-ellipsis for extra safety */}
              {truncatedDescription}
          </div>
      );
  },

  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Journal } }) => { 
        const item = row.original;

        const handleDelete = async () => {
            const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
            if (confirmDelete) {
                try {
                    const response = await fetch(`/api/journal?id=${item.id}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                        console.error("Failed to delete entry:", errorMessage);
                        alert(`Error deleting: ${errorMessage}`);
                    } else {
                        window.location.reload(); // Or update state if managing data in state
                    }
                } catch (error) {
                    console.error("Error deleting entry:", error);
                    alert("An error occurred during deletion.");
                }
            }
        };
        

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs font-bold">
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`journal/view-entry/${item.id}`} legacyBehavior>
                        <DropdownMenuItem className="text-blue-500 text-xs hover:text-white hover:bg-blue-500">
                            View
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />

                    <Link href={`journal/edit-entry/${item.id}`} legacyBehavior>
                        <DropdownMenuItem className="text-yellow-500 text-xs hover:text-white hover:bg-yellow-500">
                            Edit
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-red-500 text-xs hover:text-white hover:bg-red-500"
                        onClick={handleDelete}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    },
},
];
