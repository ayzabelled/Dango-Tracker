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
import { format } from 'date-fns'; // Import date-fns (install it: npm install date-fns)


export type FinancialTracker = {
  userid: string;
  id: string;
  amount: string;
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
      return <div className="flex justify-center">{type}</div>;
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

      return <div className="flex justify-center">{formatted}</div>;
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
      return <div className="flex justify-center">{category}</div>;
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

      if (isNaN(date.getTime())) { // Check for invalid date
        return <div className="flex justify-center">Invalid Date</div>;
      }
      
      const formattedDate = format(date, 'MM-dd-yyyy'); // Format the date
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
        const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
        if (confirmDelete) {
          try {
            const response = await fetch(`/api/financial-tracker?id=${item.id}`, { // Send id as query parameter
              method: "DELETE",
            });
  
            if (!response.ok) {
              const errorData = await response.json(); // Try to parse error from server
              const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
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
  category: string;
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
        const response = await fetch(`/api/to-do-list`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: row.original.id,
            received: checked,
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
      return <div className="flex justify-center">{category}</div>;
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

      if (isNaN(date.getTime())) { // Check for invalid date
        return <div className="flex justify-center">Invalid Date</div>;
      }
      
      const formattedDate = format(date, 'MM-dd-yyyy'); // Format the date
      return <div className="flex justify-center">{formattedDate}</div>;
    },
  },
];