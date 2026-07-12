'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData> {
  columns: {
    header: string;
    accessorKey: keyof TData;
    cell?: (item: TData) => React.ReactNode;
  }[];
  data: TData[];
  emptyTitle?: string;
}

export function DataTable<TData>({ columns, data, emptyTitle = "No results found" }: DataTableProps<TData>) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i} className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
                {columns.map((column, j) => (
                  <TableCell key={j} className="text-sm">
                    {column.cell ? column.cell(row) : String(row[column.accessorKey] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                {emptyTitle}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
