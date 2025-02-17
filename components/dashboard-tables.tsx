"use client"

import {
  ColumnDef,
  InitialTableState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onCheckboxChange?: (id: string) => Promise<void>;
}


export function DahboardTable<TData extends { id: string; received: boolean; category: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = React.useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      ...{} as InitialTableState,
      pageSize: 5,
  } as InitialTableState,

  });

  return (
    <div>
    <div className="rounded-md border flex-justify-center max-h-3/4 overflow-y-auto">
      <Table>
        <TableHeader className="bg-[#6486DB]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className="text-white font-bold" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="bg-[#f4f4f4] text-[#212121]">
        {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const category = row.original.category; // Access the category

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`${category === 'cashIn' ? 'bg-green-100' : category === 'cashOut' ? 'bg-red-100' : ''}`} // Conditional styling
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No Data
                </TableCell>
              </TableRow>
            )}

        </TableBody>
      </Table>
    </div>
      </div>
  );
}
