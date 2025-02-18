/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/new-entry.tsx
"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const NewEntryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [date, setDate] = useState("");
  const [done] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formType, setFormType] = useState("entry"); // 'entry' or 'category'

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !session) {
      redirect("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/categories?userId=${session?.user?.id}`
        );
        if (!response.ok) {
          const errorData = await response.json(); // Get error details from response
          throw new Error(errorData.error || "Failed to fetch categories"); // Display specific error if available
        }
        const data = await response.json();
        setCategories(data.data);
        if (data.data.length > 0) {
          setSelectedCategory(data.data[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err.message); // Set the error message for display
      }
    };

    if (session?.user?.id) {
      fetchCategories();
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
        category: selectedCategory,
        description,
        dueDate: date,
        done: done,
      };

      console.log("Request Body:", requestBody);
      const response = await fetch("/api/to-do-list", {
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

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/categories", {
        // Correct API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: newCategoryName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory.data]);
      setNewCategoryName("");
      setSelectedCategory(newCategory.data.id);
      setSuccessMessage("Category created successfully!");
      setFormType("entry"); // Switch back to entry form after creating category
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <svg
            className="animate-spin size-10 text-blue-500"
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
      <div className="flex flex-col items-center p-4">
        <h1 className="font-bold text-3xl pt-2 ">➕ To-do List ➕</h1>
        <RadioGroup
          defaultValue={formType}
          onValueChange={setFormType}
          className="mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entry" id="entry" />
            <Label htmlFor="entry">Add Entry</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="category" id="category" />
            <Label htmlFor="category">Create Category</Label>
          </div>
        </RadioGroup>

        {formType === "entry" ? (
          <form
            onSubmit={handleSubmitEntry}
            className="border-2 border-gray-500 p-4 rounded-md shadow-md grid grid-cols-3 gap-4 bg-[#F4F4F4] text-[#212121]"
          >
            <div className="col-span-3 flex justify-center">
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>

            <div className="col-span-3">
              <Input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="[&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-3xl text-center font-bold"
                required
              />
            </div>
            <div className="flex flex-row col-span-3 justify-center">
              <label
                htmlFor="description"
                className="flex items-center text-gray-500 text-xs italic"
              >
                To-do Description
              </label>
            </div>

            <div className="flex items-center">
              <label htmlFor="category">Category:</label>
            </div>
            <div className="col-span-2">
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6486DB] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date">Date:</label>
            </div>
            <div className="col-span-2">
              <Input
                type="date"
                id="dueDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border-[#6486DB] border-2 rounded-3xl"
              />
            </div>

            <div className="flex justify-center col-span-3">
              <Button type="submit" className="w-full bg-[#6486DB] text-white">
                Submit
              </Button>
            </div>
          </form>
        ) : (
          // Category Form
          <form
            onSubmit={handleSubmitCategory}
            className="border-2 border-gray-500 p-4 rounded-md shadow-md grid grid-cols-3 gap-4 bg-[#F4F4F4] text-[#212121]"
          >
            <div className="col-span-3 flex justify-center">
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>
            <div className="col-span-3">
              <Input
                type="text"
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name"
                className="border-[#6486DB] border-2 rounded-3xl text-center font-bold"
                required
              />
            </div>
            <div className="flex flex-row col-span-3 justify-center">
              <label
                htmlFor="newCategoryName"
                className="flex items-center text-gray-500 text-xs italic"
              >
                Category Name
              </label>
            </div>

            <div className="flex justify-center col-span-3">
              <Button type="submit" className="w-full bg-[#6486DB] text-white">
                Create Category
              </Button>
            </div>
          </form>
        )}
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
