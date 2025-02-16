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
import { useRouter } from "next/navigation";
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
      const router = useRouter();
  
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

export type CustomersList = {
  name: string; // from customers api
  customer_id: string; // the rest from laundry_items api
  id: string;
  created_at: Date;
  amount_of_laundry: number;
  extras: string;
  total_price: number;
  received: boolean;
};

export const listColumn: ColumnDef<CustomersList>[] = [
  {
    accessorKey: "received",
    header: () => <div className="flex justify-center">✅</div>,
    cell: ({ row }) => {
      const handleCheckboxChange = async (checked: boolean) => {
        row.original.received = checked;

        // Make API call to update the received value
        const response = await fetch(`/api/laundry`, {
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
            checked={row.original.received}
            onCheckedChange={handleCheckboxChange}
            aria-label="Select row"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="flex justify-center">Name</div>,
    cell: ({ row }) => {
      const customer: string = row.getValue("name");
      return <div className="flex justify-center">{customer}</div>;
    },
  },
  {
    accessorKey: "number",
    header: () => <div className="flex justify-center">Phone No.</div>,
    cell: ({ row }) => {
      const number = parseFloat(row.getValue("number"));
      return <div className="flex justify-center">{number}</div>;
    },
  },
  {
    accessorKey: "amount_of_laundry",
    header: () => <div className="flex justify-center">🧺</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_of_laundry"));
      return <div className="flex justify-center">{amount}</div>;
    },
  },
  {
    accessorKey: "total_price",
    header: () => <div className="flex justify-center">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_price"));
      const formatted = new Intl.NumberFormat("fil-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);

      return <div className="flex justify-center">{formatted}</div>;
    },
  },
];

export const laundryHistory: ColumnDef<CustomersList>[] = [
  {
    accessorKey: "received",
    header: () => <div className="flex justify-center">✅</div>,
    cell: ({ row }) => {
      const handleCheckboxChange = async (checked: boolean) => {
        row.original.received = checked;

        // Make API call to update the received value
        const response = await fetch(`/api/laundry`, {
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
            checked={row.original.received}
            onCheckedChange={handleCheckboxChange}
            aria-label="Select row"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="flex justify-center">Created</div>,
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");
        if (typeof createdAt === 'string') {

        const date = new Date(createdAt); 
        const formattedDate = date.toLocaleString(); 
        return <div className="flex justify-center">{formattedDate}</div>;
  
      } else if (createdAt instanceof Date) { 
          const formattedDate = createdAt.toLocaleString(); 
          return <div className="flex justify-center">{formattedDate}</div>;
      } else {
        console.error("Invalid date:", createdAt);
        return <div className="flex justify-center">Invalid Date</div>;
      }
    },
  },
  {
    accessorKey: "amount_of_laundry",
    header: () => <div className="flex justify-center">🧺</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_of_laundry"));
      return <div className="flex justify-center">{amount}</div>;
    },
  },
  {
    accessorKey: "total_price",
    header: () => <div className="flex justify-center">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_price"));
      const formatted = new Intl.NumberFormat("fil-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);

      return <div className="flex justify-center">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const history = row.original;

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
              onClick={async () => {
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this entry?"
                );
                if (confirmDelete) {
                  const response = await fetch(`/api/laundry`, {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: history.id }),
                  });

                  if (!response.ok) {
                    console.error("Failed to delete entry");
                  } else {
                    // Refresh the page after successful deletion
                    window.location.reload();
                  }
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
