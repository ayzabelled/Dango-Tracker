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
import LoadingSpinner from "@/components/loading-indicator";


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
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      setCategories(categories.filter((cat) => cat.id !== categoryId));
      if (selectedCategory === categoryId) {
        setSelectedCategory(categories.length > 0 ? categories[0].id : "");
      }
      setSuccessMessage("Category created successfully!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner/>
      }
      <div className="flex flex-col items-center p-4 h-screen">
        <h1 className="font-bold text-3xl pt-2 pb-2">➕ To-do List ➕</h1>
        <div className="border-2 border-[#6486DB] p-4 rounded-md shadow-md bg-[#F4F4F4] text-[#212121]"
        >
          
      
        <RadioGroup
          defaultValue={formType}
          onValueChange={setFormType}
          className=" flex justify-center"

        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entry" id="entry" />
            <Label htmlFor="entry">Add Entry</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="category" id="category" />
            <Label htmlFor="category">Create Category</Label>
          </div>
          <div className="flex items-center spsce-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">Existing Categories</Label>
          </div>
          

        </RadioGroup>

        {formType === "entry" ? (
          <form
            onSubmit={handleSubmitEntry}
            className="grid grid-cols-3 gap-4 bg-[#F4F4F4] text-[#212121]"

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
                className="bg-white [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2 rounded-3xl text-center font-bold"
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
                className="bg-white flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6486DB] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden border-[#6486DB] border-2"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label htmlFor="date">Date:</label>
            </div>
            <div className="col-span-2">
              <Input
                type="date"
                id="dueDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="border-[#6486DB] border-2 rounded-md bg-white"
              />
            </div>

            <div className="flex justify-center col-span-3">
              <Button type="submit" className="w-full bg-[#6486DB] text-white">
                Submit
              </Button>
            </div>
          </form>
        ) :
        formType === "existing" ? (
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Existing Categories</h3>
            <div className="col-span-3 flex justify-center">
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
            </div>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between mb-1">
                  {cat.name}
                  <Button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-red-500 text-white rounded-md px-2 py-1"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )
        : (
          // Category Form
          <form
            onSubmit={handleSubmitCategory}
            className=" grid grid-cols-3 gap-4 text-[#212121]"

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
                className="border-[#6486DB] border-2 rounded-3xl text-center bg-white"
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
